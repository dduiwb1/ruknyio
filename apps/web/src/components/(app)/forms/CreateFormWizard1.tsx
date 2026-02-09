'use client';

import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  FileText,
  Mail,
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Edit2,
  ArrowRight,
  Loader2,
  ImageIcon,
  Layers,
  Image as ImageLucide,
  MoreVertical,
  Save,
  CheckCircle2,
  Link as LinkIcon,
  Cloud,
  FolderOpen,
  Sheet,
  Zap,
  Clock,
  Shield,
  Share2,
  HardDrive,
  Sparkles,
  Phone,
  Settings,
  RefreshCw,
  Lock as LockIcon,
  Bell,
  Eye,
  ExternalLink,
  Star,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// LocalStorage key for form draft persistence
const FORM_DRAFT_KEY = 'rukny_form_draft';
const FORM_PREVIEW_KEY = 'rukny_form_preview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { FieldTypeSelector } from './FieldTypeSelector';
import { type FormFieldInput } from './FieldEditor';
import { FieldEditorDialog } from './FieldEditorDialog';
import { StepEditor, type FormStepInput } from './StepEditor';
import FormBannersUpload, { type BannerDisplayMode } from './FormBannersUpload';
import { FormTemplateSelector, type TemplateLanguage, getTemplateById } from './templates';
import { FormThemeCustomizer, type FormTheme, DEFAULT_THEME } from './FormThemeCustomizer';
import { FormPhonePreview } from './FormPhonePreview';
import { useGoogleSheets } from '@/lib/hooks/useGoogleSheets';
import { useAuth } from '@/providers/auth-provider';

// ============================================
// Constants
// ============================================

const TOTAL_STEPS = 7;

// Storage options for file uploads
type StorageOption = 's3' | 'google_drive' | null;

// ============================================
// Draggable Field Item Component (Memoized for performance)
// ============================================

interface DraggableFieldItemProps {
  field: FormFieldInput;
  index: number;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  getFieldIcon: (type: FieldType) => React.ReactNode;
}

const DraggableFieldItem = memo(function DraggableFieldItem({
  field,
  index,
  onEdit,
  onDuplicate,
  onDelete,
  getFieldIcon,
}: DraggableFieldItemProps) {
  const dragControls = useDragControls();
  
  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={dragControls}
      layout="position"
      layoutScroll
      transition={{
        layout: { duration: 0.2, ease: 'easeOut' },
      }}
      className="group relative bg-card rounded-2xl border border-border hover:border-border/80 transition-all duration-200"
      style={{ willChange: 'transform' }}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        zIndex: 50,
      }}
    >
      <div className="flex items-center gap-2 p-3">
        {/* Drag Handle */}
        <div 
          className="flex items-center justify-center p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground rounded-xl hover:bg-muted/40 transition-all duration-200 select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
          style={{ touchAction: 'none' }}
          aria-label="اسحب للترتيب"
        >
          <GripVertical className="w-4 h-4 pointer-events-none" />
        </div>

        {/* Order Number */}
        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>

        {/* Field Icon */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted/40 text-muted-foreground">
          {getFieldIcon(field.type as FieldType)}
        </div>

        {/* Field Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-foreground truncate">{field.label}</span>
            {field.required && (
              <span className="text-[9px] px-1 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                مطلوب
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {FIELD_TYPE_LABELS[field.type as FieldType]}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center">
          {/* Desktop actions */}
          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200"
              aria-label="حذف الحقل"
              title="حذف"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDuplicate(field.id); }}
              className="p-1.5 hover:bg-muted/40 rounded-xl transition-all duration-200"
              aria-label="نسخ الحقل"
              title="نسخ"
            >
              <Copy className="w-4 h-4 text-muted-foreground transition-colors" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(field.id); }}
              className="p-1.5 hover:bg-muted/40 rounded-xl transition-all duration-200"
              aria-label="تعديل الحقل"
              title="تعديل"
            >
              <Edit2 className="w-4 h-4 text-muted-foreground transition-colors" />
            </button>
          </div>

          {/* Mobile dropdown menu */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 hover:bg-muted/40 rounded-xl transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="خيارات الحقل"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[100px] rounded-2xl">
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onEdit(field.id); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-xl"
                >
                  <Edit2 className="w-4 h-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDuplicate(field.id); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-xl"
                >
                  <Copy className="w-4 h-4" />
                  نسخ
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer text-red-600 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
});

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
  enableGoogleSheets?: boolean;
  storageOption?: 's3' | 'google_drive' | null;
  formTheme?: FormTheme;
};

// ============================================
// Main Component
// ============================================

