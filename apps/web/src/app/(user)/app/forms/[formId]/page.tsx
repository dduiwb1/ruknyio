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
  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-500', text: 'text-blue-600' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-500', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-500', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-500', text: 'text-orange-600' },
    gray: { bg: 'bg-gray-50', icon: 'text-gray-500', text: 'text-gray-600' },
  };

  const colors = colorClasses[color] || colorClasses.gray;

  return (
    <div className={cn(
      "flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-white border border-gray-100",
      colors.bg
    )}>
      <div className={cn(
        "w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center bg-white shadow-sm flex-shrink-0",
      )}>
        <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", colors.icon)} />
      </div>
      <div className="min-w-0">
        <p className={cn("text-base sm:text-xl font-bold leading-tight", colors.text)}>{value}</p>
        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{label}</p>
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
    <div className="flex items-center justify-between py-1.5 sm:py-2">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-gray-600 truncate">{label}</span>
      </div>
      {enabled ? (
        <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="hidden xs:inline">مفعّل</span>
          <span className="xs:hidden">✓</span>
        </span>
      ) : (
        <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-gray-400 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
          <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="hidden xs:inline">معطّل</span>
          <span className="xs:hidden">✗</span>
        </span>
      )}
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
      console.error('Failed to copy:', err);
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
            <Loader2 className="w-12 h-12 text-muted-foreground animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري تحميل النموذج...</p>
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
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {error || 'لم يتم العثور على النموذج'}
          </h2>
          <p className="text-muted-foreground mb-6">
            تأكد من صحة الرابط أو عد للنماذج
          </p>
          <Link
            href="/app/forms"
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity"
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
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="text-sm">العودة للنماذج</span>
            </Link>
          </motion.div>

          {/* Form Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6"
          >
            {/* Form Info */}
            <div className="p-4 sm:p-6">
              {/* Top Row - Icon, Title, Status */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                {/* Form Icon */}
                <div className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
                  gradient
                )}>
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                
                {/* Title & Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">
                      {form.title}
                    </h1>
                    {/* Status Badge */}
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0",
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
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 mb-2">
                      {form.description}
                    </p>
                  )}

                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600">
                      {FORM_TYPE_CONFIG[form.type]?.icon} {FORM_TYPE_LABELS[form.type]}
                    </span>
                    {form.requiresAuthentication ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-amber-50 text-amber-600">
                        <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        خاص
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-600">
                        <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        عام
                      </span>
                    )}
                    {form.isMultiStep && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-blue-50 text-blue-600">
                        <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        متعدد
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-3 sm:my-4" />

              {/* Meta Info Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{formatDate(form.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{formatRelativeTime(form.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/app/forms/${form.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-900 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>تحرير</span>
                </Link>
                
                <Link
                  href={`/app/forms/${form.id}/responses`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>الإجابات</span>
                  {submissionsCount > 0 && (
                    <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                      {submissionsCount}
                    </span>
                  )}
                </Link>

                {form.status === FormStatus.PUBLISHED && (
                  <button
                    onClick={handleOpenForm}
                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                    title="عرض النموذج"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleDeleteClick}
                  className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
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
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
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
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
            >
              <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 mb-4">
                <Share2 className="w-5 h-5 text-gray-400" />
                مشاركة النموذج
              </h2>

              {/* Form Link */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm text-gray-500 mb-1.5 sm:mb-2">رابط النموذج</label>
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="flex-1 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 bg-gray-50 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-600 truncate border border-gray-100 min-w-0">
                    <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate" dir="ltr">{formLink}</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      "px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0",
                      copied 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    )}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Slug */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm text-gray-500 mb-1.5 sm:mb-2">المعرّف الفريد (Slug)</label>
                <div className="flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 bg-gray-50 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-600 border border-gray-100 font-mono truncate">
                  {form.slug}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-1.5 sm:gap-2">
                <button 
                  onClick={handleOpenForm}
                  disabled={form.status !== FormStatus.PUBLISHED}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 text-gray-600 rounded-lg sm:rounded-xl text-xs sm:text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>فتح</span>
                </button>
                <button 
                  onClick={() => setQrModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 text-gray-600 rounded-lg sm:rounded-xl text-xs sm:text-sm hover:bg-gray-100 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>QR</span>
                </button>
              </div>
            </motion.div>

            {/* Settings Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
            >
              <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 mb-4">
                <Settings className="w-5 h-5 text-gray-400" />
                إعدادات النموذج
              </h2>

              <div className="space-y-1 divide-y divide-gray-50">
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
              className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
            >
              <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 mb-4">
                <Link2 className="w-5 h-5 text-gray-400" />
                مرتبط بـ
              </h2>

              <div className="flex flex-wrap gap-3">
                {form.linkedEvent && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-purple-500">فعالية</p>
                      <p className="text-sm font-medium text-purple-700">{form.linkedEvent.title}</p>
                    </div>
                  </div>
                )}
                {form.linkedStore && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl">
                    <Globe className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-xs text-emerald-500">متجر</p>
                      <p className="text-sm font-medium text-emerald-700">{form.linkedStore.name}</p>
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
              className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                  <FileText className="w-5 h-5 text-gray-400" />
                  حقول النموذج
                </h2>
                <span className="text-sm text-gray-500">
                  {form.fields.length} حقل
                </span>
              </div>

              <div className="space-y-2">
                {form.fields.slice(0, 5).map((field, index) => (
                  <div 
                    key={field.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="w-6 h-6 rounded-lg bg-white text-xs font-medium text-gray-500 flex items-center justify-center shadow-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {field.label}
                        {field.required && <span className="text-red-500 mr-1">*</span>}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-lg">
                      {FIELD_TYPE_LABELS[field.type as FieldType] || field.type}
                    </span>
                  </div>
                ))}
                
                {form.fields.length > 5 && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-400">
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
              className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
            >
              <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 mb-4">
                <Clock className="w-5 h-5 text-gray-400" />
                فترة الاستقبال
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {form.opensAt && (
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <p className="text-xs text-emerald-600 mb-1">يفتح في</p>
                    <p className="text-sm font-medium text-emerald-700">
                      {formatDate(form.opensAt)} - {formatTime(form.opensAt)}
                    </p>
                  </div>
                )}
                {form.closesAt && (
                  <div className="p-3 bg-red-50 rounded-xl">
                    <p className="text-xs text-red-600 mb-1">يغلق في</p>
                    <p className="text-sm font-medium text-red-700">
                      {formatDate(form.closesAt)} - {formatTime(form.closesAt)}
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-gray-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">رمز QR</h3>
                  </div>
                  <button
                    onClick={() => setQrModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* QR Code */}
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
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
                  <p className="text-center text-sm font-medium text-gray-900 mb-1">
                    {form.title}
                  </p>
                  <p className="text-center text-xs text-gray-400 mb-4 font-mono" dir="ltr">
                    {form.slug}
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل PNG</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        copied 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
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

      {/* Bottom Blur Gradient Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
}
