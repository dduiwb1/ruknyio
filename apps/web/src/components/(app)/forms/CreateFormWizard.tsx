'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  FileText,
  Mail,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  Loader2,
  ImageIcon,
  Layers,
  Image as ImageLucide,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Search,
  Type,
  AlignLeft,
  Hash,
  Phone,
  Calendar,
  Clock,
  List,
  CircleDot,
  CheckSquare,
  Paperclip,
  Star,
  SlidersHorizontal,
  ToggleLeft,
  Grid3X3,
  PenTool,
  Upload,
  Image,
  Files,
  CheckCircle2,
  Cloud,
  FolderOpen,
  Sheet,
  Zap,
  Shield,
  Share2,
  HardDrive,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProgressIndicator from '@/components/ui/progress-indicator';
import { 
  useForms, 
  FormType, 
  FormStatus,
  FieldType,
  FORM_TYPE_LABELS,
  FORM_STATUS_LABELS,
  FIELD_TYPE_LABELS,
} from '@/lib/hooks/useForms';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';
import { type FormFieldInput } from './FieldEditor';
import { StepEditor, type FormStepInput } from './StepEditor';
import FormBannersUpload, { type BannerDisplayMode } from './FormBannersUpload';
import { FormTemplateSelector, type TemplateLanguage, getTemplateById } from './templates';
import { type FormTheme, DEFAULT_THEME } from './FormThemeCustomizer';
import { useGoogleSheets } from '@/lib/hooks/useGoogleSheets';
import { useAuth } from '@/providers/auth-provider';
import { isValidFormSlug } from '@/lib/utils/generateFormSlug';

// LocalStorage key for preview data (must match /app/forms/preview pages)
const FORM_PREVIEW_KEY = 'rukny_form_preview';

// ============================================
// Constants
// ============================================

const TOTAL_STEPS = 6;

type StorageOption = 's3' | 'google_drive' | null;

// ============================================
// Field type definitions for Add Field dialog
// ============================================

interface FieldTypeOption {
  type: FieldType;
  icon: React.ElementType;
  label: string;
  description: string;
}

const SUGGESTED_FIELDS: FieldTypeOption[] = [
  { type: FieldType.TEXT, icon: Type, label: 'الاسم', description: 'حقل نص قصير' },
  { type: FieldType.PHONE, icon: Phone, label: 'رقم الهاتف', description: 'رقم هاتف مع التحقق' },
  { type: FieldType.EMAIL, icon: Mail, label: 'البريد الإلكتروني', description: 'بريد مع التحقق' },
  { type: FieldType.DATE, icon: Calendar, label: 'تاريخ الميلاد', description: 'اختيار تاريخ' },
];

const ALL_FIELD_TYPES: FieldTypeOption[] = [
  { type: FieldType.TEXT, icon: Type, label: 'نص قصير', description: 'سطر واحد' },
  { type: FieldType.TEXTAREA, icon: AlignLeft, label: 'نص طويل', description: 'متعدد الأسطر' },
  { type: FieldType.SELECT, icon: List, label: 'قائمة منسدلة', description: 'اختيار من قائمة' },
  { type: FieldType.RADIO, icon: CircleDot, label: 'اختيار واحد', description: 'خيار واحد فقط' },
  { type: FieldType.CHECKBOX, icon: CheckSquare, label: 'اختيار متعدد', description: 'خيارات متعددة' },
  { type: FieldType.TOGGLE, icon: ToggleLeft, label: 'تبديل', description: 'نعم / لا' },
  { type: FieldType.NUMBER, icon: Hash, label: 'رقم', description: 'إدخال رقمي' },
  { type: FieldType.EMAIL, icon: Mail, label: 'بريد إلكتروني', description: 'مع التحقق' },
  { type: FieldType.PHONE, icon: Phone, label: 'هاتف', description: 'رقم هاتف' },
  { type: FieldType.DATE, icon: Calendar, label: 'تاريخ', description: 'اختيار تاريخ' },
  { type: FieldType.TIME, icon: Clock, label: 'وقت', description: 'اختيار وقت' },
  { type: FieldType.DATETIME, icon: Calendar, label: 'تاريخ ووقت', description: 'تاريخ ووقت معاً' },
  { type: FieldType.FILE, icon: Paperclip, label: 'رفع ملف', description: 'رفع مستند أو صورة' },
  { type: FieldType.RATING, icon: Star, label: 'تقييم', description: 'تقييم بالنجوم' },
  { type: FieldType.SCALE, icon: SlidersHorizontal, label: 'مقياس', description: 'مقياس رقمي' },
  { type: FieldType.MATRIX, icon: Grid3X3, label: 'جدول', description: 'جدول اختيارات' },
  { type: FieldType.SIGNATURE, icon: PenTool, label: 'توقيع', description: 'توقيع يدوي' },
];

// Get icon for a field type
const getFieldTypeIcon = (type: FieldType): React.ElementType => {
  const found = ALL_FIELD_TYPES.find(f => f.type === type);
  return found?.icon || FileText;
};

// ملف: أنواع مسبقة للاختيار
const FILE_TYPE_PRESETS: { id: string; label: string; types: string[] }[] = [
  { id: 'images', label: 'صور', types: ['image/*'] },
  { id: 'docs', label: 'مستندات', types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  { id: 'all', label: 'الكل', types: ['*/*'] },
];

// توقيع: ألوان القلم
const SIGNATURE_PEN_COLORS = [
  { value: '#0f172a', label: 'أسود' },
  { value: '#1e40af', label: 'أزرق' },
  { value: '#166534', label: 'أخضر' },
  { value: '#991b1b', label: 'أحمر' },
];

// صف حقل قابل للسحب — كل صف له useDragControls خاص لتفادي سحب العنصر الخاطئ
function DraggableFieldRow({
  field,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: {
  field: FormFieldInput;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();
  const FieldIcon = getFieldTypeIcon(field.type);
  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={dragControls}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
      className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-2xl border border-transparent hover:border-border transition-colors duration-200 group cursor-default outline-none select-none data-[dragging=true]:z-10 data-[dragging=true]:shadow-lg data-[dragging=true]:scale-[1.02] data-[dragging=true]:border-primary/30"
    >
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          dragControls.start(e);
        }}
        className="flex flex-shrink-0 cursor-grab active:cursor-grabbing touch-none p-1 -m-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="سحب لإعادة الترتيب"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex flex-col -space-y-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 rounded-md hover:bg-background disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
          aria-label="تحريك لأعلى"
        >
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1 rounded-md hover:bg-background disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
          aria-label="تحريك لأسفل"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <FieldIcon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground truncate">
            {field.label || FIELD_TYPE_LABELS[field.type as FieldType]}
          </span>
          {field.required && <span className="text-destructive text-xs font-bold">*</span>}
        </div>
        <span className="text-xs text-muted-foreground">
          {FIELD_TYPE_LABELS[field.type as FieldType]}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={onEdit} className="p-2 rounded-xl hover:bg-background transition-colors" aria-label="تعديل">
          <Edit2 className="w-4 h-4 text-muted-foreground" />
        </button>
        <button type="button" onClick={onDelete} className="p-2 rounded-xl hover:bg-destructive/10 transition-colors" aria-label="حذف">
          <Trash2 className="w-4 h-4 text-destructive/70" />
        </button>
      </div>
    </Reorder.Item>
  );
}

// ============================================
// Types
// ============================================

// Draft shape for optional restore (only when user explicitly chooses "متابعة المسودة")
export type FormDraftRestore = {
  currentStep?: number;
  selectedTemplateId?: string | null;
  templateLanguage?: TemplateLanguage;
  title?: string;
  slug?: string;
  description?: string;
  formType?: FormType;
  status?: FormStatus;
  isMultiStep?: boolean;
  fields?: FormFieldInput[];
  formSteps?: FormStepInput[];
  allowMultipleSubmissions?: boolean;
  requiresAuthentication?: boolean;
  showProgressBar?: boolean;
  showQuestionNumbers?: boolean;
  notifyOnSubmission?: boolean;
  notificationEmail?: string;
  formTheme?: FormTheme;
  enableGoogleSheets?: boolean;
  storageOption?: StorageOption;
};

