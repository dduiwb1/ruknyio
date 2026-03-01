'use client';

import { useActionState, useEffect, useState } from 'react';
import { requestQuickSign, getGoogleOAuthUrl } from '@/actions/auth';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(requestQuickSign, undefined);
  const [googleUrl, setGoogleUrl] = useState<string>('');

  useEffect(() => {
    getGoogleOAuthUrl().then(setGoogleUrl);
  }, []);

  return (
    <div className="flex flex-col items-center text-sm text-slate-800">
      {/* Badge */}
      <p className="text-xs bg-indigo-200 text-indigo-600 font-medium px-3 py-1 rounded-full">
        تسجيل الدخول
      </p>

      {/* Heading */}
      <h1 className="text-4xl font-bold py-4 text-center">
        مرحباً بك في ركني
      </h1>
      <p className="max-md:text-sm text-gray-500 pb-8 text-center">
        سجل دخولك و انطلق ويانا
      </p>

      <div className="max-w-96 w-full px-4">
        {/* Google OAuth */}
        <a
          href={googleUrl}
          className="flex items-center justify-center gap-2 h-11 w-full border border-slate-300 rounded-full hover:bg-slate-50 transition-all text-sm font-medium"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          الدخول عبر Google
        </a>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400">أو عبر البريد الإلكتروني</span>
          </div>
        </div>

        {/* QuickSign — success state */}
        {state?.success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <p className="font-semibold text-base text-slate-800">
              تم إرسال رابط الدخول
            </p>
            <p className="text-gray-500 text-center text-sm">
              {state.message}
            </p>
          </div>
        ) : (
          /* QuickSign — email form */
          <form action={formAction}>
            <label htmlFor="email" className="font-medium">
              البريد الإلكتروني
            </label>
            <div className="flex items-center mt-2 mb-1 h-11 pr-3 border border-slate-300 rounded-full focus-within:ring-2 focus-within:ring-indigo-400 transition-all overflow-hidden">
              <Mail className="size-5 text-slate-500 shrink-0" />
              <input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                required
                autoComplete="email"
                autoFocus
                placeholder="example@email.com"
                className="h-full px-2 w-full outline-none bg-transparent text-left"
              />
            </div>

            {state?.errors?.email && (
              <p className="text-xs text-red-500 mt-1">
                {state.errors.email[0]}
              </p>
            )}

            {state?.message && !state?.success && (
              <p className="text-xs text-red-500 mt-2 text-center">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center gap-1.5 mt-5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 w-full rounded-full transition font-medium"
            >
              {isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  إرسال رابط الدخول
                  <ArrowLeft className="size-5 mt-0.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-8">
          بتسجيل دخولك، أنت توافق على{' '}
          <a href="/terms" className="text-indigo-600 hover:underline">
            شروط الاستخدام
          </a>{' '}
          و{' '}
          <a href="/privacy" className="text-indigo-600 hover:underline">
            سياسة الخصوصية
          </a>
        </p>
      </div>
    </div>
  );
}
