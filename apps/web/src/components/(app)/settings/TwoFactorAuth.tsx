'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Smartphone, 
  Key,
  ShieldOff,
  Loader2,
  QrCode,
  Copy,
  Check,
  AlertTriangle,
  X,
  ArrowLeft,
  Scan,
  Globe,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSecuritySettings } from '@/lib/hooks/settings/useSecuritySettings';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TwoFactorAuthProps {
  isEnabled?: boolean;
  onStatusChange?: () => void;
}

// OTP Input Component - Modern Design
function OTPInput({ 
  value, 
  onChange, 
  disabled,
  autoFocus = true
}: { 
  value: string; 
  onChange: (val: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState(0);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;
    
    const newValue = value.split('');
    newValue[index] = digit.slice(-1);
    const result = newValue.join('').slice(0, 6);
    onChange(result);
    
    // Move to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocused(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocused(index - 1);
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocused(index - 1);
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocused(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pastedData);
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
    setFocused(lastIndex);
  };

  return (
    <div className="flex gap-2.5 justify-center" dir="ltr">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            scale: focused === index ? 1.05 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <input
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(index)}
            disabled={disabled}
            className={cn(
              "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 bg-white text-gray-900 ",
              "focus:outline-none focus:shadow-md",
              focused === index 
                ? "border-info ring-3 ring-info/20" 
                : value[index] 
                  ? "border-info/60 bg-info/5" 
                  : "border-gray-200 hover:border-gray-300",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function TwoFactorAuth({ isEnabled: isEnabledProp, onStatusChange }: TwoFactorAuthProps) {
  const { setup2FA, verify2FA, disable2FA, get2FAStatus, isLoading, error, setError } = useSecuritySettings();
  const router = useRouter();
  
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'qr' | 'verify'>('qr');
  const [isEnabledInternal, setIsEnabledInternal] = useState(isEnabledProp ?? false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(isEnabledProp === undefined);

  // Use prop if provided, otherwise use internal state
  const isEnabled = isEnabledProp ?? isEnabledInternal;

  // Fetch 2FA status on mount if not provided via prop
  useEffect(() => {
    if (isEnabledProp === undefined) {
      const fetchStatus = async () => {
        const status = await get2FAStatus();
        if (status !== null) {
          setIsEnabledInternal(status.enabled);
        }
        setIsLoadingStatus(false);
      };
      fetchStatus();
    }
  }, [isEnabledProp, get2FAStatus]);

  // Update internal state when prop changes
  useEffect(() => {
    if (isEnabledProp !== undefined) {
      setIsEnabledInternal(isEnabledProp);
    }
  }, [isEnabledProp]);

  const handleSetup = async () => {
    const result = await setup2FA();
    if (result) {
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setShowSetupModal(true);
      setStep('qr');
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('يرجى إدخال رمز مكون من 6 أرقام');
      return;
    }

    const success = await verify2FA(verificationCode);
    if (success) {
      setShowSetupModal(false);
      setVerificationCode('');
      setQrCode(null);
      setSecret(null);
      setStep('qr');
      // Update internal state
      setIsEnabledInternal(true);
      // Call onStatusChange if provided
      onStatusChange?.();
    }
  };

  const handleDisable = async () => {
    if (verificationCode.length !== 6) {
      setError('يرجى إدخال رمز مكون من 6 أرقام');
      return;
    }

    const success = await disable2FA(verificationCode);
    if (success) {
      setShowDisableModal(false);
      setVerificationCode('');
      setError(null);
      // Update internal state
      setIsEnabledInternal(false);
      // Call onStatusChange if provided
      onStatusChange?.();
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeModal = () => {
    setShowSetupModal(false);
    setShowDisableModal(false);
    setVerificationCode('');
    setQrCode(null);
    setSecret(null);
    setError(null);
    setStep('qr');
  };

  // Auto submit when code is complete (with debounce to prevent double calls)
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  
  useEffect(() => {
    if (verificationCode.length === 6 && !isLoading && !autoSubmitting) {
      setAutoSubmitting(true);
      const timer = setTimeout(async () => {
        if (showSetupModal && step === 'verify') {
          await handleVerify();
        } else if (showDisableModal) {
          await handleDisable();
        }
        setAutoSubmitting(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [verificationCode, showSetupModal, showDisableModal, step, isLoading, autoSubmitting]);

  return (
    <>
      {/* Main Card - Enhanced Design */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-4xl p-5  transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
              isEnabled 
                ? "bg-gradient-to-br from-info to-info-filled" 
                : "bg-muted"
            )}>
              <Shield className={cn("w-5 h-5", isEnabled ? "text-white" : "text-muted-foreground")} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">المصادقة الثنائية</h3>
              <p className="text-xs text-muted-foreground">طبقة حماية إضافية لحسابك</p>
            </div>
          </div>

          <motion.div 
            initial={false}
            animate={{
              backgroundColor: isEnabled ? "rgba(64, 225, 250, 0.1)" : "rgb(243, 244, 246)"
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            )}
          >
            <motion.span
              initial={false}
              animate={{
                backgroundColor: isEnabled ? "#40E1FA" : "#9CA3AF",
                scale: isEnabled ? [1, 1.2, 1] : 1
              }}
              transition={{ duration: 0.3 }}
              className="w-2 h-2 rounded-full"
            />
            <span className={isEnabled ? "text-info" : "text-gray-500"}>
              {isEnabled ? 'مفعلة' : 'غير مفعلة'}
            </span>
          </motion.div>
        </div>

        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          {isEnabled 
            ? 'حسابك محمي برمز تحقق إضافي عند تسجيل الدخول. هذا يمنع الوصول غير المصرح به.'
            : 'أضف طبقة حماية باستخدام تطبيق مصادقة على هاتفك مثل Google Authenticator.'
          }
        </p>

        {/* Features - Modern Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-xl border border-border">
            <Smartphone className="w-3.5 h-3.5 text-info" />
            <span>Google Authenticator</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-xl border border-border">
            <Key className="w-3.5 h-3.5 text-info" />
            <span>رمز متغير كل 30 ثانية</span>
          </div>
        </div>

        {/* Action Button - Enhanced */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={isEnabled ? () => setShowDisableModal(true) : handleSetup}
          disabled={isLoading}
          className={cn(
            "w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
            isEnabled 
              ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
              : "bg-gradient-to-r from-primary to-primary-hover text-white hover:shadow-md"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isEnabled ? (
            <>
              <ShieldOff className="w-4 h-4" />
              تعطيل المصادقة
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              تفعيل المصادقة
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Quick Link to IP Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br mt-4 from-warning/5 to-warning/10 border border-warning/20 rounded-2xl p-4 transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">تنبيهات تسجيل الدخول</h4>
              <p className="text-xs text-muted-foreground">استلام إشعار عند تسجيل الدخول من موقع جديد</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/app/settings?tab=ip-protection')}
            className="flex items-center gap-2 px-4 py-2 bg-warning text-white rounded-xl text-sm font-medium hover:bg-warning/90 transition-colors"
          >
            <span>إعداد</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Setup Modal using Dialog */}
      <Dialog open={showSetupModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent dir="rtl" className="max-w-sm p-0 gap-0" showCloseButton={false}>
          {/* Header */}
          <DialogHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step === 'verify' && (
                  <button
                    onClick={() => setStep('qr')}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
                <DialogTitle className="text-base font-semibold">
                  {step === 'qr' ? 'مسح الرمز' : 'إدخال الرمز'}
                </DialogTitle>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </DialogHeader>

          {/* Steps Indicator */}
          <div className="px-5 pt-4">
            <div className="flex items-center justify-center gap-2">
              <div className={cn(
                "w-8 h-1 rounded-full transition-colors",
                step === 'qr' ? "bg-primary" : "bg-primary/30"
              )} />
              <div className={cn(
                "w-8 h-1 rounded-full transition-colors",
                step === 'verify' ? "bg-primary" : "bg-muted"
              )} />
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              {step === 'qr' ? (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <p className="text-sm text-muted-foreground text-center mb-5">
                    امسح الرمز باستخدام تطبيق المصادقة
                  </p>

                  {/* QR Code */}
                  {qrCode && (
                    <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="flex justify-center mb-5"
                    >
                      <div className="p-4 bg-background border-2 border-border rounded-2xl">
                        <img src={qrCode} alt="QR Code" className="w-44 h-44" />
                      </div>
                    </motion.div>
                  )}

                  {/* Manual Entry */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-5 border border-border">
                    <p className="text-xs text-muted-foreground text-center mb-3 font-medium">
                      أو أدخل الرمز يدوياً
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-background px-3 py-2.5 rounded-xl text-xs font-mono text-center border border-border text-foreground truncate">
                        {secret}
                      </code>
                      <button
                        onClick={copySecret}
                        className={cn(
                          "p-2.5 rounded-xl transition-all",
                          copied 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-background border border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('verify')}
                    className="w-full py-3 bg-foreground text-background rounded-xl font-semibold hover:bg-foreground/90 transition-all text-sm"
                  >
                    التالي
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    أدخل الرمز المكون من 6 أرقام من التطبيق
                  </p>

                  {/* OTP Input */}
                  <div className="mb-6">
                    <OTPInput
                      value={verificationCode}
                      onChange={setVerificationCode}
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-destructive/10 rounded-xl flex items-center gap-2 text-destructive text-sm border border-destructive/20"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    onClick={handleVerify}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full py-3 bg-foreground text-background rounded-xl font-semibold hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'تفعيل المصادقة'
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable Modal using Dialog */}
      <Dialog open={showDisableModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent dir="rtl" className="max-w-sm p-0 gap-0" showCloseButton={false}>
          {/* Header */}
          <DialogHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-semibold">
                تعطيل المصادقة الثنائية
              </DialogTitle>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="p-5">
            <p className="text-sm text-muted-foreground text-center mb-2">
              هل أنت متأكد؟
            </p>
            <p className="text-xs text-muted-foreground text-center mb-6">
              تعطيل المصادقة الثنائية سيجعل حسابك أقل أماناً. أدخل الرمز للتأكيد.
            </p>

            {/* OTP Input */}
            <div className="mb-6">
              <OTPInput
                value={verificationCode}
                onChange={setVerificationCode}
                disabled={isLoading}
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-destructive/10 rounded-xl flex items-center gap-2 text-destructive text-sm border border-destructive/20"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors text-sm"
              >
                إلغاء
              </button>
              <button
                onClick={handleDisable}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'متابعة'
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
