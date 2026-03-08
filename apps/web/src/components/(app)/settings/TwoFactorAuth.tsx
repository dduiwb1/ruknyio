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
  ArrowRight,
  Download
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
import { Switch } from '@/components/ui/switch';

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
    <div className="flex gap-1.5 sm:gap-2 justify-center" dir="ltr">
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
              "w-10 h-11 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-bold rounded-xl border-2 transition-all duration-200 bg-card text-foreground",
              "focus:outline-none",
              focused === index 
                ? "border-primary ring-2 ring-primary/20" 
                : value[index] 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-border hover:border-border/80",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function TwoFactorAuth({ isEnabled: isEnabledProp, onStatusChange }: TwoFactorAuthProps) {
  const { setup2FA, verify2FA, disable2FA, get2FAStatus, regenerateBackupCodes, isLoading, error, setError } = useSecuritySettings();
  const router = useRouter();
  
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupCodesRemaining, setBackupCodesRemaining] = useState<number>(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
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
          setBackupCodesRemaining(status.backupCodesRemaining);
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
      setBackupCodes(result.backupCodes);
      setShowSetupModal(true);
      setStep('qr');
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('يرجى إدخال رمز مكون من 6 أرقام');
      return;
    }

    const result = await verify2FA(verificationCode);
    if (result.success) {
      setShowSetupModal(false);
      setVerificationCode('');
      setQrCode(null);
      setSecret(null);
      setStep('qr');
      // Update internal state
      setIsEnabledInternal(true);
      setBackupCodesRemaining(backupCodes.length);
      // Show backup codes modal
      setShowBackupCodesModal(true);
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
      setBackupCodes([]);
      setBackupCodesRemaining(0);
      // Update internal state
      setIsEnabledInternal(false);
      // Call onStatusChange if provided
      onStatusChange?.();
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (verificationCode.length !== 6) {
      setError('يرجى إدخال رمز مكون من 6 أرقام');
      return;
    }

    const result = await regenerateBackupCodes(verificationCode);
    if (result.success && result.backupCodes) {
      setBackupCodes(result.backupCodes);
      setBackupCodesRemaining(result.backupCodes.length);
      setShowRegenerateModal(false);
      setVerificationCode('');
      setError(null);
      // Show backup codes
      setShowBackupCodesModal(true);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyAllBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const closeModal = () => {
    setShowSetupModal(false);
    setShowDisableModal(false);
    setShowRegenerateModal(false);
    setVerificationCode('');
    setQrCode(null);
    setSecret(null);
    setError(null);
    setStep('qr');
  };

  const closeBackupCodesModal = () => {
    setShowBackupCodesModal(false);
    setBackupCodes([]);
  };

  const downloadBackupCodesExcel = (codes: string[]) => {
    // Build XML Spreadsheet (Excel-compatible) with RTL & styling
    const now = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    const rows = codes.map((code, i) => 
      `<Row>` +
        `<Cell ss:StyleID="num"><Data ss:Type="Number">${i + 1}</Data></Cell>` +
        `<Cell ss:StyleID="code"><Data ss:Type="String">${code}</Data></Cell>` +
        `<Cell ss:StyleID="status"><Data ss:Type="String">غير مستخدم</Data></Cell>` +
      `</Row>`
    ).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:Size="12"/></Style>
    <Style ss:ID="header"><Font ss:Bold="1" ss:Size="13" ss:Color="#FFFFFF"/><Interior ss:Color="#4a7c59" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
    <Style ss:ID="title"><Font ss:Bold="1" ss:Size="16" ss:Color="#4a7c59"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
    <Style ss:ID="subtitle"><Font ss:Size="11" ss:Color="#888888"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
    <Style ss:ID="num"><Font ss:Size="12"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
    <Style ss:ID="code"><Font ss:Size="14" ss:FontName="Consolas"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
    <Style ss:ID="status"><Font ss:Size="11" ss:Color="#4a7c59"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
    <Style ss:ID="warn"><Font ss:Size="10" ss:Color="#d97706"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
  </Styles>
  <Worksheet ss:Name="الرموز الاحتياطية">
    <Table ss:DefaultColumnWidth="120" ss:DefaultRowHeight="28">
      <Column ss:Width="60"/>
      <Column ss:Width="180"/>
      <Column ss:Width="140"/>
      <Row ss:Height="40"><Cell ss:MergeAcross="2" ss:StyleID="title"><Data ss:Type="String">🔐 الرموز الاحتياطية - Rukny.io</Data></Cell></Row>
      <Row ss:Height="24"><Cell ss:MergeAcross="2" ss:StyleID="subtitle"><Data ss:Type="String">تاريخ التوليد: ${now}</Data></Cell></Row>
      <Row ss:Height="10"></Row>
      <Row ss:Height="32">
        <Cell ss:StyleID="header"><Data ss:Type="String">#</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">الرمز</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">الحالة</Data></Cell>
      </Row>
      ${rows}
      <Row ss:Height="10"></Row>
      <Row><Cell ss:MergeAcross="2" ss:StyleID="warn"><Data ss:Type="String">⚠️ كل رمز يُستخدم مرة واحدة فقط. احفظ هذا الملف في مكان آمن!</Data></Cell></Row>
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rukny-backup-codes-${Date.now()}.xls`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
        } else if (showRegenerateModal) {
          await handleRegenerateBackupCodes();
        }
        setAutoSubmitting(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [verificationCode, showSetupModal, showDisableModal, showRegenerateModal, step, isLoading, autoSubmitting]);

  return (
    <>
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-4 sm:p-6 transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
              isEnabled 
                ? "bg-primary/10" 
                : "bg-muted"
            )}>
              <Shield className={cn("w-5 h-5", isEnabled ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-foreground text-sm sm:text-base">المصادقة الثنائية</h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground">طبقة حماية إضافية لحسابك</p>
            </div>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold shrink-0",
            isEnabled ? "bg-primary/10" : "bg-muted"
          )}>
            <motion.span
              initial={false}
              animate={{ scale: isEnabled ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", isEnabled ? "bg-primary" : "bg-muted-foreground")}
            />
            <span className={isEnabled ? "text-primary" : "text-muted-foreground"}>
              {isEnabled ? 'مفعلة' : 'غير مفعلة'}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5 leading-relaxed">
          {isEnabled 
            ? 'حسابك محمي برمز تحقق إضافي عند تسجيل الدخول. هذا يمنع الوصول غير المصرح به.'
            : 'أضف طبقة حماية باستخدام تطبيق مصادقة على هاتفك مثل Google Authenticator.'
          }
        </p>

        {/* Features - Modern Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground bg-muted px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border border-border">
            <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span>Google Authenticator</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground bg-muted px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border border-border">
            <Key className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span>رمز متغير كل 30 ثانية</span>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between gap-3 bg-muted/30 rounded-2xl p-3 sm:p-4 border border-border">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                تفعيل المصادقة الثنائية
              </p>
              {isEnabled && (
                <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  مفعّلة
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              {isEnabled 
                ? 'حسابك محمي برمز تحقق إضافي'
                : 'تأمين الحساب بطبقة حماية إضافية'
              }
            </p>
          </div>
          <div dir="ltr" className="shrink-0">
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleSetup();
                } else {
                  setShowDisableModal(true);
                }
              }}
              disabled={isLoading}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Link to IP Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-warning/5 mt-3 sm:mt-4 border border-warning/20 rounded-3xl p-3 sm:p-4 transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-warning/20 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">تنبيهات تسجيل الدخول</h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">استلام إشعار عند الدخول من موقع جديد</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/app/settings?tab=ip-protection')}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-warning text-white rounded-2xl text-xs sm:text-sm font-medium hover:bg-warning/90 transition-colors shrink-0"
          >
            <span>إعداد</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Backup Codes Card - Only when 2FA is enabled */}
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card mt-3 sm:mt-4 border border-border rounded-3xl p-3 sm:p-4 transition-all duration-300"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">الرموز الاحتياطية</h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  {backupCodesRemaining > 0 
                    ? `${backupCodesRemaining} رموز متبقية`
                    : 'لا توجد رموز احتياطية'
                  }
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setVerificationCode('');
                setError(null);
                setShowRegenerateModal(true);
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-2xl text-xs sm:text-sm font-medium hover:bg-primary-hover transition-colors shrink-0"
            >
              <span>إعادة توليد</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          {backupCodesRemaining > 0 && backupCodesRemaining <= 3 && (
            <div className="mt-2.5 flex items-center gap-2 text-[11px] sm:text-xs text-warning bg-warning/10 px-3 py-2 rounded-xl border border-warning/20">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>عدد الرموز الاحتياطية منخفض. يُنصح بإعادة التوليد.</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Setup Modal */}
      <Dialog open={showSetupModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent dir="rtl" className="max-w-[340px] sm:max-w-sm rounded-3xl p-0 gap-0" showCloseButton={false}>
          {/* Header */}
          <DialogHeader className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {step === 'verify' && (
                  <button
                    onClick={() => setStep('qr')}
                    className="p-1.5 hover:bg-muted rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </button>
                )}
                <DialogTitle className="text-sm sm:text-base font-semibold">
                  {step === 'qr' ? 'مسح الرمز' : 'إدخال الرمز'}
                </DialogTitle>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 sm:p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </button>
            </div>
          </DialogHeader>

          {/* Steps Indicator */}
          <div className="px-5 pt-3">
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
          <div className="p-4 sm:p-5">
            <AnimatePresence mode="wait">
              {step === 'qr' ? (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4">
                    امسح الرمز باستخدام تطبيق المصادقة
                  </p>

                  {/* QR Code */}
                  {qrCode && (
                    <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="flex justify-center mb-4"
                    >
                      <div className="p-3 bg-muted/30 border border-border rounded-2xl">
                        <img src={qrCode} alt="QR Code" className="w-32 h-32 sm:w-36 sm:h-36" />
                      </div>
                    </motion.div>
                  )}

                  {/* Manual Entry */}
                  <div className="bg-muted/30 rounded-2xl p-3 mb-4 border border-border">
                    <p className="text-[11px] sm:text-xs text-muted-foreground text-center mb-2.5 font-medium">
                      أو أدخل الرمز يدوياً
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-card px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-mono text-center border border-border text-foreground truncate">
                        {secret}
                      </code>
                      <button
                        onClick={copySecret}
                        className={cn(
                          "p-2 sm:p-2.5 rounded-xl transition-all shrink-0",
                          copied 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-card border border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('verify')}
                    className="w-full py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-2xl font-semibold hover:bg-primary-hover transition-all text-sm"
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
                  <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4">
                    أدخل الرمز المكون من 6 أرقام من التطبيق
                  </p>

                  {/* OTP Input */}
                  <div className="mb-4">
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
                      className="mb-4 p-2.5 sm:p-3 bg-destructive/10 rounded-2xl flex items-center gap-2 text-destructive text-xs sm:text-sm border border-destructive/20"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    onClick={handleVerify}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-2xl font-semibold hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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

      {/* Disable Modal */}
      <Dialog open={showDisableModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent dir="rtl" className="max-w-[340px] sm:max-w-sm rounded-3xl p-0 gap-0" showCloseButton={false}>
          {/* Header */}
          <DialogHeader className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm sm:text-base font-semibold">
                تعطيل المصادقة الثنائية
              </DialogTitle>
              <button
                onClick={closeModal}
                className="p-1.5 sm:p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-muted-foreground text-center mb-1.5">
              هل أنت متأكد؟
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground text-center mb-4">
              تعطيل المصادقة الثنائية سيجعل حسابك أقل أماناً. أدخل الرمز للتأكيد.
            </p>

            {/* OTP Input */}
            <div className="mb-4">
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
                className="mb-4 p-2.5 sm:p-3 bg-destructive/10 rounded-2xl flex items-center gap-2 text-destructive text-xs sm:text-sm border border-destructive/20"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex gap-2.5 sm:gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 sm:py-3 bg-muted text-foreground rounded-2xl font-medium hover:bg-muted/80 transition-colors text-sm"
              >
                إلغاء
              </button>
              <button
                onClick={handleDisable}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1 py-2.5 sm:py-3 bg-destructive text-destructive-foreground rounded-2xl font-medium hover:bg-destructive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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

      {/* Backup Codes Display Modal */}
      <Dialog open={showBackupCodesModal} onOpenChange={(open) => !open && closeBackupCodesModal()}>
        <DialogContent dir="rtl" className="max-w-[380px] sm:max-w-md rounded-3xl p-0 gap-0" showCloseButton={false}>
          <DialogHeader className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <DialogTitle className="text-sm sm:text-base font-semibold">الرموز الاحتياطية</DialogTitle>
              </div>
              <button
                onClick={closeBackupCodesModal}
                className="p-1.5 sm:p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </button>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-5">
            {/* Warning */}
            <div className="flex items-start gap-2.5 p-3 bg-warning/10 rounded-2xl border border-warning/20 mb-4">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground mb-0.5">احفظ هذه الرموز في مكان آمن!</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  هذه الرموز تُستخدم لتسجيل الدخول إذا فقدت الوصول لتطبيق المصادقة. كل رمز يُستخدم مرة واحدة فقط.
                </p>
              </div>
            </div>

            {/* Backup Codes Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {backupCodes.map((code, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-center py-2.5 px-3 bg-muted/50 rounded-xl border border-border"
                >
                  <code className="text-xs sm:text-sm font-mono font-bold text-foreground tracking-wider">{code}</code>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-2.5">
              {/* Copy All */}
              <button
                onClick={copyAllBackupCodes}
                className={cn(
                  "flex-1 py-2.5 sm:py-3 rounded-2xl font-semibold transition-all text-sm flex items-center justify-center gap-2",
                  copiedAll 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                )}
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الرموز</span>
                  </>
                )}
              </button>

              {/* Download Excel */}
              <button
                onClick={() => downloadBackupCodesExcel(backupCodes)}
                className="flex-1 py-2.5 sm:py-3 rounded-2xl font-semibold transition-all text-sm flex items-center justify-center gap-2 bg-muted text-foreground hover:bg-muted/80 border border-border"
              >
                <Download className="w-4 h-4" />
                <span>تحميل Excel</span>
              </button>
            </div>

            {/* Confirm Button */}
            <button
              onClick={closeBackupCodesModal}
              className="w-full py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-2xl font-semibold hover:bg-primary-hover transition-all text-sm"
            >
              لقد حفظت الرموز
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Modal */}
      <Dialog open={showRegenerateModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent dir="rtl" className="max-w-[340px] sm:max-w-sm rounded-3xl p-0 gap-0" showCloseButton={false}>
          <DialogHeader className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm sm:text-base font-semibold">
                إعادة توليد الرموز الاحتياطية
              </DialogTitle>
              <button
                onClick={closeModal}
                className="p-1.5 sm:p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </button>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-2.5 p-3 bg-warning/10 rounded-2xl border border-warning/20 mb-4">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                سيتم إلغاء جميع الرموز الاحتياطية الحالية وتوليد رموز جديدة. أدخل رمز التحقق للتأكيد.
              </p>
            </div>

            {/* OTP Input */}
            <div className="mb-4">
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
                className="mb-4 p-2.5 sm:p-3 bg-destructive/10 rounded-2xl flex items-center gap-2 text-destructive text-xs sm:text-sm border border-destructive/20"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              onClick={handleRegenerateBackupCodes}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-2xl font-semibold hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'توليد رموز جديدة'
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
