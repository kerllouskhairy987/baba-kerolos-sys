import OtpCountdown from "@/components/OtpCountdown";
import Image from "next/image";
import { Suspense } from "react";

function VerifyForm() {

    const handleResend = () => {

    };

    return (
        <div className="auth-container">
            {/* overlay */}
            <div className="overlay" />
            <Image src="/2.jpg" alt="image" fill className='absolute top-0 right-0' style={{ zIndex: -10 }} />

            <div className="auth-card rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
                <div className="auth-header">
                    <div className="auth-brand">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h1 className="auth-title">تأكيد رمز التحقق</h1>
                    <p className="auth-description">
                        أدخل رمز التحقق المرسل إلى رقم هاتفك عبر واتساب.
                    </p>
                </div>

                {/* {error && <div className="alert-error">{error}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>} */}

                <form>
                    <div className="form-group">
                        <label className="form-label" htmlFor="otp">رمز التحقق</label>
                        <input
                            id="otp"
                            type="text"
                            className="form-input otp-input"
                            placeholder="123456"
                            maxLength={6}
                            //   value={otp}
                            //   onChange={(e) => setOtp(e.target.value)}
                            //   disabled={loading}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={false}>
                        {false ? 'جاري التأكيد...' : 'تأكيد الرمز'}
                    </button>
                </form>

                <OtpCountdown />
            </div>
        </div>
    );
}
const VerifyPage = () => {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-card">جاري التحميل...</div></div>}>
            <VerifyForm />
        </Suspense>
    )
}

export default VerifyPage