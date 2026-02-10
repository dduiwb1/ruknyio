'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFormEmailVerification } from '@/lib/hooks/useFormEmailVerification';

interface EmailFieldWithVerificationProps {
  fieldId: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  emailVerification?: boolean;
  formSlug: string;
  value: string;
  onChange: (value: string) => void;
}

export function EmailFieldWithVerification({
  fieldId,
  label,
  description,
  placeholder,
  required,
  emailVerification,
  formSlug,
  value,
  onChange,
}: EmailFieldWithVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const {
    isLoading,
    verificationState,
    sendVerificationCode,
    verifyCode,
    resetVerification,
  } = useFormEmailVerification({ formSlug });

  // Timer countdown
  React.useEffect(() => {
    if (!verificationState || remainingTime === 0) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [verificationState, remainingTime]);

  const handleSendCode = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      alert('البريد الإلكتروني غير صحيح');
      return;
    }

    const result = await sendVerificationCode({ fieldId, email: value });
    if (result.success) {
      setIsCodeSent(true);
      setRemainingTime(verificationState?.expiresIn || 900);
      setVerificationCode('');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      alert('الرجاء إدخال رمز التحقق');
      return;
    }

    const result = await verifyCode({
      email: value,
      code: verificationCode,
    });

    if (result.success) {
      setIsVerified(true);
      setIsCodeSent(false);
      setVerificationCode('');
    }
  };

  const handleResend = () => {
    setIsCodeSent(false);
    setVerificationCode('');
    setRemainingTime(0);
    resetVerification();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Field Label */}
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {required && <span className="text-destructive text-xs font-bold">*</span>}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Email Input */}
      <div className="relative">
        <Input
          type="email"
          placeholder={placeholder || 'name@example.com'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isVerified || isLoading || isCodeSent}
          className="pr-12"
        />
        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {/* Email Verification Section */}
      {emailVerification && !isVerified && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-2 space-y-3"
        >
          {!isCodeSent ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleSendCode}
              disabled={isLoading || !value || isVerified}
              className="w-full"
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </Button>
          ) : (
            <>
              {/* Verification Code Input */}
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>الرمز ينتهي في {formatTime(remainingTime)}</span>
                </div>

                <Input
                  type="text"
                  placeholder="أدخل الرمز المكون من 6 أرقام"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLoading}
                  maxLength={6}
                  className="text-center tracking-widest font-semibold letter-spacing-2"
                  autoComplete="off"
                />

                <Button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full"
                >
                  {isLoading ? 'جاري التحقق...' : 'تأكيد'}
                </Button>

                {remainingTime > 0 && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="w-full text-xs text-primary hover:underline transition-colors"
                  >
                    لم تستقبل الرمز؟ أعد الإرسال
                  </button>
                )}

                {remainingTime === 0 && (
                  <div className="flex items-center gap-2 text-xs text-destructive p-2 bg-destructive/10 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>انتهى الرمز. اطلب رمزاً جديداً</span>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Verification Success */}
      {isVerified && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
              تم التحقق من البريد بنجاح
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              {value}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
