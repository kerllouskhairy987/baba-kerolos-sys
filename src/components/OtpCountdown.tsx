'use client';

import { useState, useEffect } from 'react';

interface OtpCountdownProps {
  onResend?: () => Promise<{ error?: string; success?: boolean; message?: string }>;
  initialSeconds?: number;
}

export default function OtpCountdown({
  onResend,
  initialSeconds = 60,
}: OtpCountdownProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: string; message?: string } | null>(null);

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
    setFeedback(null);

    if (onResend) {
      const res = await onResend();
      if (res?.error) {
        setFeedback({ error: res.error });
      } else if (res?.success || res?.message) {
        setFeedback({ message: res.message || 'تم إعادة إرسال الرمز بنجاح' });
        setSeconds(initialSeconds);
      }
    }

    setIsResending(false);
  };

  const formattedTime = `00:${seconds < 10 ? `0${seconds}` : seconds}`;

  return (
    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
      {feedback?.error && (
        <div className="alert-error" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          {feedback.error}
        </div>
      )}
      {feedback?.message && (
        <div className="alert-success" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          {feedback.message}
        </div>
      )}

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
