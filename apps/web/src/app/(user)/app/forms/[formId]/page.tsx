'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText,
  ArrowRight,
  Edit,
  Copy,
  ExternalLink,
  BarChart3,
  Eye,
  MessageSquare,
  Calendar,
  Clock,
  Globe,
  Lock,
  Users,
  Settings,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link2,
  Share2,
  QrCode,
  Mail,
  Bell,
  Layers,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DeleteFormModal } from '@/components/(app)/forms';
import { 
  useForms, 
  Form, 
  FormStatus,
  FormType,
  FORM_STATUS_LABELS,
  FORM_STATUS_CONFIG,
  FORM_TYPE_LABELS,
  FORM_TYPE_CONFIG,
  FIELD_TYPE_LABELS,
  FieldType
} from '@/lib/hooks/useForms';
import { format, formatDistanceToNow } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download } from 'lucide-react';
import { arSA } from 'date-fns/locale';

// ==================== CONSTANTS ====================

const FORM_TYPE_GRADIENTS: Record<FormType, string> = {
  [FormType.CONTACT]: 'from-blue-500 to-blue-600',
  [FormType.SURVEY]: 'from-purple-500 to-purple-600',
  [FormType.REGISTRATION]: 'from-emerald-500 to-emerald-600',
  [FormType.ORDER]: 'from-orange-500 to-orange-600',
  [FormType.FEEDBACK]: 'from-amber-500 to-amber-600',
  [FormType.QUIZ]: 'from-pink-500 to-pink-600',
  [FormType.APPLICATION]: 'from-indigo-500 to-indigo-600',
  [FormType.OTHER]: 'from-gray-500 to-gray-600',
};

const FORM_TYPE_LIGHT_GRADIENTS: Record<FormType, string> = {
  [FormType.CONTACT]: 'from-blue-50 to-blue-100',
  [FormType.SURVEY]: 'from-purple-50 to-purple-100',
  [FormType.REGISTRATION]: 'from-emerald-50 to-emerald-100',
  [FormType.ORDER]: 'from-orange-50 to-orange-100',
  [FormType.FEEDBACK]: 'from-amber-50 to-amber-100',
  [FormType.QUIZ]: 'from-pink-50 to-pink-100',
  [FormType.APPLICATION]: 'from-indigo-50 to-indigo-100',
  [FormType.OTHER]: 'from-gray-50 to-gray-100',
};

