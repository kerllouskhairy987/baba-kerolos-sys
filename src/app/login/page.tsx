import Image from 'next/image';
import Link from 'next/link';

const LoginPage = () => {
    return (
        <div className="auth-container">
            {/* overlay */}
            <div className="overlay" />
            <Image src="/2.jpg" alt="image" fill className='absolute top-0 right-0' style={{ zIndex: -10 }} />
            
            <div className='flex rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800'>
                <div className="auth-card  z-[10]">
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

                    {/* {error && <div className="alert-error">{error}</div>} */}

                    <form >
                        <div className="form-group">
                            <div className="flex items-center">
                                <label className="form-label" htmlFor="email">البريد الإلكتروني</label>
                                <span className='star-req'>*</span>
                            </div>
                            <input
                                id="email"
                                type="email"
                                className="form-input phone-input"
                                placeholder="example@email.com"
                                autoFocus
                                // value={phone}
                                // onChange={(e) => setPhone(e.target.value)}
                                // disabled={loading}
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
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                // value={password}
                                // onChange={(e) => setPassword(e.target.value)}
                                // disabled={loading}
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
                            disabled={false}
                        >
                            {false ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </form>
                </div>
                <img src="1.jpeg" alt="image" className='hidden md:block' />
            </div>
        </div>
    );
}

export default LoginPage