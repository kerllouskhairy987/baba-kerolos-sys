'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { requestPasswordResetAction, AuthActionResult } from '@/lib/actions/auth-actions';

const ForgotPasswordPage = () => {
    const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
        requestPasswordResetAction,
        null
    );

    return (
        <div className="auth-container">
            {/* overlay */}
            <div className="overlay" />
            <Image src="/2.jpg" alt="image" fill className='absolute top-0 right-0' style={{ zIndex: -10 }} />

            <div className="auth-card rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
                <div className="auth-header">
                    <div className="auth-brand">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                        </svg>
                    </div>
                    <h1 className="auth-title">استعادة كلمة المرور</h1>
                    <p className="auth-description">
                        أدخل البريد الإلكتروني المرتبط بحسابك لإرسال رمز التحقق عبر البريد الإلكتروني.
                    </p>
                </div>

                {state?.error && (
                    <div className="alert-error" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.875rem' }}>
                        {state.error}
                    </div>
                )}

                <form action={formAction}>
                    <div className="form-group">
                        <div className="flex items-center">
                            <label className="form-label" htmlFor="email">البريد الإلكتروني</label>
                            <span className='star-req'>*</span>
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-input phone-input"
                            placeholder="example@email.com"
                            autoFocus
                            disabled={isPending}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={isPending}>
                        {isPending ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link href="/login" className="text-sm text-blue-500 hover:underline">
                        العودة إلى تسجيل الدخول
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;