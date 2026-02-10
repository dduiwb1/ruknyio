import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseFormEmailVerificationOptions {
  formSlug: string;
}

interface SendVerificationCodeParams {
  fieldId: string;
  email: string;
}

interface VerifyCodeParams {
  email: string;
  code: string;
}

interface VerificationState {
  email: string;
  expiresIn: number;
  attempts: number;
}

export function useFormEmailVerification({ formSlug }: UseFormEmailVerificationOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationState, setVerificationState] = useState<VerificationState | null>(null);

  const sendVerificationCode = useCallback(
    async ({ fieldId, email }: SendVerificationCodeParams) => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/forms/public/${formSlug}/send-verification-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fieldId, email }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to send verification code');
        }

        const data = await response.json();

        // Start countdown timer
        setVerificationState({
          email,
          expiresIn: data.expiresIn || 900,
          attempts: 0,
        });

        toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'حدث خطأ عند إرسال رمز التحقق';
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [formSlug],
  );

  const verifyCode = useCallback(
    async ({ email, code }: VerifyCodeParams) => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/forms/public/${formSlug}/verify-email-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to verify code');
        }

        const data = await response.json();

        // Clear verification state on success
        setVerificationState(null);

        toast.success('تم التحقق من بريدك الإلكتروني بنجاح');
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'كود التحقق غير صحيح';
        toast.error(message);

        if (verificationState) {
          setVerificationState({
            ...verificationState,
            attempts: (verificationState.attempts || 0) + 1,
          });
        }

        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [formSlug, verificationState],
  );

  const resetVerification = useCallback(() => {
    setVerificationState(null);
  }, []);

  return {
    isLoading,
    verificationState,
    sendVerificationCode,
    verifyCode,
    resetVerification,
  };
}
