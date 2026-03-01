'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeOAuthCode } from '@/actions/auth';
import { useAuth } from '@/providers/auth-provider';
import { Loader2, XCircle, ArrowRight } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('رمز التفويض مفقود');
      return;
    }

    async function exchange() {
      const result = await exchangeOAuthCode(code!);

      if (!result.success) {
        setError(result.error || 'فشلت عملية تسجيل الدخول');
        return;
      }

      if (result.user) {
        setUser(result.user);
      }

      if (result.needsProfileCompletion) {
        router.replace('/complete-profile');
      } else {
        router.replace('/app');
      }
    }

    exchange();
  }, [searchParams, router, setUser]);

  if (error) {
    return (
      <div className="flex flex-col items-center text-sm text-slate-800">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-2 text-center">
          خطأ في تسجيل الدخول
        </h1>
        <p className="text-gray-500 text-center mb-8">{error}</p>

        {/* Back Button */}
        <a
          href="/login"
          className="flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 w-full max-w-xs rounded-full transition font-medium"
        >
          <ArrowRight className="size-5" />
          العودة لتسجيل الدخول
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-sm text-slate-800">
      {/* Badge */}
      <p className="text-xs bg-indigo-200 text-indigo-600 font-medium px-3 py-1 rounded-full mb-6">
        Auth verification 
      </p>

      {/* Spinner */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-6">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>

      <h1 className="text-2xl font-bold mb-2 text-center">
        جاري تسجيل الدخول
      </h1>
      <p className="text-gray-500 text-center">
        يرجى الانتظار قليلاً...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
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
      <CallbackContent />
    </Suspense>
  );
}
