'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { loginAction, AuthActionResult } from '@/lib/actions/auth-actions';

const LoginPage = () => {
    const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
        loginAction,
        null
    );
    const searchParams = useSearchParams();
    const resetSuccess = searchParams.get('reset') === 'success';

    return (
        <div className="auth-container">
            {/* overlay */}
            <div className="overlay" />
            <Image src="/2.jpg" alt="image" fill className='absolute top-0 right-0' style={{ zIndex: -10 }} />
            
            <div className='flex rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800'>
                <div className="auth-card z-[10]">
                    <div className="auth-header">
                        <div className="auth-brand">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <h1 className="auth-title">تسجيل الدخول</h1>
                        <p className="auth-description">مرحباً بك، يرجى إدخال بيانات حسابك للمتابعة</p>
                    </div>

                    {resetSuccess && (
                        <div className="alert-success" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '0.875rem' }}>
                            تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
                        </div>
                    )}

                    {state?.error && <div className="alert-error" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.875rem' }}>{state.error}</div>}

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

                        <div className="form-group">
                            <div className="flex items-center">
                                <label className="form-label" htmlFor="password">كلمة المرور</label>
                                <span className='star-req'>*</span>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                disabled={isPending}
                                required
                            />
                        </div>

                        <div className=' -mt-5 text-end'>
                            <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
                                نسيت كلمة المرور؟
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isPending}
                        >
                            {isPending ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </form>
                </div>
                <img src="1.jpeg" alt="image" className='hidden md:block' />
            </div>
        </div>
    );
}

export default LoginPage;