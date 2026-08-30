'use server';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import {
  createSession,
  revokeSession,
  revokeAllUserSessions,
  hashToken,
} from '@/lib/auth/session';
import {
  SINGLE_ALLOWED_EMAIL,
  loginSchema,
  requestResetSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} from '@/lib/auth/validation';
import { sendVerificationCodeEmail } from '@/lib/email/send-email';

export interface AuthActionResult {
  error?: string;
  success?: boolean;
  message?: string;
}

/**
 * Low-level AuthRateLimit helpers
 */
async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15
): Promise<{ allowed: boolean; blockedUntil?: string }> {
  const existing = await db.orm.public.AuthRateLimit.where({ key }).first();
  if (!existing) {
    return { allowed: true };
  }

  const nowMs = Date.now();

  // If blocked, check if block window has expired
  if (existing.blockedUntil) {
    const blockedUntilMs = new Date(existing.blockedUntil).getTime();
    if (nowMs < blockedUntilMs) {
      return { allowed: false, blockedUntil: existing.blockedUntil };
    }
  }

  // If rate limit window has expired, reset
  const windowStartedAtMs = new Date(existing.windowStartedAt).getTime();
  if (nowMs - windowStartedAtMs > windowMinutes * 60 * 1000) {
    await db.orm.public.AuthRateLimit.where({ id: existing.id }).update({
      attempts: 0,
      windowStartedAt: new Date().toISOString(),
      blockedUntil: undefined,
    });
    return { allowed: true };
  }

  return { allowed: existing.attempts < maxAttempts };
}

async function recordRateLimitAttempt(
  key: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15
): Promise<void> {
  const existing = await db.orm.public.AuthRateLimit.where({ key }).first();
  const nowIso = new Date().toISOString();

  if (!existing) {
    await db.orm.public.AuthRateLimit.create({
      key,
      attempts: 1,
      windowStartedAt: nowIso,
    });
    return;
  }

  const newAttempts = existing.attempts + 1;
  let blockedUntil: string | undefined = undefined;

  if (newAttempts >= maxAttempts) {
    blockedUntil = new Date(Date.now() + windowMinutes * 60 * 1000).toISOString();
  }

  await db.orm.public.AuthRateLimit.where({ id: existing.id }).update({
    attempts: newAttempts,
    blockedUntil,
  });
}

async function resetRateLimit(key: string): Promise<void> {
  const existing = await db.orm.public.AuthRateLimit.where({ key }).first();
  if (existing) {
    await db.orm.public.AuthRateLimit.where({ id: existing.id }).update({
      attempts: 0,
      blockedUntil: undefined,
    });
  }
}

/**
 * 1. Login Server Action
 */
export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const emailRaw = formData.get('email')?.toString() || '';
  const passwordRaw = formData.get('password')?.toString() || '';

  const validation = loginSchema.safeParse({
    email: emailRaw,
    password: passwordRaw,
  });

  if (!validation.success) {
    const issue = validation.error.issues[0]?.message || 'بيانات غير صالحة';
    return { error: issue };
  }

  const { email, password } = validation.data;
  const rateLimitKey = `login:${email.toLowerCase()}`;

  const rateCheck = await checkRateLimit(rateLimitKey, 5, 15);
  if (!rateCheck.allowed) {
    return {
      error: 'تم حظر محاولات تسجيل الدخول مؤقتاً لكثرة المحاولات الخاطئة. يرجى المحاولة لاحقاً بعد 15 دقيقة.',
    };
  }

  const user = await db.orm.public.User.first({ email: SINGLE_ALLOWED_EMAIL });
  if (!user || !user.passwordHash) {
    await recordRateLimitAttempt(rateLimitKey, 5, 15);
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    await recordRateLimitAttempt(rateLimitKey, 5, 15);
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  }

  // Clear rate limit & create session
  await resetRateLimit(rateLimitKey);
  await createSession(user.id);

  redirect('/');
}

/**
 * 2. Logout Server Action
 */
export async function logoutAction(): Promise<never> {
  await revokeSession();
  redirect('/login');
}

/**
 * 3. Forgot Password Request Server Action
 */
