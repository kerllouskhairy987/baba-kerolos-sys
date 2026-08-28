'use client';

import { useState, useEffect } from 'react';

interface OtpCountdownProps {
  // onResend: () => any;
  initialSeconds?: number;
}

export default function OtpCountdown({
  // onResend,
  initialSeconds = 30,
}: OtpCountdownProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleResendClick = async () => {
    if (seconds > 0 || isResending) return;

    setIsResending(true);
    // const success = await onResend();
    setIsResending(false);

    // if (success) {
    //   setSeconds(initialSeconds);
    // }
  };

  const formattedTime = `00:${seconds < 10 ? `0${seconds}` : seconds}`;

  return (
    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
      <button
        type="button"
        className="btn-secondary"
        onClick={handleResendClick}
        disabled={seconds > 0 || isResending}
      >
        {isResending ? (
          'جاري إعادة الإرسال...'
        ) : seconds > 0 ? (
          `إعادة إرسال الرمز (${formattedTime})`
        ) : (
          'إعادة إرسال الرمز'
        )}
      </button>
    </div>
  );
}