// ==================== COMPONENTS ====================

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color = 'gray' 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    gray: 'text-muted-foreground',
  };

  const iconColor = colorClasses[color] || colorClasses.gray;

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function SettingItem({ 
  icon: Icon, 
  label, 
  enabled 
}: { 
  icon: any; 
  label: string; 
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          enabled ? "bg-primary" : "bg-muted"
        )}>
          <Icon className={cn(
            "w-4 h-4",
            enabled ? "text-primary-foreground" : "text-muted-foreground"
          )} />
        </div>
        <span className={cn(
          "text-sm font-medium",
          enabled ? "text-foreground" : "text-muted-foreground"
        )}>{label}</span>
      </div>
      <div className={cn(
        "w-10 h-6 rounded-full relative transition-all",
        enabled ? "bg-primary" : "bg-muted"
      )}>
        <div className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-all",
          enabled ? "right-0.5" : "left-0.5"
        )} />
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function FormDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  
  const { getFormById, deleteForm, isLoading: hookLoading } = useForms();
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Load form data
  useEffect(() => {
    const loadForm = async () => {
      if (!formId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getFormById(formId);
        if (data) {
          setForm(data);
        } else {
          setError('لم يتم العثور على النموذج');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل النموذج');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId, getFormById]);

  // Computed values
  const formLink = form ? `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form.slug}` : '';
  const gradient = form ? FORM_TYPE_GRADIENTS[form.type] : FORM_TYPE_GRADIENTS[FormType.OTHER];
  const lightGradient = form ? FORM_TYPE_LIGHT_GRADIENTS[form.type] : FORM_TYPE_LIGHT_GRADIENTS[FormType.OTHER];
  const statusConfig = form ? FORM_STATUS_CONFIG[form.status] : FORM_STATUS_CONFIG[FormStatus.DRAFT];
  
  const submissionsCount = form?._count?.submissions || form?.submissionCount || 0;
  const fieldsCount = form?._count?.fields || form?.fields?.length || 0;

  // Handlers
  const handleCopyLink = async () => {
    if (!formLink) return;
    
    try {
      // Try using the modern clipboard API first
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(formLink);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = formLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Failed to copy
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = formLink;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Fallback copy failed:', e);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleOpenForm = () => {
    if (form?.slug) {
      window.open(`/f/${form.slug}`, '_blank');
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!form) return;
    
    setIsDeleting(true);
    const success = await deleteForm(form.id);
    
    if (success) {
      router.push('/forms');
    }
    
    setIsDeleting(false);
    setDeleteModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: arSA });
  };

  const formatTime = (date: string) => {
    return format(new Date(date), 'hh:mm a', { locale: arSA });
  };

  const formatRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { locale: arSA, addSuffix: true });
  };

  // Loading State
  if (loading) {
    return (
      <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">جاري تحميل النموذج...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !form) {
    return (
      <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {error || 'لم يتم العثور على النموذج'}
          </h2>
          <p className="text-muted-foreground mb-6">
            تأكد من صحة الرابط أو عد للنماذج
          </p>
          <Link
            href="/app/forms"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للنماذج</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4 sm:p-6 space-y-5">
          
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              href="/forms" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="text-sm font-medium">العودة للنماذج</span>
            </Link>
          </motion.div>

          {/* Form Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border/50 overflow-hidden"
          >
            {/* Form Info */}
            <div className="p-4 sm:p-6">
              {/* Top Row - Icon, Title, Status */}
              <div className="flex items-start gap-3 mb-3">
                {/* Form Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
                  gradient
                )}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                
                {/* Title & Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h1 className="text-base sm:text-lg font-bold text-foreground line-clamp-1">
                      {form.title}
                    </h1>
                    {/* Status Badge */}
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0",
                      statusConfig.bg,
                      statusConfig.color
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{
                        backgroundColor: form.status === FormStatus.PUBLISHED ? '#10b981' 
                          : form.status === FormStatus.DRAFT ? '#9ca3af'
                          : form.status === FormStatus.ARCHIVED ? '#f59e0b'
                          : '#ef4444'
                      }} />
                      {FORM_STATUS_LABELS[form.status]}
                    </span>
                  </div>
                  
                  {form.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {form.description}
                    </p>
                  )}

                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground">
                      {FORM_TYPE_CONFIG[form.type]?.icon} {FORM_TYPE_LABELS[form.type]}
                    </span>
                    {form.requiresAuthentication ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 text-amber-700">
                        <Lock className="w-2.5 h-2.5" />
                        خاص
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100 text-emerald-700">
                        <Globe className="w-2.5 h-2.5" />
                        عام
                      </span>
                    )}
                    {form.isMultiStep && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-700">
                        <Layers className="w-2.5 h-2.5" />
                        متعدد
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/40 my-4" />

              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{formatDate(form.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{formatRelativeTime(form.updatedAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/app/forms/${form.id}/edit`}
                  className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Edit className="w-4 h-4" />
                  <span>تحرير</span>
                </Link>
                
                <Link
                  href={`/app/forms/${form.id}/responses`}
                  className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-muted text-foreground rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>الإجابات</span>
                  {submissionsCount > 0 && (
                    <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                      {submissionsCount}
                    </span>
                  )}
                </Link>

                {form.status === FormStatus.PUBLISHED && (
                  <button
                    onClick={handleOpenForm}
                    className="p-2.5 sm:p-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors"
                    title="عرض النموذج"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleDeleteClick}
                  className="p-2.5 sm:p-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors"
                  title="حذف النموذج"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <StatCard 
              icon={MessageSquare} 
              label="الإجابات" 
              value={submissionsCount} 
              color="purple" 
            />
            <StatCard 
              icon={Eye} 
              label="المشاهدات" 
              value={form.viewCount || 0} 
              color="blue" 
            />
            <StatCard 
              icon={FileText} 
              label="الحقول" 
              value={fieldsCount} 
              color="green" 
            />
            <StatCard 
              icon={Layers} 
              label="الخطوات" 
              value={form.steps?.length || 1} 
              color="orange" 
            />
          </motion.div>

          {/* Two Column Grid */}
          <div className="grid lg:grid-cols-2 gap-4">
            
            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border/50 p-4"
            >
              <h2 className="flex items-center gap-2.5 text-base font-bold text-foreground mb-4">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-primary" />
                </div>
                مشاركة النموذج
              </h2>

              {/* Form Link */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-muted-foreground mb-2">رابط النموذج</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-muted rounded-xl text-sm text-foreground truncate border border-border/50 min-w-0">
                    <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="truncate font-mono text-xs" dir="ltr">{formLink}</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 flex-shrink-0",
                      copied 
                        ? "bg-emerald-500 text-white" 
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    )}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Slug */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-muted-foreground mb-2">المعرّف الفريد</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-muted rounded-xl text-sm text-foreground border border-border/50 font-mono">
                  <span className="text-primary">/</span>{form.slug}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleOpenForm}
                  disabled={form.status !== FormStatus.PUBLISHED}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-muted text-foreground rounded-xl text-sm font-medium border border-border/50 hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح</span>
                </button>
                <button 
                  onClick={() => setQrModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-muted text-foreground rounded-xl text-sm font-medium border border-border/50 hover:bg-muted/80 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR</span>
                </button>
              </div>
            </motion.div>

            {/* Settings Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border/50 p-4"
            >
              <h2 className="flex items-center gap-2.5 text-base font-bold text-foreground mb-4">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary" />
                </div>
                إعدادات النموذج
              </h2>

              <div className="space-y-1 bg-muted/30 rounded-xl p-2 border border-border/40">
                <SettingItem 
                  icon={Users} 
                  label="السماح بإجابات متعددة" 
                  enabled={form.allowMultipleSubmissions} 
                />
                <SettingItem 
                  icon={Lock} 
                  label="يتطلب تسجيل الدخول" 
                  enabled={form.requiresAuthentication} 
                />
                <SettingItem 
                  icon={BarChart3} 
                  label="عرض شريط التقدم" 
                  enabled={form.showProgressBar} 
                />
                <SettingItem 
                  icon={FileText} 
                  label="ترقيم الأسئلة" 
                  enabled={form.showQuestionNumbers} 
                />
                <SettingItem 
                  icon={Bell} 
                  label="إشعار عند الإجابة" 
                  enabled={form.notifyOnSubmission} 
                />
                <SettingItem 
                  icon={Mail} 
                  label="رد تلقائي" 
                  enabled={form.autoResponseEnabled} 
                />
              </div>
            </motion.div>
          </div>

          {/* Linked Resources */}
          {(form.linkedEvent || form.linkedStore) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl border border-border/50 p-4"
            >
              <h2 className="flex items-center gap-2.5 text-base font-bold text-foreground mb-4">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-primary" />
                </div>
                مرتبط بـ
              </h2>

              <div className="flex flex-wrap gap-3">
                {form.linkedEvent && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-xl border border-border/50">
                    <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">فعالية</p>
                      <p className="text-sm font-bold text-foreground">{form.linkedEvent.title}</p>
                    </div>
                  </div>
                )}
                {form.linkedStore && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-xl border border-border/50">
                    <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">متجر</p>
                      <p className="text-sm font-bold text-foreground">{form.linkedStore.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Fields Preview */}
          {form.fields && form.fields.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-2xl border border-border/50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2.5 text-base font-bold text-foreground">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  حقول النموذج
                </h2>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  {form.fields.length} حقل
                </span>
              </div>

              <div className="space-y-2 bg-muted/30 rounded-xl p-2 border border-border/40">
                {form.fields.slice(0, 5).map((field, index) => (
                  <div 
                    key={field.id}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 hover:border-border transition-colors"
                  >
                    <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {field.label}
                        {field.required && <span className="text-destructive mr-1">*</span>}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                      {FIELD_TYPE_LABELS[field.type as FieldType] || field.type}
                    </span>
                  </div>
                ))}
                
                {form.fields.length > 5 && (
                  <div className="text-center py-2">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-4 py-2 rounded-full">
                      +{form.fields.length - 5} حقول أخرى
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Time Restrictions */}
          {(form.opensAt || form.closesAt) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card rounded-2xl border border-border/50 p-4"
            >
              <h2 className="flex items-center gap-2.5 text-base font-bold text-foreground mb-4">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                فترة الاستقبال
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                {form.opensAt && (
                  <div className="p-4 bg-muted rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-bold text-emerald-600">يفتح في</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {formatDate(form.opensAt)}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      {formatTime(form.opensAt)}
                    </p>
                  </div>
                )}
                {form.closesAt && (
                  <div className="p-4 bg-muted rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-destructive flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-destructive-foreground" />
                      </div>
                      <p className="text-xs font-bold text-destructive">يغلق في</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {formatDate(form.closesAt)}
                    </p>
                    <p className="text-xs text-destructive font-medium mt-1">
                      {formatTime(form.closesAt)}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>

      {/* Delete Modal */}
      <DeleteFormModal
        isOpen={deleteModalOpen}
        formTitle={form.title}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQrModalOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-card rounded-2xl border border-border/50 w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">رمز QR</h3>
                  </div>
                  <button
                    onClick={() => setQrModalOpen(false)}
                    className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* QR Code */}
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-background rounded-2xl border-2 border-border/50">
                      <QRCodeSVG 
                        value={formLink}
                        size={180}
                        level="H"
                        includeMargin={false}
                        bgColor="#ffffff"
                        fgColor="#111827"
                      />
                    </div>
                  </div>

                  {/* Form Title */}
                  <p className="text-center text-sm font-bold text-foreground mb-2">
                    {form.title}
                  </p>
                  <p className="text-center text-xs text-muted-foreground mb-4 font-mono bg-muted py-2 px-4 rounded-xl mx-auto inline-block" dir="ltr">
                    /{form.slug}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const svg = document.querySelector('#qr-code-svg svg');
                        if (svg) {
                          const svgData = new XMLSerializer().serializeToString(svg);
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          const img = new Image();
                          img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx?.drawImage(img, 0, 0);
                            const pngFile = canvas.toDataURL('image/png');
                            const downloadLink = document.createElement('a');
                            downloadLink.download = `qr-${form.slug}.png`;
                            downloadLink.href = pngFile;
                            downloadLink.click();
                          };
                          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                        copied 
                          ? "bg-emerald-500 text-white" 
                          : "bg-muted text-foreground hover:bg-muted/80"
                      )}
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'تم!' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>

                {/* Hidden QR for download */}
                <div id="qr-code-svg" className="hidden">
                  <QRCodeSVG 
                    value={formLink}
                    size={512}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#111827"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}
