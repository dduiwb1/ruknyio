'use client';

/**
 * 🔐 QuickSign Verify Page - Handles magic link verification
 * Redirects to API which handles the full authentication flow
 */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkQuickSignToken } from '@/lib/api';
import { buildApiExternalUrl } from '@/lib/config';
import { Loader2, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setError('لم يتم العثور على رمز التحقق');
      return;
    }

    const verifyToken = async () => {
      try {
        // First, check if token is valid (without consuming it)
        const checkResult = await checkQuickSignToken(token);
        
        if (!checkResult.valid) {
          setStatus('error');
          if (checkResult.used) {
            setError('هذا الرابط تم استخدامه مسبقاً');
          } else if (checkResult.expired) {
            setError('انتهت صلاحية هذا الرابط');
          } else {
            setError('رابط غير صالح');
          }
          return;
        }

        setStatus('redirecting');

        // Redirect browser to API endpoint which handles the full flow
        // The API will redirect back to /auth/callback with the code
        window.location.href = buildApiExternalUrl(`auth/quicksign/verify/${token}`);
      } catch (err) {
        setStatus('error');
        setError('فشل التحقق من الرابط');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#ffffff] p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full max-w-sm"
        >
          {/* Icon */}
          <div className="flex items-center justify-center size-20 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground mb-3">
              الرابط غير صالح
            </h1>
            <p className="text-sm text-muted-foreground">
              {error || 'هذا الرابط السحري منتهي الصلاحية أو تم استخدامه مسبقاً'}
            </p>
          </div>

          {/* Info */}
          <div className="w-full space-y-4 mb-6">
            <div className="text-center p-4 bg-muted/30 rounded-2xl">
              <p className="text-xs text-muted-foreground/60">
                الروابط السحرية تنتهي صلاحيتها بعد ٣٠ دقيقة لأسباب أمنية
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="flex items-center justify-center gap-2 w-full h-12 bg-foreground text-background hover:opacity-90 font-medium rounded-full transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              <span>طلب رابط جديد</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 w-full h-12 text-muted-foreground hover:text-foreground font-medium rounded-full transition-all duration-300"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للرئيسية</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ffffff] p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center w-full max-w-sm"
      >
        {/* Loading Spinner */}
        <div className="flex items-center justify-center size-20 rounded-full bg-muted/50 mb-6">
          <Loader2 className="h-10 w-10 text-foreground animate-spin" />
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground mb-3">
            {status === 'loading' ? 'جاري التحقق...' : 'جاري تسجيل الدخول...'}
          </h1>
          <p className="text-sm text-muted-foreground">
            يرجى الانتظار بينما نتحقق من الرابط السحري
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function QuickSignVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-6" dir="rtl">
          <Loader2 className="animate-spin h-8 w-8 text-foreground" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
