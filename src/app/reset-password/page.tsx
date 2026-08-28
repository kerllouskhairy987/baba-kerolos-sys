import Image from 'next/image';
import React, { Suspense } from 'react'

function ResetPasswordForm() {
    return (
        <div className="auth-container">
            <div className="auth-card rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
                <div className="auth-header">
                    <div className="auth-brand">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <h1 className="auth-title">إعادة تعيين كلمة المرور</h1>
                    <p className="auth-description">
                        أدخل كلمة المرور الجديدة لحسابك وتأكد من حفظها جيداً.
                    </p>
                </div>

                {/* {error && <div className="alert-error">{error}</div>}
        {success && (
          <div className="alert-success">
            تم تغيير كلمة المرور بنجاح! جاري تحويلك لتسجيل الدخول...
          </div>
        )} */}

                <form >
                    <div className="form-group">
                        <div className="flex items-center">
                        <label className="form-label" htmlFor="password">كلمة المرور الجديدة</label>
                        <span className='star-req'>*</span>
                        </div>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            autoFocus
                            //   value={password}
                            //   onChange={(e) => setPassword(e.target.value)}
                            //   disabled={loading || success}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div className="flex items-center">
                            <label className="form-label" htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                            <span className='star-req'>*</span>
                        </div>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            //   value={confirmPassword}
                            //   onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={false || false}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={false || false}>
                        {false ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
                    </button>
                </form>
            </div>
        </div>
    );
}
const ResetPasswordPage = () => {
    return (
        <>
            {/* overlay */}
            <div className="overlay" />
            <Image src="/2.jpg" alt="image" fill className='absolute top-0 right-0' style={{ zIndex: -10 }} />

            <Suspense fallback={<div className="auth-container"><div className="auth-card">جاري التحميل...</div></div>}>
                <ResetPasswordForm />
            </Suspense>
        </>
    );
}

export default ResetPasswordPage