export async function requestPasswordResetAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const emailRaw = formData.get('email')?.toString() || '';

  const validation = requestResetSchema.safeParse({ email: emailRaw });
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'البريد الإلكتروني غير صالح' };
  }

  const rateLimitKey = `reset_request:${SINGLE_ALLOWED_EMAIL}`;
  const rateCheck = await checkRateLimit(rateLimitKey, 3, 15);
  if (!rateCheck.allowed) {
    return {
      error: 'تم حظر طلبات إعادة التعيين مؤقتاً لكثرة المحاولات. يرجى الانتظار 15 دقيقة.',
    };
  }

  const user = await db.orm.public.User.first({ email: SINGLE_ALLOWED_EMAIL });
  if (!user) {
    return { error: 'المستخدم غير موجود' };
  }

  const nowIso = new Date().toISOString();
  const existingChallenges = await db.orm.public.PasswordResetChallenge
    .where({ userId: user.id as any })
    .all();

  // Check if an unexpired challenge exists with an active resend cooldown
  const activeChallenge = existingChallenges.find(
    (c) =>
      !c.consumedAt &&
      !c.verifiedAt &&
      new Date(c.expiresAt).getTime() > Date.now()
  );

  if (
    activeChallenge &&
    activeChallenge.resendAvailableAt &&
    new Date(activeChallenge.resendAvailableAt).getTime() > Date.now()
  ) {
    const secondsRemaining = Math.ceil(
      (new Date(activeChallenge.resendAvailableAt).getTime() - Date.now()) / 1000
    );
    return { error: `يرجى الانتظار ${secondsRemaining} ثانية قبل طلب رمز جديد.` };
  }

  // Generate 6-digit numeric OTP
  const otpCode = crypto.randomInt(100000, 999999).toString();
  const codeHash = hashToken(otpCode);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins
  const resendAvailableAt = new Date(Date.now() + 60 * 1000).toISOString(); // 60 secs

  // Send email FIRST
  const emailResult = await sendVerificationCodeEmail(SINGLE_ALLOWED_EMAIL, otpCode);
  if (!emailResult.success) {
    return {
      error: emailResult.error || 'فشل إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.',
    };
  }

  // Invalidate previous unconsumed challenges
  for (const c of existingChallenges) {
    if (!c.consumedAt && !c.verifiedAt) {
      await db.orm.public.PasswordResetChallenge.where({ id: c.id }).update({
        consumedAt: nowIso,
      });
    }
  }

  // Store new hashed challenge
  await db.orm.public.PasswordResetChallenge.create({
    userId: user.id as any,
    codeHash,
    expiresAt,
    resendAvailableAt,
    attempts: 0,
  });

  await recordRateLimitAttempt(rateLimitKey, 3, 15);

  redirect('/verify');
}

/**
 * 4. Verify Reset Code Server Action
 */
export async function verifyResetCodeAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const otpRaw = formData.get('otp')?.toString() || formData.get('code')?.toString() || '';

  const validation = verifyCodeSchema.safeParse({ code: otpRaw });
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'رمز التحقق غير صالح' };
  }

  const user = await db.orm.public.User.first({ email: SINGLE_ALLOWED_EMAIL });
  if (!user) {
    return { error: 'المستخدم غير موجود' };
  }

  const existingChallenges = await db.orm.public.PasswordResetChallenge
    .where({ userId: user.id as any })
    .all();

  const activeChallenge = existingChallenges.find(
    (c) =>
      !c.consumedAt &&
      !c.verifiedAt &&
      new Date(c.expiresAt).getTime() > Date.now()
  );

  if (!activeChallenge) {
    return { error: 'رمز التحقق غير صالح أو انتهت صلاحيته. يرجى طلب رمز جديد.' };
  }

  if (activeChallenge.attempts >= 5) {
    await db.orm.public.PasswordResetChallenge.where({ id: activeChallenge.id }).update({
      consumedAt: new Date().toISOString(),
    });
    return {
      error: 'تم تجاوز عدد المحاولات المسموح بها (5 محاولات). يرجى طلب رمز جديد.',
    };
  }

  const submittedHash = hashToken(validation.data.code);

  if (submittedHash !== activeChallenge.codeHash) {
    const newAttempts = activeChallenge.attempts + 1;
    await db.orm.public.PasswordResetChallenge.where({ id: activeChallenge.id }).update({
      attempts: newAttempts,
    });

    if (newAttempts >= 5) {
      await db.orm.public.PasswordResetChallenge.where({ id: activeChallenge.id }).update({
        consumedAt: new Date().toISOString(),
      });
      return { error: 'تم تجاوز عدد المحاولات المسموح بها. يرجى طلب رمز جديد.' };
    }

    return { error: `رمز التحقق غير صحيح. متبقي ${5 - newAttempts} محاولات.` };
  }

  // OTP verified successfully: issue reset token
  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = hashToken(rawResetToken);
  const nowIso = new Date().toISOString();

  await db.orm.public.PasswordResetChallenge.where({ id: activeChallenge.id }).update({
    verifiedAt: nowIso,
    resetTokenHash,
  });

  const cookieStore = await cookies();
  cookieStore.set('reset_token', rawResetToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
  });

  redirect('/reset-password');
}