// ============================================
// Component
// ============================================

interface CreateFormWizardProps {
  initialDraft?: FormDraftRestore | null;
  initialSlug?: string;
}

export function CreateFormWizard({ initialDraft, initialSlug }: CreateFormWizardProps = {}) {
  const router = useRouter();
  const { createForm, isLoading } = useForms();
  const { connect: connectGoogleSheets } = useGoogleSheets();
  const { user, isAuthenticated } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step 1: Template Selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateLanguage, setTemplateLanguage] = useState<TemplateLanguage>('ar');
  
  // Theme (for phone preview)
  const [formTheme, setFormTheme] = useState<FormTheme>(DEFAULT_THEME);
  
  // Step 2: Basic Info
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState(initialSlug || '');
  const [description, setDescription] = useState('');
  const [formType, setFormType] = useState<FormType>(FormType.SURVEY);
  const [status, setStatus] = useState<FormStatus>(FormStatus.DRAFT);
  // Banners state (cover images)
  const [banners, setBanners] = useState<(File | string)[]>([]);
  const [bannerDisplayMode, setBannerDisplayMode] = useState<BannerDisplayMode>('single');
  const [isMultiStep, setIsMultiStep] = useState(false);
  const [showBannerDialog, setShowBannerDialog] = useState(false);
  
  // Step 3: Fields (single-step form)
  const [fields, setFields] = useState<FormFieldInput[]>([]);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldSearchQuery, setFieldSearchQuery] = useState('');
  
  // Step 3: Steps (multi-step form)
  const [formSteps, setFormSteps] = useState<FormStepInput[]>([]);
  
  // Step 4: Settings
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(false);

  // Step 5: Integrations
  const [enableGoogleSheets, setEnableGoogleSheets] = useState(false);
  const [storageOption, setStorageOption] = useState<StorageOption>(null);
  const [requiresAuthentication, setRequiresAuthentication] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(true);
  const [notifyOnSubmission, setNotifyOnSubmission] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');

  // Generate unique slug
  const generateSlug = useCallback(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  // Restore state from initialDraft if provided
  useEffect(() => {
    if (initialDraft) {
      if (initialDraft.currentStep) setCurrentStep(initialDraft.currentStep);
      if (initialDraft.selectedTemplateId !== undefined) setSelectedTemplateId(initialDraft.selectedTemplateId);
      if (initialDraft.templateLanguage) setTemplateLanguage(initialDraft.templateLanguage);
      if (initialDraft.title) setTitle(initialDraft.title);
      if (initialDraft.slug) setSlug(initialDraft.slug);
      if (initialDraft.description) setDescription(initialDraft.description);
      if (initialDraft.formType) setFormType(initialDraft.formType);
      if (initialDraft.status) setStatus(initialDraft.status);
      if (initialDraft.isMultiStep !== undefined) setIsMultiStep(initialDraft.isMultiStep);
      if (initialDraft.fields) setFields(initialDraft.fields);
      if (initialDraft.formSteps) setFormSteps(initialDraft.formSteps);
      if (initialDraft.allowMultipleSubmissions !== undefined) setAllowMultipleSubmissions(initialDraft.allowMultipleSubmissions);
      if (initialDraft.requiresAuthentication !== undefined) setRequiresAuthentication(initialDraft.requiresAuthentication);
      if (initialDraft.showProgressBar !== undefined) setShowProgressBar(initialDraft.showProgressBar);
      if (initialDraft.showQuestionNumbers !== undefined) setShowQuestionNumbers(initialDraft.showQuestionNumbers);
      if (initialDraft.notifyOnSubmission !== undefined) setNotifyOnSubmission(initialDraft.notifyOnSubmission);
      if (initialDraft.notificationEmail) setNotificationEmail(initialDraft.notificationEmail);
      if (initialDraft.formTheme) setFormTheme(initialDraft.formTheme);
      if (initialDraft.enableGoogleSheets !== undefined) setEnableGoogleSheets(initialDraft.enableGoogleSheets);
      if (initialDraft.storageOption !== undefined) setStorageOption(initialDraft.storageOption);
    } else if (!slug) {
      setSlug(generateSlug());
    }
  }, [initialDraft]);

  // Handle template selection
  const handleSelectTemplate = (templateId: string | null, templateFields: FormFieldInput[]) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setTitle(template.name[templateLanguage]);
        setDescription(template.description[templateLanguage]);
        setFields(templateFields);
      }
    }
  };

  // Handle start from scratch
  const handleStartFromScratch = () => {
    setSelectedTemplateId(null);
    setTitle('');
    setDescription('');
    setFields([]);
  };

  // Handle language change
  const handleTemplateLanguageChange = (language: TemplateLanguage) => {
    setTemplateLanguage(language);
  };

  // Helper to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGoToPreview = useCallback(() => {
    if (!slug || !isValidFormSlug(slug)) {
      toast.error('الرجاء إدخال رابط صالح للمعاينة');
      return;
    }

    // Prefer a stable banner URL. For File objects, use an object URL (works best with same-tab navigation).
    let bannerUrl: string | undefined;
    const firstBanner = banners[0];
    if (typeof firstBanner === 'string') {
      bannerUrl = firstBanner;
    } else if (firstBanner instanceof File) {
      try {
        bannerUrl = URL.createObjectURL(firstBanner);
      } catch {
        bannerUrl = undefined;
      }
    }

    const previewData = {
      title: title || 'نموذج بدون عنوان',
      description,
      slug,
      userId: user?.id,
      fields: isMultiStep ? [] : fields,
      isMultiStep,
      steps: formSteps,
      theme: formTheme,
      bannerUrl,
      allowMultipleSubmissions,
      requiresAuthentication,
      showProgressBar,
      showQuestionNumbers,
    };

    // Light security: don't allow preview without auth for user-scoped pages.
    if (!isAuthenticated || !user) {
      toast.error('يجب تسجيل الدخول للمعاينة');
      router.push('/login');
      return;
    }

    localStorage.setItem(FORM_PREVIEW_KEY, JSON.stringify(previewData));
    window.open(`/app/forms/preview/${slug}`, '_blank');
  }, [
    slug,
    title,
    description,
    user,
    isAuthenticated,
    fields,
    isMultiStep,
    formSteps,
    formTheme,
    banners,
    allowMultipleSubmissions,
    requiresAuthentication,
    showProgressBar,
    showQuestionNumbers,
    router,
  ]);

  // Add new field (مع قيم افتراضية لكل نوع)
  const handleAddField = (type: FieldType) => {
    const newField: FormFieldInput = {
      id: `field-${Date.now()}`,
      label: FIELD_TYPE_LABELS[type],
      type,
      order: fields.length,
      required: false,
      placeholder: '',
      options: type === FieldType.SELECT || type === FieldType.RADIO || type === FieldType.CHECKBOX
        ? ['خيار 1', 'خيار 2', 'خيار 3']
        : type === FieldType.RANKING
          ? ['العنصر 1', 'العنصر 2', 'العنصر 3']
          : undefined,
      minValue: type === FieldType.RATING ? 1 : type === FieldType.SCALE ? 0 : undefined,
      maxValue: type === FieldType.RATING ? 5 : type === FieldType.SCALE ? 10 : undefined,
      matrixRows: type === FieldType.MATRIX ? ['صف 1', 'صف 2'] : undefined,
      matrixColumns: type === FieldType.MATRIX ? ['ضعيف', 'مقبول', 'جيد', 'ممتاز'] : undefined,
      signaturePenColor: type === FieldType.SIGNATURE ? '#0f172a' : undefined,
      signaturePenWidth: type === FieldType.SIGNATURE ? 2 : undefined,
      toggleLabelOn: type === FieldType.TOGGLE ? 'نعم' : undefined,
      toggleLabelOff: type === FieldType.TOGGLE ? 'لا' : undefined,
      maxFileSize: type === FieldType.FILE ? 10 * 1024 * 1024 : undefined,
      maxFiles: type === FieldType.FILE ? 1 : undefined,
      allowedFileTypes: type === FieldType.FILE ? ['*/*'] : undefined,
    };
    setFields(prev => [...prev, newField]);
    setShowFieldSelector(false);
    setEditingFieldId(newField.id);
  };

  // Update field
  const handleUpdateField = (id: string, updates: Partial<FormFieldInput>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  // Delete field
  const handleDeleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (editingFieldId === id) setEditingFieldId(null);
  };

  // Duplicate field
  const handleDuplicateField = (id: string) => {
    const field = fields.find(f => f.id === id);
    if (field) {
      const newField: FormFieldInput = {
        ...field,
        id: `field-${Date.now()}`,
        label: `${field.label} (نسخة)`,
        order: fields.length,
      };
      setFields(prev => [...prev, newField]);
    }
  };

  // Reorder fields
  const handleReorderFields = (newOrder: FormFieldInput[]) => {
    setFields(newOrder.map((f, index) => ({ ...f, order: index })));
  };

  // Move field up/down
  const handleMoveField = (id: string, direction: 'up' | 'down') => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy.map((f, i) => ({ ...f, order: i }));
    });
  };

  // Handle add option to field
  const handleAddOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const currentOptions = field.options || [];
      handleUpdateField(fieldId, { options: [...currentOptions, `خيار ${currentOptions.length + 1}`] });
    }
  };

  // Handle update option
  const handleUpdateOption = (fieldId: string, index: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = [...(field.options || [])];
      newOptions[index] = value;
      handleUpdateField(fieldId, { options: newOptions });
    }
  };

  // Handle remove option
  const handleRemoveOption = (fieldId: string, index: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = (field.options || []).filter((_, i) => i !== index);
      handleUpdateField(fieldId, { options: newOptions });
    }
  };

  // Filtered field types for search
  const filteredFieldTypes = useMemo(() => {
    if (!fieldSearchQuery.trim()) return ALL_FIELD_TYPES;
    const q = fieldSearchQuery.toLowerCase();
    return ALL_FIELD_TYPES.filter(f => 
      f.label.includes(q) || f.description.includes(q) || FIELD_TYPE_LABELS[f.type]?.toLowerCase().includes(q)
    );
  }, [fieldSearchQuery]);

  // أنواع الحقول للفئة المختارة (عند عدم وجود بحث)


  // Get total fields count
  const getTotalFieldsCount = () => {
    if (isMultiStep) {
      return formSteps.reduce((acc, step) => acc + step.fields.length, 0);
    }
    return fields.length;
  };

  // Validate step
  const validateStep = () => {
    // Step 1: Template selection - no validation needed
    if (currentStep === 1) {
      return true;
    }
    if (currentStep === 2) {
      if (!title.trim()) {
        toast.error('الرجاء إدخال عنوان النموذج');
        return false;
      }
      if (!slug || !isValidFormSlug(slug)) {
        toast.error('الرجاء إدخال رابط صالح');
        return false;
      }
    }
    if (currentStep === 3) {
      if (isMultiStep) {
        if (formSteps.length === 0) {
          toast.error('الرجاء إضافة خطوة واحدة على الأقل');
          return false;
        }
        const totalFields = getTotalFieldsCount();
        if (totalFields === 0) {
          toast.error('الرجاء إضافة حقل واحد على الأقل');
          return false;
        }
      } else {
        if (fields.length === 0) {
          toast.error('الرجاء إضافة حقل واحد على الأقل');
          return false;
        }
      }
    }
    return true;
  };

  // Navigation
  const handleContinue = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep !== TOTAL_STEPS) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert banner files to base64
      let coverImageData: string | undefined;
      let bannerImagesData: string[] = [];
      
      for (const banner of banners) {
        if (typeof banner === 'string') {
          bannerImagesData.push(banner);
        } else {
          const base64 = await fileToBase64(banner);
          bannerImagesData.push(base64);
        }
      }
      
      // Use first banner as cover image for backwards compatibility
      if (bannerImagesData.length > 0) {
        coverImageData = bannerImagesData[0];
      }

      const formData: any = {
        title,
        slug,
        description: description || undefined,
        type: formType,
        status,
        isMultiStep,
        allowMultipleSubmissions,
        requiresAuthentication,
        showProgressBar,
        showQuestionNumbers,
        notifyOnSubmission,
        notificationEmail: notifyOnSubmission ? notificationEmail : undefined,
        theme: formTheme,
        coverImage: coverImageData,
        bannerImages: bannerImagesData.length > 0 ? bannerImagesData : undefined,
        bannerDisplayMode: bannerImagesData.length > 0 ? bannerDisplayMode : undefined,
      };

      // Add fields or steps based on form type
      if (isMultiStep) {
        formData.steps = formSteps.map(step => ({
          title: step.title,
          description: step.description,
          order: step.order,
          fields: step.fields.map(f => ({
            label: f.label,
            description: f.description,
            type: f.type,
            order: f.order,
            required: f.required,
            placeholder: f.placeholder,
            options: f.options,
            minValue: f.minValue,
            maxValue: f.maxValue,
            matrixRows: f.matrixRows,
            matrixColumns: f.matrixColumns,
            signaturePenColor: f.signaturePenColor,
            signaturePenWidth: f.signaturePenWidth,
            toggleLabelOn: f.toggleLabelOn,
            toggleLabelOff: f.toggleLabelOff,
            allowedFileTypes: f.allowedFileTypes,
            maxFileSize: f.maxFileSize,
            maxFiles: f.maxFiles,
          })),
        }));
      } else {
        formData.fields = fields.map(f => ({
          label: f.label,
          description: f.description,
          type: f.type,
          order: f.order,
          required: f.required,
          placeholder: f.placeholder,
          options: f.options,
          minValue: f.minValue,
          maxValue: f.maxValue,
          matrixRows: f.matrixRows,
          matrixColumns: f.matrixColumns,
          signaturePenColor: f.signaturePenColor,
          signaturePenWidth: f.signaturePenWidth,
          toggleLabelOn: f.toggleLabelOn,
          toggleLabelOff: f.toggleLabelOff,
          allowedFileTypes: f.allowedFileTypes,
          maxFileSize: f.maxFileSize,
          maxFiles: f.maxFiles,
        }));
      }
      
      // Add integration preferences
      formData.enableGoogleSheets = enableGoogleSheets;
      formData.storageProvider = storageOption || 's3';

      const result = await createForm(formData);
      
      if (result) {
        toast.success('تم إنشاء النموذج بنجاح! 🎉');
        
        // Handle Google Sheets OAuth if enabled
        if (enableGoogleSheets && result.id) {
          toast.info('جاري ربط Google Sheets...', { duration: 3000 });
          try {
            const gsResult = await connectGoogleSheets(result.id);
            if (gsResult?.authUrl) {
              window.location.href = gsResult.authUrl;
              return;
            }
          } catch {
            toast.error('فشل في ربط Google Sheets. يمكنك ربطه لاحقاً من صفحة الردود.');
          }
        }
        
        router.push('/app/forms');
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في إنشاء النموذج');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editingField = editingFieldId ? fields.find(f => f.id === editingFieldId) : null;

  // ============================================
  // Render Steps
  // ============================================

  // Step 1: Template Selection
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 15, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -15, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className="flex flex-col items-center text-sm text-foreground"
    >
      <div className="w-full max-w-md sm:max-w-xl px-1">
        <div className="text-center mb-4">
          <p className="text-xs bg-primary/10 text-primary font-medium px-3 py-1 rounded-full mb-3 inline-block">
            الخطوة 1 من 6
          </p>
        </div>
        <FormTemplateSelector
          selectedTemplateId={selectedTemplateId}
          selectedLanguage={templateLanguage}
          onSelectTemplate={handleSelectTemplate}
          onLanguageChange={handleTemplateLanguageChange}
          onStartFromScratch={handleStartFromScratch}
        />
      </div>
    </motion.div>
  );

  // Step 2: Basic Info
  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 15, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -15, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className="flex flex-col items-center w-full"
    >
      {/* Clean Header */}
      <p className="text-xs bg-primary/10 text-primary font-medium px-3 py-1 rounded-full mb-3">
        الخطوة 2 من 6
      </p>
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">معلومات النموذج</h2>
      <p className="text-muted-foreground text-xs sm:text-sm mb-5">أدخل المعلومات الأساسية</p>

      {/* Form Fields */}
      <div className="w-full max-w-md space-y-4 px-1">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="text-sm font-medium text-foreground mb-2 block">
            العنوان <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="اسم النموذج"
            className="w-full h-11 px-4 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground text-sm"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="text-sm font-medium text-foreground mb-2 block">
            الوصف <span className="text-muted-foreground text-xs">(اختياري)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر..."
            rows={2}
            className="w-full p-3 bg-muted/50 border border-border rounded-2xl resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>

        {/* Type & Status */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {/* Form Type */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-foreground mb-2 block">النوع</label>
            <Select value={formType} onValueChange={(v) => setFormType(v as FormType)}>
              <SelectTrigger className="h-11 w-full rounded-2xl border-border bg-muted/50 focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {Object.entries(FORM_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="rounded-xl">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Status */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-foreground mb-2 block">الحالة</label>
            <Select value={status} onValueChange={(v) => setStatus(v as FormStatus)}>
              <SelectTrigger className="h-11 w-full rounded-2xl border-border bg-muted/50 focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {Object.entries(FORM_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="rounded-xl">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Multi-step Toggle - Compact */}
        <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-2xl transition-all duration-200 hover:bg-muted/40">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">متعدد الخطوات</span>
          </div>
          <div dir="ltr">
            <Switch
              checked={isMultiStep}
              onCheckedChange={setIsMultiStep}
            />
          </div>
        </div>

        {/* Cover Images - Button to open Dialog */}
        <button
          type="button"
          onClick={() => setShowBannerDialog(true)}
          className="w-full flex items-center justify-between py-3 px-4 bg-muted/30 hover:bg-muted/40 rounded-2xl transition-all duration-200 group"
          aria-label="إضافة صور الغلاف"
        >
          <div className="flex items-center gap-2">
            <ImageLucide className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">صور الغلاف</span>
            {banners.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {banners.length} {banners.length === 1 ? 'صورة' : 'صور'}
              </span>
            )}
          </div>
          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        {/* Banner Thumbnails Preview */}
        {banners.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {banners.map((banner, idx) => {
              const url = typeof banner === 'string' ? banner : URL.createObjectURL(banner);
              return (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border/50 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowBannerDialog(true)}
                >
                  <img src={url} alt={`غلاف ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
        )}

        {/* Banner Upload Dialog */}
        <Dialog open={showBannerDialog} onOpenChange={setShowBannerDialog}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-center">صور الغلاف</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <FormBannersUpload
                banners={banners}
                onChange={setBanners}
                displayMode={bannerDisplayMode}
                onDisplayModeChange={setBannerDisplayMode}
                maxFiles={5}
                maxSizeMB={5}
              />
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => setShowBannerDialog(false)}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                تم
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );

  // Step 3: Fields
  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center w-full"
    >
      {/* Header */}
      <p className="text-xs bg-primary/10 text-primary font-medium px-3 py-1 rounded-full mb-3">
        الخطوة 3 من 6
      </p>
      <h2 className="text-xl font-bold text-foreground mb-1">حقول النموذج</h2>
      <p className="text-muted-foreground text-sm mb-6">أضف الحقول التي تريد جمع بياناتها</p>

      <div className="w-full max-w-md space-y-4">
        {!isMultiStep && fields.length > 0 && (
          <p className="text-[11px] text-muted-foreground text-center">اسحب من أيقونة ⋮⋮ أو استخدم الأسهم لإعادة الترتيب</p>
        )}
        {/* Multi-step Editor */}
        {isMultiStep ? (
          <StepEditor
            steps={formSteps}
            onStepsChange={setFormSteps}
          />
        ) : (
          <>
            {/* Fields List — سحب من أيقونة القبضة لإعادة الترتيب */}
            {fields.length > 0 ? (
              <Reorder.Group
                axis="y"
                values={fields}
                onReorder={handleReorderFields}
                className="space-y-2.5"
                style={{ listStyle: 'none' }}
              >
                {fields.map((field, index) => (
                  <DraggableFieldRow
                    key={field.id}
                    field={field}
                    index={index}
                    total={fields.length}
                    onMoveUp={() => handleMoveField(field.id, 'up')}
                    onMoveDown={() => handleMoveField(field.id, 'down')}
                    onEdit={() => setEditingFieldId(field.id)}
                    onDelete={() => handleDeleteField(field.id)}
                  />
                ))}
              </Reorder.Group>
            ) : (
              <motion.div
                className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-muted/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-7 h-7 text-primary/30" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">ابدأ بإضافة الحقول</p>
                <p className="text-xs text-muted-foreground">اضغط الزر أدناه لإضافة حقل جديد</p>
              </motion.div>
            )}

            {/* Add Field Button */}
            <button
              type="button"
              onClick={() => { setShowFieldSelector(true); setFieldSearchQuery(''); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground hover:bg-foreground/90 text-background rounded-2xl transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حقل</span>
            </button>

            {/* =============================== */}
            {/* Add Field Dialog */}
            {/* =============================== */}
            <Dialog open={showFieldSelector} onOpenChange={setShowFieldSelector}>
              <DialogContent
                showCloseButton={false}
                className="w-[95vw] sm:w-[520px] sm:max-w-[90vw] rounded-[2rem] p-0 gap-0 max-h-[85vh] flex flex-col overflow-hidden border border-border/80 shadow-xl"
              >
                {/* Header: عنوان فقط بدون علامة خروج */}
                <div className="flex items-center justify-center px-4 py-4 border-b border-border/60 shrink-0">
                  <DialogTitle className="text-base font-semibold text-foreground">إضافة حقل</DialogTitle>
                </div>

                {/* Search */}
                <div className="px-4 py-3 shrink-0">
                  <div className="flex items-center gap-3 h-11 px-4 bg-muted/30 rounded-2xl border border-border/60 focus-within:border-primary/40 focus-within:bg-muted/40 transition-colors">
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      value={fieldSearchQuery}
                      onChange={(e) => setFieldSearchQuery(e.target.value)}
                      placeholder="بحث..."
                      className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground min-w-0"
                    />
                  </div>
                </div>

                {/* Content - قائمة بسيطة مثل التصميم الإنجليزي */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {fieldSearchQuery.trim() ? (
                    /* نتائج البحث */
                    <div className="px-4 pb-4">
                      <p className="text-xs font-medium text-muted-foreground px-1 py-2.5">نتائج البحث ({filteredFieldTypes.length})</p>
                      {filteredFieldTypes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-10">لا توجد نتائج</p>
                      ) : (
                        <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/60">
                          {filteredFieldTypes.map(({ type, icon: Icon, label, description }) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleAddField(type)}
                              className="w-full flex items-center gap-4 py-3.5 px-4 hover:bg-muted/30 active:bg-muted/40 transition-colors text-right rounded-none first:rounded-t-2xl last:rounded-b-2xl"
                            >
                              <span className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 text-foreground">
                                <Icon className="w-5 h-5" />
                              </span>
                              <div className="flex-1 min-w-0 text-right">
                                <p className="font-medium text-sm text-foreground">{label}</p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{description}</p>
                              </div>
                              <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                <Plus className="w-4 h-4" />
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* مقترحات - تناسق مثل الصورة */}
                      <div className="px-4 pb-3">
                        <p className="text-xs font-medium text-muted-foreground px-1 py-2.5">مقترحات</p>
                        <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/60">
                          {SUGGESTED_FIELDS.map(({ type, icon: Icon, label }) => (
                            <button
                              key={`suggested-${type}`}
                              type="button"
                              onClick={() => handleAddField(type)}
                              className="w-full flex items-center gap-4 py-3.5 px-4 hover:bg-muted/30 active:bg-muted/40 transition-colors text-right rounded-none first:rounded-t-2xl last:rounded-b-2xl"
                            >
                              <span className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 text-foreground">
                                <Icon className="w-5 h-5" />
                              </span>
                              <span className="flex-1 text-right font-medium text-sm text-foreground">{label}</span>
                              <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                <Plus className="w-4 h-4" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* اختر بنفسك - نفس التناسق */}
                      <div className="px-4 pb-4">
                        <p className="text-xs font-medium text-muted-foreground px-1 py-2.5">اختر بنفسك</p>
                        <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/60">
                          {ALL_FIELD_TYPES.map(({ type, icon: Icon, label, description }) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleAddField(type)}
                              className="w-full flex items-center gap-4 py-3.5 px-4 hover:bg-muted/30 active:bg-muted/40 transition-colors text-right rounded-none first:rounded-t-2xl last:rounded-b-2xl"
                            >
                              <span className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 text-foreground">
                                <Icon className="w-5 h-5" />
                              </span>
                              <div className="flex-1 min-w-0 text-right">
                                <p className="font-medium text-sm text-foreground">{label}</p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{description}</p>
                              </div>
                              <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                <Plus className="w-4 h-4" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* =============================== */}
            {/* Edit Field Dialog - نفس أسلوب إضافة حقل */}
            {/* =============================== */}
            <Dialog open={editingFieldId !== null} onOpenChange={(open) => { if (!open) setEditingFieldId(null); }}>
              <DialogContent
                showCloseButton={false}
                className="w-[95vw] sm:w-[520px] sm:max-w-[90vw] rounded-[2rem] p-0 gap-0 max-h-[85vh] overflow-hidden flex flex-col border border-border/80 shadow-xl"
              >
                {/* Header: عنوان فقط */}
                <div className="flex items-center justify-center px-4 py-4 border-b border-border/60 shrink-0">
                  <DialogTitle className="text-base font-semibold text-foreground">تعديل الحقل</DialogTitle>
                </div>

                {editingField && (() => {
                  const EditIcon = getFieldTypeIcon(editingField.type);
                  const hasOptions = [FieldType.SELECT, FieldType.RADIO, FieldType.CHECKBOX, FieldType.RANKING].includes(editingField.type);
                  const hasScale = editingField.type === FieldType.RATING || editingField.type === FieldType.SCALE;
                  const isToggle = editingField.type === FieldType.TOGGLE;
                  const isSignature = editingField.type === FieldType.SIGNATURE;
                  const isMatrix = editingField.type === FieldType.MATRIX;
                  const isFileType = editingField.type === FieldType.FILE;
                  const isEmail = editingField.type === FieldType.EMAIL;

                  const inputBase = "w-full h-11 px-4 bg-muted/30 border border-border/60 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-background transition-all text-sm text-foreground placeholder:text-muted-foreground";
                  const labelClass = "text-xs font-medium text-foreground mb-2 block";

                  return (
                    <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
                      {/* نوع الحقل (للقراءة فقط) */}
                      <div>
                        <label className={labelClass}>نوع الحقل</label>
                        <div className="flex items-center gap-3 h-12 px-4 bg-muted/30 border border-border/60 rounded-2xl">
                          <EditIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{FIELD_TYPE_LABELS[editingField.type]}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">لا يمكن تغيير نوع الحقل بعد الإنشاء</p>
                      </div>

                      {/* العنوان */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={labelClass}>العنوان</label>
                          <span className="text-[11px] text-muted-foreground tabular-nums">{editingField.label.length}/200</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={editingField.label}
                            onChange={(e) => handleUpdateField(editingField.id, { label: e.target.value })}
                            placeholder="عنوان الحقل"
                            maxLength={200}
                            className={`${inputBase} pr-4 pl-20`}
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-medium">
                              {FIELD_TYPE_LABELS[editingField.type].split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* الوصف */}
                      <div>
                        <label className={labelClass}>
                          الوصف <span className="text-muted-foreground font-normal">(اختياري)</span>
                        </label>
                        <textarea
                          value={editingField.description || ''}
                          onChange={(e) => handleUpdateField(editingField.id, { description: e.target.value })}
                          placeholder="وصف توضيحي للحقل..."
                          rows={2}
                          className="w-full p-3 bg-muted/30 border border-border/60 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-background transition-all text-sm text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      {/* نص توضيحي (لحقول النص والرابط والتاريخ والوقت) */}
                      {(editingField.type === FieldType.TEXT ||
                        editingField.type === FieldType.TEXTAREA ||
                        editingField.type === FieldType.EMAIL ||
                        editingField.type === FieldType.PHONE ||
                        editingField.type === FieldType.NUMBER ||
                        editingField.type === FieldType.URL ||
                        editingField.type === FieldType.DATE ||
                        editingField.type === FieldType.TIME ||
                        editingField.type === FieldType.DATETIME) && (
                        <div>
                          <label className={labelClass}>نص توضيحي (Placeholder)</label>
                          <input
                            type="text"
                            value={editingField.placeholder || ''}
                            onChange={(e) => handleUpdateField(editingField.id, { placeholder: e.target.value })}
                            placeholder={
                              editingField.type === FieldType.DATE ? 'مثال: اختر التاريخ' :
                              editingField.type === FieldType.TIME ? 'مثال: اختر الوقت' :
                              editingField.type === FieldType.DATETIME ? 'مثال: اختر التاريخ والوقت' :
                              'مثال: أدخل اسمك الكامل...'
                            }
                            className={inputBase}
                          />
                          {(editingField.type === FieldType.DATE || editingField.type === FieldType.TIME || editingField.type === FieldType.DATETIME) && (
                            <p className="text-[11px] text-muted-foreground mt-1.5">سيظهر للمستخدم منتقي تاريخ/وقت حسب نوع الحقل</p>
                          )}
                        </div>
                      )}

                      {/* الخيارات (قائمة/اختيار واحد/متعدد) */}
                      {hasOptions && (
                        <div>
                          <label className={labelClass}>الخيارات</label>
                          <div className="space-y-2">
                            {(editingField.options || []).map((option, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleUpdateOption(editingField.id, idx, e.target.value)}
                                  placeholder={`خيار ${idx + 1}`}
                                  className="flex-1 h-10 px-3 bg-muted/30 border border-border/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background text-foreground transition-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(editingField.id, idx)}
                                  disabled={(editingField.options?.length || 0) <= 2}
                                  className="p-2 rounded-xl hover:bg-destructive/10 transition-colors disabled:opacity-30"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive/70" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddOption(editingField.id)}
                              className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors pt-1"
                            >
                              <Plus className="w-4 h-4" />
                              إضافة خيار
                            </button>
                          </div>
                        </div>
                      )}

                      {/* تبديل نعم/لا: نصوص العرض */}
                      {isToggle && (
                        <div className="space-y-3 p-4 bg-muted/20 border border-border/60 rounded-2xl">
                          <p className="text-xs font-medium text-foreground">كيف يظهر التبديل للمستخدم</p>
                          <div>
                            <label className={labelClass}>نص عند التشغيل (نعم)</label>
                            <input
                              type="text"
                              value={editingField.toggleLabelOn ?? 'نعم'}
                              onChange={(e) => handleUpdateField(editingField.id, { toggleLabelOn: e.target.value })}
                              placeholder="نعم"
                              className={inputBase}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>نص عند الإيقاف (لا)</label>
                            <input
                              type="text"
                              value={editingField.toggleLabelOff ?? 'لا'}
                              onChange={(e) => handleUpdateField(editingField.id, { toggleLabelOff: e.target.value })}
                              placeholder="لا"
                              className={inputBase}
                            />
                          </div>
                        </div>
                      )}

                      {/* القيمة الدنيا/العليا (تقييم أو مقياس) */}
                      {hasScale && (
                        <div className="space-y-3 p-4 bg-muted/20 border border-border/60 rounded-2xl">
                          <p className="text-xs font-medium text-foreground">نطاق القيم</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelClass}>القيمة الدنيا</label>
                              <input
                                type="number"
                                min={editingField.type === FieldType.SCALE ? undefined : 1}
                                value={editingField.minValue ?? (editingField.type === FieldType.SCALE ? 0 : 1)}
                                onChange={(e) => handleUpdateField(editingField.id, { minValue: parseInt(e.target.value) ?? (editingField.type === FieldType.SCALE ? 0 : 1) })}
                                className={inputBase}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>القيمة العليا</label>
                              <input
                                type="number"
                                min={(editingField.minValue ?? (editingField.type === FieldType.SCALE ? 0 : 1)) + 1}
                                value={editingField.maxValue ?? 5}
                                onChange={(e) => handleUpdateField(editingField.id, { maxValue: Math.max((editingField.minValue ?? 0) + 1, parseInt(e.target.value) || 5) })}
                                className={inputBase}
                              />
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {editingField.type === FieldType.RATING
                              ? `سيظهر للمستخدم: من ${editingField.minValue ?? 1} إلى ${editingField.maxValue ?? 5} نجوم`
                              : `سيظهر مقياس من ${editingField.minValue ?? 0} إلى ${editingField.maxValue ?? 5}`}
                          </p>
                        </div>
                      )}

                      {/* جدول: صفوف وأعمدة + معاينة الشكل */}
                      {isMatrix && (
                        <div className="space-y-4">
                          <div>
                            <label className={labelClass}>صفوف الجدول (الأسئلة أو البنود)</label>
                            <div className="space-y-2">
                              {(editingField.matrixRows || []).map((row, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={row}
                                    onChange={(e) => handleUpdateField(editingField.id, { matrixRows: (editingField.matrixRows || []).map((r, i) => i === idx ? e.target.value : r) })}
                                    placeholder={`صف ${idx + 1}`}
                                    className="flex-1 h-10 px-3 bg-muted/30 border border-border/60 rounded-xl text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateField(editingField.id, { matrixRows: (editingField.matrixRows || []).filter((_, i) => i !== idx) })}
                                    disabled={(editingField.matrixRows?.length || 0) <= 1}
                                    className="p-2 rounded-xl hover:bg-destructive/10 disabled:opacity-30"
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive/70" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleUpdateField(editingField.id, { matrixRows: [...(editingField.matrixRows || []), `صف ${(editingField.matrixRows?.length || 0) + 1}`] })}
                                className="flex items-center gap-2 text-xs font-medium text-primary"
                              >
                                <Plus className="w-4 h-4" /> إضافة صف
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className={labelClass}>أعمدة الجدول (خيارات التقييم)</label>
                            <div className="space-y-2">
                              {(editingField.matrixColumns || []).map((col, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={col}
                                    onChange={(e) => handleUpdateField(editingField.id, { matrixColumns: (editingField.matrixColumns || []).map((c, i) => i === idx ? e.target.value : c) })}
                                    placeholder={`عمود ${idx + 1}`}
                                    className="flex-1 h-10 px-3 bg-muted/30 border border-border/60 rounded-xl text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateField(editingField.id, { matrixColumns: (editingField.matrixColumns || []).filter((_, i) => i !== idx) })}
                                    disabled={(editingField.matrixColumns?.length || 0) <= 1}
                                    className="p-2 rounded-xl hover:bg-destructive/10 disabled:opacity-30"
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive/70" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleUpdateField(editingField.id, { matrixColumns: [...(editingField.matrixColumns || []), `عمود ${(editingField.matrixColumns?.length || 0) + 1}`] })}
                                className="flex items-center gap-2 text-xs font-medium text-primary"
                              >
                                <Plus className="w-4 h-4" /> إضافة عمود
                              </button>
                            </div>
                          </div>
                          {/* معاينة شكل الجدول */}
                          {((editingField.matrixRows?.length ?? 0) > 0 || (editingField.matrixColumns?.length ?? 0) > 0) && (
                            <div className="rounded-2xl border border-border/60 overflow-hidden bg-muted/10">
                              <p className="text-[11px] font-medium text-muted-foreground px-3 py-2 border-b border-border/60">شكل الجدول كما سيظهر للمستخدم</p>
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[200px] text-xs border-collapse">
                                  <thead>
                                    <tr>
                                      <th className="text-right font-medium text-foreground bg-muted/30 p-2 border-b border-l border-border/60 w-24" />
                                      {(editingField.matrixColumns || []).map((col, i) => (
                                        <th key={i} className="text-center font-medium text-foreground bg-muted/30 p-2 border-b border-l border-border/60 whitespace-nowrap max-w-[80px] truncate" title={col}>
                                          {col || `عمود ${i + 1}`}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(editingField.matrixRows || []).map((row, ri) => (
                                      <tr key={ri}>
                                        <td className="text-right font-medium text-foreground bg-muted/20 p-2 border-b border-l border-border/60 max-w-[100px] truncate" title={row}>
                                          {row || `صف ${ri + 1}`}
                                        </td>
                                        {(editingField.matrixColumns || []).map((_, ci) => (
                                          <td key={ci} className="text-center p-1.5 border-b border-l border-border/60">
                                            <span className="inline-flex w-5 h-5 rounded border border-border/60 bg-background" aria-hidden />
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <p className="text-[10px] text-muted-foreground px-3 py-1.5 border-t border-border/60">المستخدم يختار خياراً واحداً لكل صف</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* توقيع: لون وسُمك القلم */}
                      {isSignature && (
                        <div className="space-y-3 p-4 bg-muted/20 border border-border/60 rounded-2xl">
                          <p className="text-xs font-medium text-foreground">تخصيص التوقيع</p>
                          <p className="text-[11px] text-muted-foreground">سيظهر للمستخدم منطقة توقيع يدوي (canvas) بلون وسُمك القلم المحددين أدناه.</p>
                          <div>
                            <label className={labelClass}>لون القلم</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {SIGNATURE_PEN_COLORS.map(({ value, label }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => handleUpdateField(editingField.id, { signaturePenColor: value })}
                                  className={cn(
                                    'w-9 h-9 rounded-xl border-2 transition-all',
                                    (editingField.signaturePenColor || '#0f172a') === value ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'
                                  )}
                                  style={{ backgroundColor: value }}
                                  title={label}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className={labelClass}>سُمك القلم (1–6 px)</label>
                            <input
                              type="number"
                              min={1}
                              max={6}
                              value={Math.min(6, Math.max(1, editingField.signaturePenWidth ?? 2))}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                if (!Number.isNaN(v)) handleUpdateField(editingField.id, { signaturePenWidth: Math.min(6, Math.max(1, v)) });
                              }}
                              className={inputBase}
                            />
                          </div>
                        </div>
                      )}

                      {/* ملف: أنواع وحجم وعدد */}
                      {isFileType && (
                        <div className="space-y-4 p-4 bg-muted/20 border border-border/60 rounded-2xl">
                          <p className="text-xs font-medium text-foreground">إعدادات رفع الملفات</p>
                          <p className="text-[11px] text-muted-foreground">إذا لم تختر نوعاً محدداً، يُقبل جميع أنواع الملفات. حدد الأنواع أو اترك الافتراضي ليعمل الرفع.</p>
                          <div>
                            <label className={labelClass}>أنواع الملفات المقبولة</label>
                            <div className="flex flex-wrap gap-2">
                              {FILE_TYPE_PRESETS.map((preset) => {
                                const current = editingField.allowedFileTypes?.length ? editingField.allowedFileTypes : ['*/*'];
                                const isSelected = preset.types.every(t => current.includes(t));
                                return (
                                  <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => {
                                      const raw = editingField.allowedFileTypes || [];
                                      if (isSelected) {
                                        const next = raw.filter(t => !preset.types.includes(t));
                                        handleUpdateField(editingField.id, { allowedFileTypes: next.length ? next : ['*/*'] });
                                      } else {
                                        const base = raw.length ? raw : ['*/*'];
                                        handleUpdateField(editingField.id, { allowedFileTypes: [...new Set([...base, ...preset.types])] });
                                      }
                                    }}
                                    className={cn(
                                      'px-3 py-2 rounded-xl text-xs font-medium border transition-colors',
                                      isSelected ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted/30 border-border/60 hover:bg-muted/50'
                                    )}
                                  >
                                    {preset.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelClass}>الحجم الأقصى (MB)</label>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={Math.round((editingField.maxFileSize || 10 * 1024 * 1024) / (1024 * 1024))}
                                onChange={(e) => handleUpdateField(editingField.id, { maxFileSize: (parseInt(e.target.value) || 10) * 1024 * 1024 })}
                                className={inputBase}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>العدد الأقصى للملفات</label>
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={editingField.maxFiles ?? 1}
                                onChange={(e) => handleUpdateField(editingField.id, { maxFiles: parseInt(e.target.value) || 1 })}
                                className={inputBase}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* حقل إلزامي */}
                      <div className="flex items-center justify-between py-4 px-4 bg-muted/20 border border-border/60 rounded-2xl">
                        <span className="text-sm font-medium text-foreground">حقل إلزامي</span>
                        <div dir="ltr">
                          <Switch
                            checked={editingField.required}
                            onCheckedChange={(checked) => handleUpdateField(editingField.id, { required: checked })}
                          />
                        </div>
                      </div>

                      {/* زر التحديث */}
                      <button
                        type="button"
                        onClick={() => setEditingFieldId(null)}
                        className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        تحديث
                      </button>
                    </div>
                  );
                })()}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </motion.div>
  );

  // Step 4: Settings
  const renderStep4 = () => (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-sm text-foreground"
    >
      {/* Step Header */}
      <p className="text-xs bg-primary/10 text-primary font-medium px-3 py-1 rounded-full">
        الخطوة 4 من 6
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">إعدادات النموذج</h2>
      <p className="text-muted-foreground pb-6 text-center text-sm">
        خصص سلوك النموذج
      </p>

      {/* Settings List */}
      <div className="w-full max-w-md px-4 space-y-2.5">
        {/* Multiple Submissions */}
        <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl transition-colors hover:bg-muted/50">
          <div className="flex-1 min-w-0 ml-3">
            <p className="font-medium text-sm text-foreground">السماح بالإرسال المتعدد</p>
            <p className="text-xs text-muted-foreground mt-0.5">السماح للمستخدم بإرسال أكثر من رد</p>
          </div>
          <div dir="ltr" className="flex-shrink-0">
            <Switch checked={allowMultipleSubmissions} onCheckedChange={setAllowMultipleSubmissions} />
          </div>
        </div>

        {/* Requires Authentication */}
        <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl transition-colors hover:bg-muted/50">
          <div className="flex-1 min-w-0 ml-3">
            <p className="font-medium text-sm text-foreground">يتطلب تسجيل الدخول</p>
            <p className="text-xs text-muted-foreground mt-0.5">يجب على المستخدم تسجيل الدخول للإرسال</p>
          </div>
          <div dir="ltr" className="flex-shrink-0">
            <Switch checked={requiresAuthentication} onCheckedChange={setRequiresAuthentication} />
          </div>
        </div>

        {/* Show Progress Bar */}
        <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl transition-colors hover:bg-muted/50">
          <div className="flex-1 min-w-0 ml-3">
            <p className="font-medium text-sm text-foreground">إظهار شريط التقدم</p>
            <p className="text-xs text-muted-foreground mt-0.5">عرض نسبة الإكمال للمستخدم</p>
          </div>
          <div dir="ltr" className="flex-shrink-0">
            <Switch checked={showProgressBar} onCheckedChange={setShowProgressBar} />
          </div>
        </div>

        {/* Show Question Numbers */}
        <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl transition-colors hover:bg-muted/50">
          <div className="flex-1 min-w-0 ml-3">
            <p className="font-medium text-sm text-foreground">ترقيم الأسئلة</p>
            <p className="text-xs text-muted-foreground mt-0.5">عرض أرقام الأسئلة</p>
          </div>
          <div dir="ltr" className="flex-shrink-0">
            <Switch checked={showQuestionNumbers} onCheckedChange={setShowQuestionNumbers} />
          </div>
        </div>

        {/* Notify on Submission */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl transition-colors hover:bg-muted/50">
            <div className="flex-1 min-w-0 ml-3">
              <p className="font-medium text-sm text-foreground">إشعار عند الإرسال</p>
              <p className="text-xs text-muted-foreground mt-0.5">استلام بريد عند كل رد جديد</p>
            </div>
            <div dir="ltr" className="flex-shrink-0">
              <Switch checked={notifyOnSubmission} onCheckedChange={setNotifyOnSubmission} />
            </div>
          </div>
          
          <AnimatePresence>
            {notifyOnSubmission && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center h-11 pr-3 border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all overflow-hidden bg-muted/30">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="h-full px-3 w-full outline-none bg-transparent text-foreground placeholder:text-muted-foreground text-sm"
                    dir="ltr"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

  // Step 5: Integrations
  const renderStep5 = () => (
    <motion.div
      key="step5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center w-full"
    >
      {/* Step Header */}
      <p className="text-xs bg-primary/10 text-primary font-medium px-3 py-1 rounded-full mb-3">
        الخطوة 5 من 6
      </p>
      <h2 className="text-xl font-bold text-foreground mb-1">التكاملات الخارجية</h2>
      <p className="text-muted-foreground text-sm mb-1">اربط نموذجك بخدمات خارجية</p>
      <p className="text-xs text-muted-foreground/70 mb-5 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        اختياري — يمكنك تخطي هذه الخطوة
      </p>

      <div className="w-full max-w-md space-y-4 px-1">
        {/* Google Sheets Integration */}
        <div className={cn(
          "relative rounded-2xl border-2 transition-all duration-200 overflow-hidden",
          enableGoogleSheets 
            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" 
            : "border-border bg-card"
        )}>
          <button
            type="button"
            onClick={() => setEnableGoogleSheets(!enableGoogleSheets)}
            className="w-full p-4 text-right"
            aria-label="تفعيل تكامل Google Sheets"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                enableGoogleSheets 
                  ? "bg-emerald-100 dark:bg-emerald-900/30" 
                  : "bg-muted"
              )}>
                <Sheet className={cn(
                  "w-6 h-6",
                  enableGoogleSheets ? "text-emerald-600" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">Google Sheets</h3>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    enableGoogleSheets 
                      ? "bg-emerald-500 border-emerald-500" 
                      : "border-muted-foreground/30"
                  )}>
                    {enableGoogleSheets && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  إرسال الردود تلقائياً إلى جدول بيانات Google
                </p>
              </div>
            </div>
          </button>
          
          {/* Features List */}
          <AnimatePresence>
            {enableGoogleSheets && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Zap, text: 'مزامنة فورية' },
                      { icon: Clock, text: 'تحديث لحظي' },
                      { icon: Share2, text: 'سهولة المشاركة' },
                      { icon: Shield, text: 'نسخ احتياطي آمن' },
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <feature.icon className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-3 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    سيتم ربط الحساب بعد إنشاء النموذج
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* File Storage Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground">تخزين الملفات المرفوعة</h3>
          </div>
          <p className="text-xs text-muted-foreground -mt-1">
            اختر مكان حفظ الملفات والتوقيعات المرفوعة في النموذج
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* S3 Option */}
            <button
              type="button"
              onClick={() => setStorageOption(storageOption === 's3' ? null : 's3')}
              className={cn(
                "relative p-4 rounded-2xl border-2 text-right transition-all duration-200",
                storageOption === 's3'
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                  : "border-border bg-card hover:border-muted-foreground/30"
              )}
              aria-label="اختيار Amazon S3 للتخزين"
            >
              {storageOption === 's3' && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                storageOption === 's3' ? "bg-blue-100 dark:bg-blue-900/30" : "bg-muted"
              )}>
                <Cloud className={cn("w-5 h-5", storageOption === 's3' ? "text-blue-600" : "text-muted-foreground")} />
              </div>
              <h4 className="font-semibold text-sm text-foreground">Amazon S3</h4>
              <p className="text-[10px] text-muted-foreground mt-1">افتراضي — سريع وآمن</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  <span>سرعة تحميل عالية</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  <span>تشفير متقدم</span>
                </div>
              </div>
            </button>

            {/* Google Drive Option */}
            <button
              type="button"
              onClick={() => setStorageOption(storageOption === 'google_drive' ? null : 'google_drive')}
              className={cn(
                "relative p-4 rounded-2xl border-2 text-right transition-all duration-200",
                storageOption === 'google_drive'
                  ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
                  : "border-border bg-card hover:border-muted-foreground/30"
              )}
              aria-label="اختيار Google Drive للتخزين"
            >
              {storageOption === 'google_drive' && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                storageOption === 'google_drive' ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"
              )}>
                <HardDrive className={cn("w-5 h-5", storageOption === 'google_drive' ? "text-amber-600" : "text-muted-foreground")} />
              </div>
              <h4 className="font-semibold text-sm text-foreground">Google Drive</h4>
              <p className="text-[10px] text-muted-foreground mt-1">مجاني — سهل المشاركة</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-amber-500" />
                  <span>15GB مجاني</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-amber-500" />
                  <span>تكامل Google</span>
                </div>
              </div>
            </button>
          </div>

          {storageOption === null && (
            <p className="text-[10px] text-center text-muted-foreground/60">
              سيتم استخدام التخزين الافتراضي (S3) إذا لم تختر
            </p>
          )}
        </div>

        {/* Skip Note */}
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-2xl">
          <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            يمكنك تخطي هذه الخطوة وإعداد التكاملات لاحقاً من صفحة الردود
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Step 6: Preview
  const renderStep6 = () => (
    <motion.div
      key="step6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-sm text-foreground"
    >
      {/* Step Header */}
      <p className="text-xs bg-primary/10 text-primary font-medium px-3 py-1 rounded-full">
        الخطوة 6 من 6
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">معاينة النموذج</h2>
      <p className="text-muted-foreground pb-6 text-center text-sm">
        راجع النموذج قبل الإنشاء
      </p>

      {/* Preview Card */}
      <div className="w-full max-w-md px-4">
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {/* Cover Image / Banner Preview */}
          {banners.length > 0 && (
            <div className="relative h-32 overflow-hidden">
              {bannerDisplayMode === 'slider' && banners.length > 1 ? (
                <div className="flex h-full">
                  {banners.slice(0, 3).map((banner, idx) => {
                    const url = typeof banner === 'string' ? banner : URL.createObjectURL(banner);
                    return (
                      <div key={idx} className="flex-1 h-full">
                        <img src={url} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                  {banners.length > 3 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      +{banners.length - 3} صور
                    </div>
                  )}
                </div>
              ) : (
                <img 
                  src={typeof banners[0] === 'string' ? banners[0] : URL.createObjectURL(banners[0])} 
                  alt="Cover" 
                  className="w-full h-full object-cover" 
                />
              )}
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                {bannerDisplayMode === 'slider' ? <Layers className="w-3 h-3" /> : <ImageLucide className="w-3 h-3" />}
                {bannerDisplayMode === 'slider' ? 'سلايدر' : 'صورة واحدة'}
              </div>
            </div>
          )}

          <div className="p-5">
            {/* Form Info */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg text-foreground truncate">{title || 'بدون عنوان'}</h3>
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0",
                    status === FormStatus.PUBLISHED ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    status === FormStatus.DRAFT ? 'bg-muted text-muted-foreground' :
                    status === FormStatus.ARCHIVED ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-destructive/10 text-destructive'
                  )}>
                    {FORM_STATUS_LABELS[status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description || 'بدون وصف'}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {FORM_TYPE_LABELS[formType]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getTotalFieldsCount()} حقول
                  </span>
                  {isMultiStep && (
                    <span className="text-xs text-muted-foreground">
                      {formSteps.length} خطوات
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Summary */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground mb-3">الإعدادات</h4>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", allowMultipleSubmissions ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                  <span className="text-muted-foreground">إرسال متعدد</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", requiresAuthentication ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                  <span className="text-muted-foreground">يتطلب تسجيل دخول</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", notifyOnSubmission ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                  <span className="text-muted-foreground">إشعارات البريد</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", showProgressBar ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                  <span className="text-muted-foreground">شريط التقدم</span>
                </div>
              </div>
            </div>

            {/* Integrations Summary */}
            {(enableGoogleSheets || storageOption) && (
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">التكاملات</h4>
                <div className="space-y-2 text-xs">
                  {enableGoogleSheets && (
                    <div className="flex items-center gap-2">
                      <Sheet className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-muted-foreground">Google Sheets — مزامنة تلقائية</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {storageOption === 'google_drive' ? (
                      <>
                        <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-muted-foreground">التخزين: Google Drive</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-muted-foreground">التخزين: Amazon S3</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 mt-5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-3 rounded-full transition font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري الإنشاء...</span>
            </>
          ) : (
            <>
              <span>إنشاء النموذج</span>
              <ArrowRight className="w-4 h-4 mt-0.5" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );

  // ============================================
  // Main Render
  // ============================================

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center gap-6 lg:gap-10 min-h-[520px]">
        {/* Form Content Section */}
        <div className="flex-1 order-1 max-w-xl w-full mx-auto lg:mx-0">
          {/* Preview Button */}
          <div className="flex items-center justify-end px-4 sm:px-8 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={handleGoToPreview}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/40 hover:bg-muted/60 border border-border/60 text-foreground transition-colors text-sm font-medium"
              aria-label="معاينة النموذج"
            >
              <Share2 className="w-4 h-4" />
              <span>معاينة</span>
            </button>
          </div>

          {/* Step Progress Dots - Desktop */}
          <div className="hidden lg:flex items-center justify-center mb-6">
            <div className="flex items-center gap-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    width: i + 1 === currentStep ? 24 : 6,
                    opacity: i + 1 <= currentStep ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className={cn(
                    "h-1.5 rounded-full",
                    i + 1 <= currentStep 
                      ? "bg-foreground" 
                      : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground tabular-nums mr-2">
              {currentStep}/{TOTAL_STEPS}
            </span>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
              {currentStep === 6 && renderStep6()}
            </AnimatePresence>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onBack={handleBack}
              onContinue={handleContinue}
              isLoading={isSubmitting}
              isBackVisible={currentStep > 1}
              continueLabel="التالي"
              backLabel="السابق"
              finishLabel={isSubmitting ? "جاري الإنشاء..." : "إنشاء النموذج"}
              disabled={isSubmitting}
            />
          </div>
        </div>

      </div>
    </form>
  );
}

export default CreateFormWizard;
