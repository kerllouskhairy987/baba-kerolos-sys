import { z } from 'zod';

export const SINGLE_ALLOWED_EMAIL = 'montasergohar@gmail.com';

/**
 * Zod schema for validating the single allowed email.
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'البريد الإلكتروني مطلوب')
  .email('البريد الإلكتروني غير صالحة')
  .refine(
    (val) => val.toLowerCase() === SINGLE_ALLOWED_EMAIL.toLowerCase(),
    'غير مسموح بهذا البريد الإلكتروني. هذا النظام مخصص لمستخدم واحد فقط.'
  );

/**
 * Zod schema for login form validation.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

/**
 * Zod schema for requesting password reset code.
 */
export const requestResetSchema = z.object({
  email: emailSchema,
});

/**
 * Zod schema for 6-digit OTP verification code.
 */
export const verifyCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, 'رمز التحقق يجب أن يتكون من 6 أرقام')
    .regex(/^\d{6}$/, 'رمز التحقق يجب أن ينطوي على أرقام فقط'),
});

/**
 * Zod schema for resetting password.
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'كلمة المرور يجب أن لا تقل عن 8 أحرف'),
    confirmPassword: z
      .string()
      .min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RequestResetInput = z.infer<typeof requestResetSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
