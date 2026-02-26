'use client';

/**
 * ✅ Verification Request - User Settings Component
 * Allows users to request account verification by providing social media screenshots
 * or contact support@rukny.io for Iraqi business verification.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock,
  Eye,
  XCircle,
  Upload,
  X,
  Plus,
  Trash2,
  Building2,
  User,
  Loader2,
  Send,
  Mail,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api, { getApiClient } from '@/lib/api/client';

// ─── Types ───────────────────────────────────────────

interface SocialLink {
  platform: string;
  url: string;
}

interface VerificationData {
  isVerified: boolean;
  verifiedAt: string | null;
  request: {
    id: string;
    type: string;
    status: string;
    fullName: string;
    socialLinks: SocialLink[] | null;
    screenshots: string[];
    businessName: string | null;
    businessEmail: string | null;
    notes: string | null;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}

const PLATFORMS = [
  'Instagram',
  'Twitter / X',
  'Facebook',
  'TikTok',
  'YouTube',
  'Snapchat',
  'LinkedIn',
  'Telegram',
  'WhatsApp',
];

// ─── Main Export ─────────────────────────────────────

export function VerificationRequest() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<VerificationData | null>(null);

  // Form state
  const [type, setType] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL');
  const [fullName, setFullName] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([{ platform: 'Instagram', url: '' }]);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<VerificationData>('user/verification-request');
      setData(res.data);
    } catch {
      // No existing request
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - screenshots.length;
    const newFiles = files.slice(0, remaining);

    if (newFiles.length === 0) return;

    // Validate sizes
    for (const f of newFiles) {
      if (f.size > 5 * 1024 * 1024) {
        setError('حجم كل صورة يجب أن لا يتجاوز 5 ميغابايت');
        return;
      }
    }

    setScreenshots((prev) => [...prev, ...newFiles]);

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScreenshotPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addSocialLink = () => {
    if (socialLinks.length < 10) {
      setSocialLinks((prev) => [...prev, { platform: 'Instagram', url: '' }]);
    }
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setSocialLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const handleSubmit = async () => {
    setError('');

    if (!fullName.trim()) {
      setError('الاسم الكامل مطلوب');
      return;
    }

    if (type === 'PERSONAL') {
      const validLinks = socialLinks.filter((l) => l.url.trim());
      if (validLinks.length === 0) {
        setError('أضف رابط واحد على الأقل لحساباتك على منصات التواصل الاجتماعي');
        return;
      }
      if (screenshots.length === 0) {
        setError('قم برفع صورة واحدة على الأقل لصفحاتك على منصات التواصل');
        return;
      }
    }

    if (type === 'BUSINESS') {
      if (!businessName.trim()) {
        setError('اسم الشركة أو النشاط التجاري مطلوب');
        return;
      }
      if (!businessEmail.trim()) {
        setError('البريد الإلكتروني للشركة مطلوب');
        return;
      }
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('type', type);
      formData.append('fullName', fullName.trim());

      if (type === 'PERSONAL') {
        const validLinks = socialLinks.filter((l) => l.url.trim());
        formData.append('socialLinks', JSON.stringify(validLinks));
        screenshots.forEach((file) => {
          formData.append('screenshots', file);
        });
      } else {
        formData.append('businessName', businessName.trim());
        formData.append('businessEmail', businessEmail.trim());
      }

      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const client = getApiClient();
      await client.upload('user/verification-request', formData);

      // Refresh status
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading State ─────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Already Verified ──────────────────────────────

  if (data?.isVerified) {
    return (
      <div className="p-4 sm:p-6" dir="rtl">
        <div className="rounded-xl bg-emerald-500/5 p-6">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <BadgeCheck className="h-7 w-7 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">حسابك موثّق</h3>
            <p className="text-sm text-muted-foreground">
              تم توثيق حسابك بنجاح
              {data.verifiedAt && (
                <> في {new Date(data.verifiedAt).toLocaleDateString('ar-IQ')}</>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Existing Pending Request ──────────────────────

  if (data?.request && (data.request.status === 'PENDING' || data.request.status === 'UNDER_REVIEW')) {
    return (
      <div className="p-4 sm:p-6" dir="rtl">
        <div className="rounded-xl bg-amber-500/5 p-6">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Clock className="h-7 w-7 text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">طلبك قيد المراجعة</h3>
            <p className="text-sm text-muted-foreground mb-3">
              تم إرسال طلب التوثيق بتاريخ{' '}
              {new Date(data.request.createdAt).toLocaleDateString('ar-IQ')}
            </p>
            <span className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
              data.request.status === 'PENDING'
                ? "bg-amber-500/10 text-amber-600"
                : "bg-blue-500/10 text-blue-600",
            )}>
              {data.request.status === 'PENDING' ? (
                <><Clock className="h-3 w-3" /> بانتظار المراجعة</>
              ) : (
                <><Eye className="h-3 w-3" /> قيد المراجعة</>
              )}
            </span>
          </div>

          {/* Request details */}
          <div className="mt-4 pt-4 border-t border-amber-500/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">نوع التوثيق</span>
              <span className="font-medium text-foreground">
                {data.request.type === 'PERSONAL' ? 'شخصي' : 'شركة / نشاط تجاري'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">الاسم</span>
              <span className="font-medium text-foreground">{data.request.fullName}</span>
            </div>
            {data.request.businessName && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">اسم الشركة</span>
                <span className="font-medium text-foreground">{data.request.businessName}</span>
              </div>
            )}
            {data.request.screenshots.length > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">الصور المرفقة</span>
                <span className="font-medium text-foreground">
                  {data.request.screenshots.length} صورة
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Rejected Request ──────────────────────────────

  const wasRejected = data?.request?.status === 'REJECTED';

  // ─── Submission Form ───────────────────────────────

  return (
    <div className="p-4 sm:p-6 pb-28 md:pb-6" dir="rtl">
      {/* Rejected notice */}
      {wasRejected && (
        <div className="rounded-xl bg-rose-500/5 p-4 mb-6">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">تم رفض طلبك السابق</p>
              {data?.request?.rejectionReason && (
                <p className="text-xs text-muted-foreground mt-1">
                  السبب: {data.request.rejectionReason}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                يمكنك إرسال طلب جديد أدناه
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Type Selection */}
      <div className="mb-6">
        <h3 className="text-[13px] font-bold text-foreground mb-3">نوع التوثيق</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('PERSONAL')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
              type === 'PERSONAL'
                ? 'bg-primary/5 ring-2 ring-primary'
                : 'bg-muted/30 hover:bg-muted/50',
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              type === 'PERSONAL' ? 'bg-primary/10' : 'bg-muted/50',
            )}>
              <User className={cn('h-5 w-5', type === 'PERSONAL' ? 'text-primary' : 'text-muted-foreground')} />
            </div>
            <span className="text-sm font-medium text-foreground">حساب شخصي</span>
            <span className="text-[10px] text-muted-foreground text-center">
              رفع صور من منصات التواصل
            </span>
          </button>

          <button
            type="button"
            onClick={() => setType('BUSINESS')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
              type === 'BUSINESS'
                ? 'bg-primary/5 ring-2 ring-primary'
                : 'bg-muted/30 hover:bg-muted/50',
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              type === 'BUSINESS' ? 'bg-primary/10' : 'bg-muted/50',
            )}>
              <Building2 className={cn('h-5 w-5', type === 'BUSINESS' ? 'text-primary' : 'text-muted-foreground')} />
            </div>
            <span className="text-sm font-medium text-foreground">شركة / نشاط تجاري</span>
            <span className="text-[10px] text-muted-foreground text-center">
              توثيق عبر البريد الإلكتروني
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-border/30 my-5" />

      {/* Full Name */}
      <div className="mb-6">
        <label className="text-[13px] font-bold text-foreground mb-2 block">الاسم الكامل</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="أدخل اسمك الكامل كما يظهر في حساباتك"
          className="w-full px-3.5 py-2.5 rounded-xl bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Personal: Social Links */}
      <AnimatePresence mode="wait">
        {type === 'PERSONAL' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30 mb-5" />

            {/* Social Links */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-foreground">روابط التواصل الاجتماعي</h3>
                {socialLinks.length < 10 && (
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="flex items-center gap-1 text-[11px] text-primary font-medium hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    إضافة
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {socialLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(i, 'platform', e.target.value)}
                      className="w-32 shrink-0 px-2.5 py-2.5 rounded-xl bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                      placeholder="رابط الملف الشخصي"
                      dir="ltr"
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-muted/30 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    {socialLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSocialLink(i)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border/30 mb-5" />

            {/* Screenshots Upload */}
            <div className="mb-6">
              <h3 className="text-[13px] font-bold text-foreground mb-1">صور صفحات التواصل</h3>
              <p className="text-[11px] text-muted-foreground mb-3">
                قم برفع لقطات شاشة لصفحاتك على منصات التواصل الاجتماعي (حد أقصى 5 صور، 5 ميغابايت لكل صورة)
              </p>

              {/* Previews */}
              {screenshotPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {screenshotPreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-muted/30 group">
                      <img src={preview} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(i)}
                        className="absolute top-1 left-1 p-1 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {screenshots.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    اضغط لرفع الصور ({screenshots.length}/5)
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </motion.div>
        )}

        {type === 'BUSINESS' && (
          <motion.div
            key="business"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30 mb-5" />

            {/* Business Info */}
            <div className="mb-6 space-y-4">
              <h3 className="text-[13px] font-bold text-foreground">معلومات الشركة</h3>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
                  اسم الشركة / النشاط التجاري
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="أدخل اسم الشركة أو النشاط التجاري"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
                  البريد الإلكتروني للشركة
                </label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="info@yourcompany.com"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Email notice */}
            <div className="rounded-xl bg-amber-500/5 p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    توثيق الشركات العراقية
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    بعد إرسال هذا الطلب، يرجى إرسال بريد إلكتروني يحتوي على طلب توثيق للحساب وسوف يتم مراجعة الطلب بشكل سريع قم بارسال الطلب إلى{' '}
                    <a
                      href="mailto:support@rukny.io"
                      className="font-medium text-primary hover:underline"
                      dir="ltr"
                    >
                      support@rukny.io
                    </a>
                    {' '}لإتمام عملية التوثيق.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-border/30 my-5" />

      {/* Notes */}
      <div className="mb-6">
        <label className="text-[13px] font-bold text-foreground mb-2 block">ملاحظات إضافية</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="أضف أي ملاحظات إضافية تساعد في مراجعة طلبك (اختياري)"
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 mb-4">
          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all disabled:opacity-60"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...</>
        ) : (
          <><Send className="h-4 w-4" /> إرسال طلب التوثيق</>
        )}
      </button>
    </div>
  );
}