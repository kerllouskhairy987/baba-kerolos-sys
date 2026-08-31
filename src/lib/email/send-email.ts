import nodemailer from 'nodemailer';

export const SENDER_EMAIL = 'fr.sergious.habib@gmail.com';

/**
 * Creates and returns a Nodemailer transporter configured for Gmail SMTP.
 */
function createTransporter() {
  const user = process.env['GMAIL_USER'] || SENDER_EMAIL;
  const pass = process.env['GMAIL_APP_PASSWORD'];

  if (!pass || pass === 'your_gmail_app_password_here' || pass.trim() === '') {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a password reset verification code email to fr.sergious.habib@gmail.com.
 */
export async function sendVerificationCodeEmail(
  toEmail: string,
  verificationCode: string
): Promise<SendEmailResult> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      '[EMAIL WARNING] GMAIL_APP_PASSWORD is not configured in .env. Email sending skipped.'
    );
    return {
      success: false,
      error:
        'لم يتم إعداد كلمة مرور تطبيق Gmail في ملف .env (GMAIL_APP_PASSWORD). يرجى إضافتها لتفعيل إرسال البريد.',
    };
  }

  const htmlContent = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 5px;"> استعادة كلمة المرور</h2>
        <p style="color: #6b7280; font-size: 14px;">رمز التحقق الخاص بحسابك</p>
      </div>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">استخدم الرمز التالي لإعادة تعيين كلمة المرور:</p>
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8; display: inline-block; font-family: monospace;">${verificationCode}</span>
        <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">هذا الرمز صالحة لمدة 10 دقائق فقط واستخدام مرة واحدة.</p>
      </div>

      <p style="color: #6b7280; font-size: 13px; text-align: center;">
        إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"كيرلس" <${SENDER_EMAIL}>`,
      to: toEmail,
      subject: `رمز التحقق الخاص بك: ${verificationCode}`,
      text: `رمز التحقق الخاص بك هو: ${verificationCode} (صالحة لمدة 10 دقائق)`,
      html: htmlContent,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[EMAIL ERROR] Failed to send email:', err?.message || err);
    return {
      success: false,
      error: 'حدث خطأ أثناء إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.',
    };
  }
}
