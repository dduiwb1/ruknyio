'use client';

/**
 * صفحة تأكيد البريد - Check Email
 */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Loader2, RefreshCw, ArrowRight } from 'lucide-react';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const type = (searchParams.get('type') as 'LOGIN' | 'SIGNUP') || 'LOGIN';

  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.replace('/login');
    }
  }, [email, router]);

  const handleResend = async () => {
    if (!canResend || resending) return;

    setResending(true);
    setResendSuccess(false);
    setResendError('');

    try {
      const res = await fetch('/api/auth/quicksign/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendSuccess(true);
        setCanResend(false);
        setCountdown(60);
      } else {
        setResendError(data.message || 'فشل إعادة الإرسال. يرجى المحاولة لاحقاً');
      }
    } catch {
      setResendError('فشل إعادة الإرسال. يرجى المحاولة لاحقاً');
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quicksign_email');
    }
    router.replace('/login');
  };

  // Loading state
  if (!email) {
    return (
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-sm text-slate-800">
      {/* Badge */}
      <p className="text-xs bg-indigo-200 text-indigo-600 font-medium px-3 py-1 rounded-full">
        تأكيد البريد
      </p>

      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 my-6">
        <Mail className="h-8 w-8 text-indigo-500" />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold mb-2 text-center">
        تحقق من بريدك
      </h1>
      <p className="text-gray-500 mb-3 text-center">
        أرسلنا رابط {type === 'LOGIN' ? 'تسجيل الدخول' : 'إكمال التسجيل'} إلى
      </p>
      <p className="text-base font-semibold text-slate-800 mb-6" dir="ltr">
        {email}
      </p>

      {/* Info Box */}
      <div className="w-full max-w-sm">
        <div className="text-center p-4 bg-indigo-50 rounded-2xl mb-4">
          <p className="text-sm text-indigo-700">
            {type === 'LOGIN'
              ? 'اضغط على الرابط في بريدك لتسجيل الدخول'
              : 'اضغط على الرابط في بريدك لإكمال التسجيل'}
          </p>
          <p className="text-xs text-indigo-400 mt-2">
            الرابط صالح لمدة 10 دقائق فقط
          </p>
        </div>

        {/* Success Message */}
        {resendSuccess && (
          <div className="p-3 bg-green-50 rounded-xl mb-4">
            <p className="text-sm text-green-600 text-center">
              ✓ تم إعادة إرسال الرابط بنجاح
            </p>
          </div>
        )}

        {/* Error Message */}
        {resendError && (
          <div className="p-3 bg-red-50 rounded-xl mb-4">
            <p className="text-sm text-red-500 text-center">
              {resendError}
            </p>
          </div>
        )}

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={!canResend || resending}
          className="flex items-center justify-center gap-2 w-full h-11 border border-slate-300 rounded-full hover:bg-slate-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {resending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جاري الإرسال...</span>
            </>
          ) : !canResend ? (
            <span>إعادة الإرسال ({countdown})</span>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>إعادة إرسال الرابط</span>
            </>
          )}
        </button>

        {/* Change Email Button */}
        <button
          onClick={handleChangeEmail}
          className="flex items-center justify-center gap-1.5 w-full h-11 text-gray-500 hover:text-slate-800 rounded-full transition-all font-medium"
        >
          <ArrowRight className="h-4 w-4" />
          <span>تغيير البريد الإلكتروني</span>
        </button>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-6">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
