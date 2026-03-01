'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyQuickSignToken } from '@/actions/auth';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setError('رمز التحقق مفقود');
      return;
    }

    async function verify() {
      const result = await verifyQuickSignToken(token!);

      if (!result.success) {
        setStatus('error');
        setError(result.error || 'فشل التحقق من الرابط');
        return;
      }

      setStatus('success');

      if (result.redirectTo) {
        const url = new URL(result.redirectTo, window.location.origin);
        router.replace(url.pathname + url.search);
      } else {
        setTimeout(() => router.replace('/app'), 1500);
      }
    }

    verify();
  }, [searchParams, router]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center text-sm text-slate-800">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-2 text-center">
          خطأ في التحقق
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

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center text-sm text-slate-800">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-2 text-center">
          تم التحقق بنجاح
        </h1>
        <p className="text-gray-500 text-center">
          جاري توجيهك...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-sm text-slate-800">
      {/* Badge */}
      <p className="text-xs bg-indigo-200 text-indigo-600 font-medium px-3 py-1 rounded-full mb-6">
        تحقق
      </p>

      {/* Spinner */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-6">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>

      <h1 className="text-2xl font-bold mb-2 text-center">
        جاري التحقق
      </h1>
      <p className="text-gray-500 text-center">
        يرجى الانتظار قليلاً...
      </p>
    </div>
  );
}

export default function VerifyPage() {
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
      <VerifyContent />
    </Suspense>
  );
}