/**
 * 5. Resend Reset Code Server Action
 */
export async function resendResetCodeAction(): Promise<AuthActionResult> {
  const user = await db.orm.public.User.first({ email: SINGLE_ALLOWED_EMAIL });
  if (!user) {
    return { error: 'المستخدم غير موجود' };
  }

  const existingChallenges = await db.orm.public.PasswordResetChallenge
    .where({ userId: user.id as any })
    .all();

  const activeChallenge = existingChallenges.find(
    (c) => !c.consumedAt && new Date(c.expiresAt).getTime() > Date.now()
  );

  if (
    activeChallenge &&
    activeChallenge.resendAvailableAt &&
    new Date(activeChallenge.resendAvailableAt).getTime() > Date.now()
  ) {
    const secondsRemaining = Math.ceil(
      (new Date(activeChallenge.resendAvailableAt).getTime() - Date.now()) / 1000
    );
    return { error: `يرجى الانتظار ${secondsRemaining} ثانية قبل طلب إعادة الإرسال.` };
  }

  const otpCode = crypto.randomInt(100000, 999999).toString();
  const codeHash = hashToken(otpCode);

  const emailResult = await sendVerificationCodeEmail(SINGLE_ALLOWED_EMAIL, otpCode);
  if (!emailResult.success) {
    return {
      error: emailResult.error || 'فشل إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.',
    };
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const resendAvailableAt = new Date(Date.now() + 60 * 1000).toISOString();

  if (activeChallenge) {
    await db.orm.public.PasswordResetChallenge.where({ id: activeChallenge.id }).update({
      codeHash,
      attempts: 0,
      expiresAt,
      resendAvailableAt,
    });
  } else {
    await db.orm.public.PasswordResetChallenge.create({
      userId: user.id as any,
      codeHash,
      expiresAt,
      resendAvailableAt,
      attempts: 0,
    });
  }

  return { success: true, message: 'تم إعادة إرسال رمز التحقق بنجاح' };
}

/**
 * 6. Reset Password Server Action
 */
export async function resetPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const password = formData.get('password')?.toString() || '';
  const confirmPassword = formData.get('confirmPassword')?.toString() || '';

  const validation = resetPasswordSchema.safeParse({ password, confirmPassword });
  if (!validation.success) {
    const issue = validation.error.issues[0]?.message || 'كلمة المرور غير صالحة';
    return { error: issue };
  }

  const cookieStore = await cookies();
  const rawResetToken = cookieStore.get('reset_token')?.value;

  if (!rawResetToken) {
    return { error: 'جلسة إعادة التعيين غير صالحة أو انتهت صلاحيتها. يرجى البدء من جديد.' };
  }

  const resetTokenHash = hashToken(rawResetToken);

  const challengeRecord = await db.orm.public.PasswordResetChallenge
    .where({ resetTokenHash })
    .first();

  if (!challengeRecord || !challengeRecord.verifiedAt || challengeRecord.consumedAt) {
    cookieStore.delete('reset_token');
    return { error: 'جلسة إعادة التعيين غير صالحة أو تم استخدامها بالفعل.' };
  }

  if (new Date(challengeRecord.expiresAt).getTime() <= Date.now()) {
    cookieStore.delete('reset_token');
    return { error: 'انتهت صلاحية جلسة إعادة التعيين. يرجى طلب رمز جديد.' };
  }

  const user = await db.orm.public.User.first({ email: SINGLE_ALLOWED_EMAIL });
  if (!user || user.id !== challengeRecord.userId) {
    cookieStore.delete('reset_token');
    return { error: 'المستخدم غير صالح' };
  }

  const newPasswordHash = await hashPassword(validation.data.password);
  const nowIso = new Date().toISOString();

  // Atomic database transaction
  await db.transaction(async (tx) => {
    // 1. Update user password
    await tx.orm.public.User.where({ id: user.id }).update({
      passwordHash: newPasswordHash,
      passwordChangedAt: nowIso,
    });

    // 2. Consume challenge
    await tx.orm.public.PasswordResetChallenge.where({ id: challengeRecord.id }).update({
      consumedAt: nowIso,
    });
  });

  // 3. Revoke all active user sessions & clear session cookie
  await revokeAllUserSessions(user.id);

  // 4. Clear reset token cookie
  cookieStore.delete('reset_token');

  redirect('/login?reset=success');
}