export function CreateFormWizard({ initialDraft, initialSlug }: { initialDraft?: FormDraftRestore | null; initialSlug?: string } = {}) {
  const router = useRouter();
  const { user } = useAuth();
  const { createForm, isLoading } = useForms();
  const { connect: connectGoogleSheets } = useGoogleSheets();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'preparing' | 'submitting' | 'redirecting'>('idle');
  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);
  const longWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Auto-save indicator
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Step 0: Template Selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateLanguage, setTemplateLanguage] = useState<TemplateLanguage>('ar');
  
  // Step 1: Basic Info
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
  
  // Step 2: Fields (single-step form)
  const [fields, setFields] = useState<FormFieldInput[]>([]);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  
  // Step 2: Steps (multi-step form)
  const [formSteps, setFormSteps] = useState<FormStepInput[]>([]);
  
  // Step 3: Settings
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(false);
  const [requiresAuthentication, setRequiresAuthentication] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(true);
  const [notifyOnSubmission, setNotifyOnSubmission] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  
  // Step 5: Integrations (optional)
  const [enableGoogleSheets, setEnableGoogleSheets] = useState(false);
  const [storageOption, setStorageOption] = useState<StorageOption>(null);
  
  // Step 5 (NEW): Theme Customization
  const [formTheme, setFormTheme] = useState<FormTheme>(DEFAULT_THEME);
  
  // Mobile phone preview modal
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Generate unique slug
  const generateSlug = useCallback(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  // Valid field types for validation
  const VALID_FIELD_TYPES = Object.values(FieldType);

  // Helper to validate field type
  const isValidFieldType = (type: any): type is FieldType => {
    return VALID_FIELD_TYPES.includes(type);
  };

  // Sanitize fields from draft (filter out invalid types)
  const sanitizeDraftFields = (draftFields: FormFieldInput[]): FormFieldInput[] => {
    return draftFields.map(field => ({
      ...field,
      type: isValidFieldType(field.type) ? field.type : FieldType.TEXT,
    }));
  };

  // Restore state only when user explicitly chose "متابعة المسودة" (initialDraft from page)
  useEffect(() => {
    if (initialDraft) {
      if (initialDraft.currentStep) setCurrentStep(initialDraft.currentStep);
      if (initialDraft.selectedTemplateId !== undefined) setSelectedTemplateId(initialDraft.selectedTemplateId);
      if (initialDraft.templateLanguage) setTemplateLanguage(initialDraft.templateLanguage);
      if (initialDraft.title) setTitle(initialDraft.title);
      if (initialDraft.slug) setSlug(initialDraft.slug);
      if (initialDraft.description !== undefined) setDescription(initialDraft.description);
      if (initialDraft.formType) setFormType(initialDraft.formType);
      if (initialDraft.status) setStatus(initialDraft.status);
      if (initialDraft.isMultiStep !== undefined) setIsMultiStep(initialDraft.isMultiStep);
      if (initialDraft.fields?.length) setFields(sanitizeDraftFields(initialDraft.fields));
      if (initialDraft.formSteps?.length) {
        setFormSteps(initialDraft.formSteps.map(step => ({
          ...step,
          fields: sanitizeDraftFields(step.fields),
        })));
      }
      if (initialDraft.allowMultipleSubmissions !== undefined) setAllowMultipleSubmissions(initialDraft.allowMultipleSubmissions);
      if (initialDraft.requiresAuthentication !== undefined) setRequiresAuthentication(initialDraft.requiresAuthentication);
      if (initialDraft.showProgressBar !== undefined) setShowProgressBar(initialDraft.showProgressBar);
      if (initialDraft.showQuestionNumbers !== undefined) setShowQuestionNumbers(initialDraft.showQuestionNumbers);
      if (initialDraft.notifyOnSubmission !== undefined) setNotifyOnSubmission(initialDraft.notifyOnSubmission);
      if (initialDraft.notificationEmail !== undefined) setNotificationEmail(initialDraft.notificationEmail);
      // Restore integration settings
      if (initialDraft.enableGoogleSheets !== undefined) setEnableGoogleSheets(initialDraft.enableGoogleSheets);
      if (initialDraft.storageOption !== undefined) setStorageOption(initialDraft.storageOption);
      // Restore theme
      if (initialDraft.formTheme) setFormTheme(initialDraft.formTheme);
    } else if (!slug) {
      setSlug(initialSlug || generateSlug());
    }
  }, [initialDraft]);

  // Save draft to localStorage whenever form state changes
  useEffect(() => {
    const draft = {
      currentStep,
      selectedTemplateId,
      templateLanguage,
      title,
      slug,
      description,
      formType,
      status,
      isMultiStep,
      fields,
      formSteps,
      allowMultipleSubmissions,
      requiresAuthentication,
      showProgressBar,
      showQuestionNumbers,
      notifyOnSubmission,
      notificationEmail,
      // Integration settings
      enableGoogleSheets,
      storageOption,
      // Theme settings
      formTheme,
      // Note: banners are not saved as they are File objects
    };
    
    // Show saving indicator
    setIsSaving(true);
    localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(draft));
    
    // Update last saved time after a short delay
    const timer = setTimeout(() => {
      setLastSaved(new Date());
      setIsSaving(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [
    currentStep,
    selectedTemplateId,
    templateLanguage,
    title,
    slug,
    description,
    formType,
    status,
    isMultiStep,
    fields,
    formSteps,
    allowMultipleSubmissions,
    requiresAuthentication,
    showProgressBar,
    showQuestionNumbers,
    notifyOnSubmission,
    notificationEmail,
    enableGoogleSheets,
    storageOption,
    formTheme,
  ]);

  // Handle template selection
  const handleSelectTemplate = (templateId: string | null, fields: FormFieldInput[]) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        // Set title from template
        setTitle(template.name[templateLanguage]);
        setDescription(template.description[templateLanguage]);
        // Set fields from template
        setFields(fields);
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

  // Get preview URL for banner (first one for cover)
  const getCoverPreview = (): string | null => {
    if (banners.length === 0) return null;
    const first = banners[0];
    if (typeof first === 'string') return first;
    return URL.createObjectURL(first);
  };

  // Add new field (with defaults per type: اختيارات، جدول، توقيع، ترتيب)
  const handleAddField = (type: FieldType) => {
    const newField: FormFieldInput = {
      id: `field-${Date.now()}`,
      label: type === FieldType.RECAPTCHA ? 'حماية reCAPTCHA' : '',
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
    };
    setFields(prev => [...prev, newField]);
    setShowFieldSelector(false);
    // Only open editor on mobile - desktop handles editing inside FieldTypeSelector
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      setEditingFieldId(newField.id);
    }
  };

  // Add complete field (from desktop FieldTypeSelector with all data)
  const handleAddCompleteField = (field: FormFieldInput) => {
    const newField: FormFieldInput = {
      ...field,
      id: `field-${Date.now()}`,
      order: fields.length,
    };
    setFields(prev => [...prev, newField]);
    setShowFieldSelector(false);
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
    // Step 2: Basic Info
    if (currentStep === 2) {
      if (!title.trim()) {
        toast.error('الرجاء إدخال عنوان النموذج');
        return false;
      }
      if (!slug || slug.length < 3) {
        toast.error('الرجاء إدخال رابط صالح (3 أحرف على الأقل)');
        return false;
      }
    }
    // Step 3: Fields
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
      if (currentStep === TOTAL_STEPS) {
        // Trigger form submit
        const formElement = document.querySelector('form');
        if (formElement) {
          formElement.requestSubmit();
        }
      } else {
        setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Open full preview in new window
  const handleOpenPreview = () => {
    // Prepare preview data with user verification info
    const previewData = {
      title,
      description,
      slug,
      userId: user?.id,
      fields,
      isMultiStep,
      steps: formSteps,
      theme: formTheme,
      bannerUrl: banners[0] instanceof File ? URL.createObjectURL(banners[0]) : (banners[0] as string),
      allowMultipleSubmissions,
      requiresAuthentication,
      showProgressBar,
      showQuestionNumbers,
    };

    // Store in localStorage
    localStorage.setItem(FORM_PREVIEW_KEY, JSON.stringify(previewData));

    // Open preview in new tab (more reliable than popup)
    window.open(`/app/forms/preview/${slug}`, '_blank');
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== TOTAL_STEPS) return;

    setIsSubmitting(true);
    setSubmitPhase('preparing');
    setShowLongWaitMessage(false);
    let isRedirecting = false;
    longWaitTimeoutRef.current = setTimeout(() => {
      setShowLongWaitMessage(true);
      toast.info('الطلب يستغرق وقتاً. إن كان النموذج قد أُنشئ ستجده في قائمة النماذج.', { duration: 10000 });
    }, 75_000);

    try {
      // Convert banner files to base64 (user sees "جاري تجهيز المحتوى...")
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
        coverImage: coverImageData,
        bannerImages: bannerImagesData.length > 0 ? bannerImagesData : undefined,
        bannerDisplayMode: bannerImagesData.length > 0 ? bannerDisplayMode : undefined,
        // Integration settings
        enableGoogleSheets,
        storageProvider: storageOption || 's3', // Default to S3 if not selected
        // Theme settings
        theme: formTheme,
      };

      // Valid field types (must match backend enum)
      const VALID_FIELD_TYPES = [
        // Input fields
        'TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'PHONE', 'URL', 'DATE', 'TIME', 'DATETIME',
        'SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'FILE', 'RATING', 'SCALE', 'TOGGLE', 'MATRIX', 'SIGNATURE', 'RANKING',
        // Layout blocks
        'HEADING', 'PARAGRAPH', 'DIVIDER', 'TITLE', 'LABEL',
        // Embed blocks
        'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
        // Advanced blocks
        'CONDITIONAL_LOGIC', 'CALCULATED', 'HIDDEN', 'RECAPTCHA'
      ];

      // Helper to validate and sanitize field type
      const sanitizeFieldType = (type: string | FieldType): string => {
        const typeStr = String(type);
        if (VALID_FIELD_TYPES.includes(typeStr)) {
          return typeStr;
        }
        console.warn(`Invalid field type "${typeStr}", defaulting to TEXT`);
        return 'TEXT';
      };

      if (isMultiStep) {
        formData.steps = formSteps.map(step => ({
          title: step.title,
          description: step.description,
          order: step.order,
          fields: step.fields.map((f) => ({
            label: f.label,
            description: f.description,
            type: sanitizeFieldType(f.type),
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
          })),
        }));
      } else {
        formData.fields = fields.map((f) => ({
          label: f.label,
          description: f.description,
          type: sanitizeFieldType(f.type),
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
        }));
      }

      setSubmitPhase('submitting');
      const created = await createForm(formData);

      if (!created?.id) {
        toast.error('تم إنشاء النموذج لكن لم نتمكن من نقلك لصفحة النماذج.');
        setIsSubmitting(false);
        setSubmitPhase('idle');
        return;
      }

      localStorage.removeItem(FORM_DRAFT_KEY);
      toast.success('تم إنشاء النموذج بنجاح! ✨');
      
      // Check if Google Sheets integration was requested
      const integrationPrefs = (created as any)?._integrationPreferences;
      if (integrationPrefs?.enableGoogleSheets) {
        toast.info('جاري ربط Google Sheets...', { duration: 3000 });
        
        // Start Google Sheets OAuth
        try {
          const result = await connectGoogleSheets(created.id);
          if (result?.authUrl) {
            // Open OAuth in same window - will redirect back to responses page
            window.location.href = result.authUrl;
            return; // Don't continue with normal redirect
          }
        } catch (gsError) {
          console.error('Google Sheets connection error:', gsError);
          toast.error('فشل في ربط Google Sheets. يمكنك ربطه لاحقاً من صفحة الردود.');
        }
      }
      
      setSubmitPhase('redirecting');
      isRedirecting = true;

      await new Promise((r) => setTimeout(r, 600));

      router.replace('/app/forms');
    } catch (error: any) {
      toast.error(error.message || 'فشل في إنشاء النموذج');
      setIsSubmitting(false);
      setSubmitPhase('idle');
    } finally {
      if (longWaitTimeoutRef.current) {
        clearTimeout(longWaitTimeoutRef.current);
        longWaitTimeoutRef.current = null;
      }
      // Only reset if not redirecting
      if (!isRedirecting) {
        setIsSubmitting(false);
        setSubmitPhase('idle');
      }
      setShowLongWaitMessage(false);
    }
  };

  const editingField = editingFieldId ? (fields.find(f => f.id === editingFieldId) ?? null) : null;

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
      className="flex flex-col items-center text-sm text-slate-800 dark:text-slate-200"
    >
      <div className="w-full max-w-md sm:max-w-xl px-1">
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

        {/* Type & Status - Horizontal Scroll on Mobile */}
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
          className="w-full flex items-center justify-between py-3 px-4 bg-muted/30 hover:bg-muted/40 rounded-2xl transition-all duration-200"
          aria-label="إضافة صور الغلاف"
        >
          <div className="flex items-center gap-2">
            <ImageLucide className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">صور الغلاف</span>
            {banners.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{banners.length}</span>
            )}
          </div>
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Banner Upload Dialog */}
        <Dialog open={showBannerDialog} onOpenChange={setShowBannerDialog}>
          <DialogContent className="sm:max-w-md rounded-4xl">
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
                className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
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
  const renderStep3 = () => {
    // Icons for field types
    const getFieldIcon = (type: FieldType) => {
      const icons: Record<string, React.ReactNode> = {
        [FieldType.TEXT]: <FileText className="w-4 h-4" />,
        [FieldType.TEXTAREA]: <FileText className="w-4 h-4" />,
        [FieldType.EMAIL]: <Mail className="w-4 h-4" />,
        [FieldType.NUMBER]: <FileText className="w-4 h-4" />,
        [FieldType.PHONE]: <Phone className="w-4 h-4" />,
        [FieldType.URL]: <LinkIcon className="w-4 h-4" />,
        [FieldType.SELECT]: <FileText className="w-4 h-4" />,
        [FieldType.MULTISELECT]: <FileText className="w-4 h-4" />,
        [FieldType.RANKING]: <Sheet className="w-4 h-4" />,
        [FieldType.MATRIX]: <Sheet className="w-4 h-4" />,
        [FieldType.SIGNATURE]: <Edit2 className="w-4 h-4" />,
        [FieldType.RATING]: <Star className="w-4 h-4" />,
        [FieldType.SCALE]: <FileText className="w-4 h-4" />,
        [FieldType.FILE]: <FileText className="w-4 h-4" />,
        [FieldType.CHECKBOX]: <FileText className="w-4 h-4" />,
        [FieldType.RADIO]: <FileText className="w-4 h-4" />,
        [FieldType.TOGGLE]: <FileText className="w-4 h-4" />,
        [FieldType.HEADING]: <FileText className="w-4 h-4" />,
        [FieldType.PARAGRAPH]: <FileText className="w-4 h-4" />,
        [FieldType.DIVIDER]: <FileText className="w-4 h-4" />,
        [FieldType.TITLE]: <FileText className="w-4 h-4" />,
        [FieldType.LABEL]: <FileText className="w-4 h-4" />,
        [FieldType.IMAGE]: <FileText className="w-4 h-4" />,
        [FieldType.VIDEO]: <FileText className="w-4 h-4" />,
        [FieldType.AUDIO]: <FileText className="w-4 h-4" />,
        [FieldType.EMBED]: <FileText className="w-4 h-4" />,
        [FieldType.HIDDEN]: <FileText className="w-4 h-4" />,
        [FieldType.CALCULATED]: <FileText className="w-4 h-4" />,
        [FieldType.CONDITIONAL_LOGIC]: <FileText className="w-4 h-4" />,
        [FieldType.RECAPTCHA]: <FileText className="w-4 h-4" />,
      };
      return icons[type] || <FileText className="w-4 h-4" />;
    };

    return (
      <motion.div
        key="step3"
        initial={{ opacity: 0, x: 15, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -15, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: 'transform, opacity' }}
        className="flex flex-col items-center w-full"
      >
        {/* Clean Header */}
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">حقول النموذج</h2>
        <p className="text-muted-foreground text-xs sm:text-sm mb-4">
          {selectedTemplateId ? 'راجع الحقول أو عدّلها' : 'أضف حقول النموذج'}
        </p>

        {/* Fields Counter - Minimal */}
        {fields.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">{fields.length} حقول</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-xs text-muted-foreground">اسحب للترتيب</span>
          </div>
        )}

        <div className="w-full max-w-md space-y-3 px-1">
          {/* Multi-step Editor */}
          {isMultiStep ? (
            <StepEditor
              steps={formSteps}
              onStepsChange={setFormSteps}
            />
          ) : (
            <>
              {/* Fields List */}
              {fields.length > 0 ? (
                <Reorder.Group 
                  axis="y" 
                  values={fields} 
                  onReorder={handleReorderFields}
                  className="space-y-2"
                  layoutScroll
                >
                  {fields.map((field, index) => (
                    <DraggableFieldItem
                      key={field.id}
                      field={field}
                      index={index}
                      onEdit={setEditingFieldId}
                      onDuplicate={handleDuplicateField}
                      onDelete={handleDeleteField}
                      getFieldIcon={getFieldIcon}
                    />
                  ))}
                </Reorder.Group>
              ) : (
                <motion.div 
                  className="text-center py-10 border-2 border-dashed border-border rounded-2xl bg-muted/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Plus className="w-8 h-8 text-primary/40" />
                  </motion.div>
                  <p className="text-sm font-medium text-foreground mb-1">ابدأ بإضافة الحقول</p>
                  <p className="text-xs text-muted-foreground/70">اضغط الزر أدناه لإضافة حقل جديد</p>
                </motion.div>
              )}

              {/* Field Editor - Desktop uses FieldTypeSelector, Mobile uses FieldEditorDialog */}
              {editingFieldId && (
                <>
                  {/* Desktop: FieldTypeSelector */}
                  <AnimatePresence>
                    <FieldTypeSelector
                      onSelect={() => {}}
                      onClose={() => setEditingFieldId(null)}
                      editingField={editingField}
                      onUpdateField={(updates) => editingField && handleUpdateField(editingField.id, updates)}
                      onSaveField={() => setEditingFieldId(null)}
                      mode="edit"
                    />
                  </AnimatePresence>
                  {/* Mobile: FieldEditorDialog (auto-hides on desktop) */}
                  <FieldEditorDialog
                    field={editingField}
                    open={editingFieldId !== null}
                    onOpenChange={(open) => !open && setEditingFieldId(null)}
                    onUpdate={(updates) => editingField && handleUpdateField(editingField.id, updates)}
                    onSave={() => setEditingFieldId(null)}
                  />
                </>
              )}

              {/* Add Field Button - Clean */}
              <motion.button
                type="button"
                onClick={() => setShowFieldSelector(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-foreground hover:bg-foreground/90 text-background rounded-2xl transition-all duration-200 text-sm font-medium"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                aria-label="إضافة حقل جديد"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة حقل</span>
              </motion.button>

              {/* Field Type Selector Modal */}
              <AnimatePresence>
                {showFieldSelector && (
                  <FieldTypeSelector
                    onSelect={handleAddField}
                    onSelectField={handleAddCompleteField}
                    onClose={() => setShowFieldSelector(false)}
                  />
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // Step 4: Settings
  const renderStep4 = () => (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 15, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -15, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className="flex flex-col items-center w-full"
    >
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">إعدادات النموذج</h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">تخصيص سلوك وعرض النموذج</p>
      </div>

      {/* Settings Sections */}
      <div className="w-full max-w-md space-y-5 px-1">
        
        {/* Behavior Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1 mb-3">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">السلوك</span>
          </div>
          
          <div className="bg-card border border-border rounded-4xl divide-y divide-border overflow-hidden">
            {/* Multiple Submissions */}
            <div className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-all duration-200">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">الإرسال المتعدد</p>
                <p className="text-xs text-muted-foreground">السماح للمستخدم بإرسال أكثر من استجابة</p>
              </div>
              <div dir="ltr">
                <Switch checked={allowMultipleSubmissions} onCheckedChange={setAllowMultipleSubmissions} />
              </div>
            </div>

            {/* Requires Authentication */}
            <div className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-all duration-200">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <LockIcon className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">تسجيل الدخول مطلوب</p>
                <p className="text-xs text-muted-foreground">يجب على المستخدم تسجيل الدخول للإرسال</p>
              </div>
              <div dir="ltr">
                <Switch checked={requiresAuthentication} onCheckedChange={setRequiresAuthentication} />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1 mb-3">
            <div className="w-1 h-4 bg-rose-500 rounded-full" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">الإشعارات</span>
          </div>
          
          <div className="bg-card border border-border rounded-4xl overflow-hidden">
            {/* Notify on Submission */}
            <div className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-all duration-200">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">إشعار بالإرسال</p>
                <p className="text-xs text-muted-foreground">استلام بريد إلكتروني عند كل استجابة</p>
              </div>
              <div dir="ltr">
                <Switch checked={notifyOnSubmission} onCheckedChange={setNotifyOnSubmission} />
              </div>
            </div>
            
            <AnimatePresence>
              {notifyOnSubmission && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-4 bg-muted/20">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">البريد الإلكتروني للإشعارات</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full h-11 pr-10 pl-4 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm transition-all"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  );

  // Step 5: Theme Customization
  const renderStep5 = () => (
    <motion.div
      key="step5"
      initial={{ opacity: 0, x: 15, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -15, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className="flex flex-col items-center w-full"
    >
      {/* Clean Header */}
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">تخصيص المظهر</h2>
      <p className="text-muted-foreground text-xs sm:text-sm mb-4">اختر ألوان النموذج</p>

      {/* Theme Customizer */}
      <div className="w-full max-w-md px-1">
        <FormThemeCustomizer
          theme={formTheme}
          onChange={setFormTheme}
        />
      </div>
    </motion.div>
  );

  // Step 6: Integrations (Optional)
  const renderStep6 = () => (
    <motion.div
      key="step6"
      initial={{ opacity: 0, x: 15, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -15, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className="flex flex-col items-center w-full"
    >
      {/* Clean Header */}
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">التكاملات الخارجية</h2>
      <p className="text-muted-foreground text-xs sm:text-sm mb-1">اربط نموذجك بخدمات خارجية</p>
      <p className="text-xs text-muted-foreground/70 mb-4 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        اختياري
      </p>

      <div className="w-full max-w-md space-y-4 px-1">
        {/* Google Sheets Integration */}
        <div className={cn(
          "relative rounded-4xl border-2 transition-all duration-200 overflow-hidden",
          enableGoogleSheets 
            ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" 
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
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
                  ? "bg-green-100 dark:bg-green-900/30" 
                  : "bg-gray-100 dark:bg-gray-700"
              )}>
                <Sheet className={cn(
                  "w-6 h-6",
                  enableGoogleSheets ? "text-green-600" : "text-gray-500"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">Google Sheets</h3>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    enableGoogleSheets 
                      ? "bg-green-500 border-green-500" 
                      : "border-gray-300 dark:border-gray-600"
                  )}>
                    {enableGoogleSheets && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <feature.icon className="w-3.5 h-3.5 text-green-500" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
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
            <FolderOpen className="w-4 h-4 text-gray-500" />
            <h3 className="font-medium text-gray-800 dark:text-gray-200">تخزين الملفات المرفوعة</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
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
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600"
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
                storageOption === 's3' ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-700"
              )}>
                <Cloud className={cn("w-5 h-5", storageOption === 's3' ? "text-blue-600" : "text-gray-500")} />
              </div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Amazon S3</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">افتراضي - سريع وآمن</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  <span>سرعة تحميل عالية</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
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
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600"
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
                storageOption === 'google_drive' ? "bg-amber-100 dark:bg-amber-900/30" : "bg-gray-100 dark:bg-gray-700"
              )}>
                <HardDrive className={cn("w-5 h-5", storageOption === 'google_drive' ? "text-amber-600" : "text-gray-500")} />
              </div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Google Drive</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">مجاني - سهل المشاركة</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <CheckCircle2 className="w-3 h-3 text-amber-500" />
                  <span>15GB مجاني</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <CheckCircle2 className="w-3 h-3 text-amber-500" />
                  <span>تكامل Google</span>
                </div>
              </div>
            </button>
          </div>

          {storageOption === null && (
            <p className="text-[10px] text-center text-gray-400 dark:text-gray-500">
              سيتم استخدام التخزين الافتراضي (S3) إذا لم تختر
            </p>
          )}
        </div>

        {/* Skip Note */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
          <Sparkles className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            يمكنك تخطي هذه الخطوة وإعداد التكاملات لاحقاً من صفحة الردود
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Step 7: Preview
  const renderStep7 = () => (
    <motion.div
      key="step7"
      initial={{ opacity: 0, x: 15, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -15, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className="flex flex-col items-center w-full"
    >
      {/* Clean Header */}
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">معاينة النموذج</h2>
      <p className="text-muted-foreground text-xs sm:text-sm mb-5">راجع قبل الإنشاء</p>

      {/* Preview Card */}
      <div className="w-full max-w-md px-1">
        <div className="bg-card rounded-4xl border border-border overflow-hidden shadow-sm">
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
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{title || 'بدون عنوان'}</h3>
                <span className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0",
                  status === FormStatus.PUBLISHED ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  status === FormStatus.DRAFT ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' :
                  status === FormStatus.ARCHIVED ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}>
                  {FORM_STATUS_LABELS[status]}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description || 'بدون وصف'}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                  {FORM_TYPE_LABELS[formType]}
                </span>
                <span className="text-xs text-gray-500">
                  {getTotalFieldsCount()} حقول
                </span>
                {isMultiStep && (
                  <span className="text-xs text-gray-500">
                    {formSteps.length} خطوات
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Settings Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">الإعدادات</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", allowMultipleSubmissions ? "bg-green-500" : "bg-gray-300")} />
                <span className="text-gray-600 dark:text-gray-400">إرسال متعدد</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", requiresAuthentication ? "bg-green-500" : "bg-gray-300")} />
                <span className="text-gray-600 dark:text-gray-400">يتطلب تسجيل دخول</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", notifyOnSubmission ? "bg-green-500" : "bg-gray-300")} />
                <span className="text-gray-600 dark:text-gray-400">إشعارات البريد</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", showProgressBar ? "bg-green-500" : "bg-gray-300")} />
                <span className="text-gray-600 dark:text-gray-400">شريط التقدم</span>
              </div>
            </div>
          </div>

          {/* Integrations Summary */}
          {(enableGoogleSheets || storageOption) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                التكاملات
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", enableGoogleSheets ? "bg-green-500" : "bg-gray-300")} />
                  <span className="text-gray-600 dark:text-gray-400">Google Sheets</span>
                </div>
                <div className="flex items-center gap-2">
                  {storageOption === 'google_drive' ? (
                    <>
                      <FolderOpen className="w-3 h-3 text-amber-500" />
                      <span className="text-gray-600 dark:text-gray-400">Google Drive</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3 h-3 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">S3 Storage</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Theme Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              المظهر
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-5 h-5 rounded-md border border-gray-200"
                  style={{ backgroundColor: formTheme.primaryColor }}
                />
                <div 
                  className="w-5 h-5 rounded-md border border-gray-200"
                  style={{ backgroundColor: formTheme.backgroundColor }}
                />
                <div 
                  className="w-5 h-5 rounded-md border border-gray-200"
                  style={{ backgroundColor: formTheme.accentColor }}
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formTheme.presetId ? 
                  `سمة ${formTheme.presetId === 'default' ? 'افتراضية' : 
                         formTheme.presetId === 'ocean' ? 'محيط' :
                         formTheme.presetId === 'forest' ? 'غابة' :
                         formTheme.presetId === 'sunset' ? 'غروب' :
                         formTheme.presetId === 'rose' ? 'وردي' :
                         formTheme.presetId === 'midnight' ? 'منتصف الليل' :
                         formTheme.presetId === 'minimal' ? 'بسيط' :
                         formTheme.presetId === 'corporate' ? 'رسمي' : 'مخصصة'}` 
                  : 'مخصصة'}
              </span>
            </div>
          </div>
        </div>
        </div>
        {/* Note: Submit button is now in ProgressIndicator below */}
      </div>
    </motion.div>
  );

  // ============================================
  // Main Render
  // ============================================

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    return `منذ ${hours} ساعة`;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center gap-6 lg:gap-10 min-h-[calc(100vh-8rem)]">
        {/* Form Content Section - Right */}
        <div className="flex-1 order-1 max-w-xl w-full mx-auto lg:mx-0">
          {/* Header - Desktop */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            {/* Back to Forms */}
            <motion.button
              type="button"
              onClick={() => router.push('/app/forms')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 px-3 py-1.5 rounded-xl hover:bg-muted/40"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              aria-label="العودة لقائمة النماذج"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للنماذج</span>
            </motion.button>

            {/* Step Progress - Clean Dots */}
            <div className="flex items-center gap-2">
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
                    style={{ willChange: 'width, opacity' }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {currentStep}/{TOTAL_STEPS}
              </span>
            </div>

            {/* Preview Button */}
            <motion.button
              type="button"
              onClick={handleOpenPreview}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200 px-3 py-1.5 rounded-xl hover:bg-primary/10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="معاينة كاملة للنموذج"
            >
              <Eye className="w-4 h-4" />
              <span>معاينة</span>
              <ExternalLink className="w-3 h-3" />
            </motion.button>

            {/* Auto-save Status - Icon Only */}
            <div className="w-28 flex justify-end">
              <AnimatePresence mode="wait">
                {isSaving ? (
                  <motion.div
                    key="saving"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>يحفظ...</span>
                  </motion.div>
                ) : lastSaved ? (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    title={`تم الحفظ ${formatTimeAgo(lastSaved)}`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between py-3 mb-2">
            {/* Back Button */}
            <motion.button
              type="button"
              onClick={() => router.push('/app/forms')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 px-2 py-1 rounded-xl hover:bg-muted/40"
              whileTap={{ scale: 0.95 }}
              aria-label="العودة لقائمة النماذج"
            >
              <ArrowRight className="w-4 h-4" />
              <span>عودة</span>
            </motion.button>

            {/* Progress Dots - Animated */}
            <div className="flex items-center gap-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    width: i + 1 === currentStep ? 16 : 4,
                    opacity: i + 1 <= currentStep ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className={cn(
                    "h-1 rounded-full",
                    i + 1 <= currentStep 
                      ? "bg-foreground" 
                      : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            
            {/* Mobile Preview Button */}
            <motion.button
              type="button"
              onClick={handleOpenPreview}
              className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-all duration-200 px-2 py-1 rounded-xl hover:bg-primary/10"
              whileTap={{ scale: 0.95 }}
              aria-label="معاينة كاملة للنموذج"
            >
              <Eye className="w-4 h-4" />
              <span>معاينة</span>
            </motion.button>
          </div>

          {/* Form Content - Clean without container */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
              {currentStep === 6 && renderStep6()}
              {currentStep === 7 && renderStep7()}
            </AnimatePresence>
          </div>

          {/* Navigation - Minimal Style */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onBack={handleBack}
              onContinue={handleContinue}
              isLoading={isSubmitting}
              isBackVisible={currentStep > 1}
              continueLabel="التالي"
              backLabel="السابق"
              finishLabel={
                submitPhase === 'preparing'
                  ? 'جاري تجهيز المحتوى...'
                  : submitPhase === 'submitting'
                    ? 'جاري إنشاء النموذج...'
                    : submitPhase === 'redirecting'
                      ? 'جاري التحويل...'
                      : 'إنشاء النموذج'
              }
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Phone Preview Section - Desktop - Left - Fixed */}
        <div className="hidden lg:block order-2 flex-shrink-0 lg:sticky lg:top-8 h-fit">
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ willChange: 'transform, opacity' }}
          >
            <FormPhonePreview
              title={title}
              description={description}
              fields={isMultiStep ? (formSteps[0]?.fields || []) : fields}
              isMultiStep={isMultiStep}
              steps={formSteps}
              theme={formTheme}
              bannerUrl={banners[0] instanceof File ? URL.createObjectURL(banners[0]) : (banners[0] as string)}
              showLabel={true}
            />
          </motion.div>
        </div>
      </div>

      {/* Loading overlay during submit */}
      {isSubmitting && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-white/95 dark:bg-gray-950/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-label="جاري التحميل"
          role="status"
        >
          <motion.div 
            className="flex flex-col items-center gap-6 max-w-sm mx-4 text-center"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="relative">
              <motion.div 
                className="w-14 h-14 rounded-full border-2 border-gray-200 dark:border-gray-700" 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div 
                className="absolute inset-0 w-14 h-14 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent" 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <div className="space-y-2">
              <motion.p 
                className="text-base font-medium text-gray-900 dark:text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {submitPhase === 'preparing'
                  ? 'جاري تجهيز المحتوى...'
                  : submitPhase === 'submitting'
                    ? 'جاري إنشاء النموذج...'
                    : 'جاري التحويل...'}
              </motion.p>
              {showLongWaitMessage && (
                <motion.button
                  type="button"
                  onClick={() => router.replace('/app/forms')}
                  className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white underline-offset-4 hover:underline transition-all duration-200 px-4 py-2 rounded-xl hover:bg-muted/40"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  انتقل إلى قائمة النماذج
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile Phone Preview Modal */}
      <AnimatePresence>
        {showMobilePreview && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobilePreview(false)}
              className="fixed inset-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl lg:hidden"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed inset-0 z-50 lg:hidden flex flex-col items-center justify-center p-6"
            >
              {/* Close Button */}
              <motion.button
                type="button"
                onClick={() => setShowMobilePreview(false)}
                className="absolute top-6 left-6 z-10 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                إغلاق
              </motion.button>
              
              {/* Preview Container */}
              <div className="flex flex-col items-center">
                <FormPhonePreview
                  title={title}
                  description={description}
                  fields={isMultiStep ? (formSteps[0]?.fields || []) : fields}
                  isMultiStep={isMultiStep}
                  steps={formSteps}
                  theme={formTheme}
                  bannerUrl={banners[0] instanceof File ? URL.createObjectURL(banners[0]) : (banners[0] as string)}
                  showLabel={false}
                  compact={true}
                />
                
                {/* Theme Label */}
                <motion.p 
                  className="mt-6 text-sm text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {formTheme.presetId === 'default' ? 'السمة الافتراضية' :
                   formTheme.presetId === 'ocean' ? 'سمة المحيط' :
                   formTheme.presetId === 'forest' ? 'سمة الغابة' :
                   formTheme.presetId === 'sunset' ? 'سمة الغروب' :
                   formTheme.presetId === 'rose' ? 'سمة وردي' :
                   formTheme.presetId === 'midnight' ? 'سمة منتصف الليل' :
                   formTheme.presetId === 'minimal' ? 'سمة بسيطة' :
                   formTheme.presetId === 'corporate' ? 'سمة رسمية' : 'سمة مخصصة'}
                </motion.p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </form>
  );
}

export default CreateFormWizard;
