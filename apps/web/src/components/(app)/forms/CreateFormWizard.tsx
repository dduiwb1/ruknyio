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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// LocalStorage key for form draft persistence
const FORM_DRAFT_KEY = 'rukny_form_draft';
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
import { useGoogleSheets } from '@/lib/hooks/useGoogleSheets';

// ============================================
// Constants
// ============================================

const TOTAL_STEPS = 6;

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
      className={cn(
        "group relative bg-card rounded-xl border border-border",
        "shadow-sm hover:shadow-md transition-shadow duration-200"
      )}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 p-3">
        {/* Drag Handle - Only this triggers drag */}
        <div 
          className="flex flex-col items-center justify-center p-2 -m-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-5 h-5 pointer-events-none" />
        </div>

        {/* Order Number */}
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>

        {/* Field Icon */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground">
          {getFieldIcon(field.type as FieldType)}
        </div>

        {/* Field Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground truncate">{field.label}</span>
            {field.required && (
              <span className="text-[10px] px-1.5 py-0.5 bg-destructive/10 text-destructive rounded hidden sm:inline">
                مطلوب
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {FIELD_TYPE_LABELS[field.type as FieldType]}
          </span>
        </div>

        {/* Actions - Always visible */}
        <div className="flex items-center gap-1">
          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(field.id); }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="تعديل"
            >
              <Edit2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDuplicate(field.id); }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="نسخ"
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>

          {/* Mobile dropdown menu */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px] rounded-xl">
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onEdit(field.id); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDuplicate(field.id); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  نسخ
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer text-red-600"
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
};

// ============================================
// Main Component
// ============================================

export function CreateFormWizard({ initialDraft }: { initialDraft?: FormDraftRestore | null } = {}) {
  const router = useRouter();
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
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [formType, setFormType] = useState<FormType>(FormType.SURVEY);
  const [status, setStatus] = useState<FormStatus>(FormStatus.DRAFT);
  // Banners state (cover images)
  const [banners, setBanners] = useState<(File | string)[]>([]);
  const [bannerDisplayMode, setBannerDisplayMode] = useState<BannerDisplayMode>('single');
  const [isMultiStep, setIsMultiStep] = useState(false);
  
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
    } else if (!slug) {
      setSlug(generateSlug());
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

  // Add new field
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
        : undefined,
      minValue: type === FieldType.RATING ? 1 : type === FieldType.SCALE ? 0 : undefined,
      maxValue: type === FieldType.RATING ? 5 : type === FieldType.SCALE ? 10 : undefined,
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
      };

      // Valid field types (must match backend enum)
      const VALID_FIELD_TYPES = [
        'TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'PHONE', 'DATE', 'TIME', 'DATETIME',
        'SELECT', 'RADIO', 'CHECKBOX', 'FILE', 'RATING', 'SCALE', 'TOGGLE', 'MATRIX', 'SIGNATURE'
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
          fields: step.fields.map(f => ({
            label: f.label,
            description: f.description,
            type: sanitizeFieldType(f.type),
            order: f.order,
            required: f.required,
            placeholder: f.placeholder,
            options: f.options,
            minValue: f.minValue,
            maxValue: f.maxValue,
          })),
        }));
      } else {
        formData.fields = fields.map((f, index) => ({
          label: f.label,
          description: f.description,
          type: sanitizeFieldType(f.type),
          order: f.order,
          required: f.required,
          placeholder: f.placeholder,
          options: f.options,
          minValue: f.minValue,
          maxValue: f.maxValue,
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-sm text-slate-800 dark:text-slate-200"
    >
      <div className="w-full max-w-xl">
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col  items-center text-sm text-slate-800 dark:text-slate-200"
    >
      {/* Step Header */}
      <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        الخطوة 2 من 6
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">معلومات النموذج</h2>
      <p className="text-muted-foreground pb-6 text-center text-sm">
        أخبرنا عن نموذجك الجديد
      </p>

      {/* Form Fields */}
      <div className="w-full max-w-md px-4 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="font-medium text-gray-800 dark:text-gray-200">
            عنوان النموذج <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center mt-2 mb-4 h-11 pr-3 border border-gray-300 dark:border-gray-600 rounded-full focus-within:ring-2 focus-within:ring-gray-400 transition-all overflow-hidden bg-white dark:bg-gray-800">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3H3C1.89543 3 1 3.89543 1 5V15C1 16.1046 1.89543 17 3 17H17C18.1046 17 19 16.1046 19 15V5C19 3.89543 18.1046 3 17 3Z" stroke="#64748b" strokeWidth="1.5" fill="none"/>
              <path d="M5 7H15M5 10H12" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: استبيان رضا العملاء"
              className="h-full px-3 w-full outline-none bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="font-medium text-gray-800 dark:text-gray-200">
            الوصف (اختياري)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر للنموذج..."
            rows={3}
            className="w-full mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none outline-none focus:ring-2 focus-within:ring-gray-400 transition-all text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
          />
        </div>

        {/* Form Type & Status - Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Form Type */}
          <div className="text-right">
            <label className="font-medium text-gray-800 dark:text-gray-200">نوع النموذج</label>
            <Select value={formType} onValueChange={(v) => setFormType(v as FormType)}>
              <SelectTrigger className="mt-2 h-12 w-full rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-800 text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(FORM_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="rounded-lg text-right">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Status */}
          <div className="text-right">
            <label className="font-medium text-gray-800 dark:text-gray-200">حالة النموذج</label>
            <Select value={status} onValueChange={(v) => setStatus(v as FormStatus)}>
              <SelectTrigger className="mt-2 h-12 w-full rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-800 text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(FORM_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="rounded-lg text-right">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Multi-step Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">نموذج متعدد الخطوات</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">تقسيم النموذج إلى عدة مراحل</p>
            </div>
          </div>
          <div dir="ltr">
            <Switch
              checked={isMultiStep}
              onCheckedChange={setIsMultiStep}
            />
          </div>
        </div>

        {/* Cover Image / Banners */}
        <div>
          <label className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
            <ImageLucide className="w-4 h-4" />
            صور الغلاف (اختياري)
          </label>
          <FormBannersUpload
            banners={banners}
            onChange={setBanners}
            displayMode={bannerDisplayMode}
            onDisplayModeChange={setBannerDisplayMode}
            maxFiles={5}
            maxSizeMB={5}
          />
        </div>
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
        [FieldType.SELECT]: <FileText className="w-4 h-4" />,
      };
      return icons[type] || <FileText className="w-4 h-4" />;
    };

    return (
      <motion.div
        key="step3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-sm text-slate-800 dark:text-slate-200"
      >
        {/* Step Header */}
        <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
          الخطوة 3 من 6
        </p>
        <h2 className="text-2xl font-bold py-3 text-center text-foreground">حقول النموذج</h2>
        <p className="text-gray-500 dark:text-gray-400 pb-4 text-center text-sm">
          {selectedTemplateId ? 'راجع الحقول أو عدّلها حسب احتياجاتك' : 'أضف الحقول التي تريد جمع بياناتها'}
        </p>

        {/* Fields Counter */}
        {fields.length > 0 && (
          <div className="flex items-center gap-2 mb-4 text-xs">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
              {fields.length} حقول
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 dark:text-gray-400">اسحب للترتيب</span>
          </div>
        )}

        <div className="w-full max-w-lg px-4 space-y-3">
          {/* Multi-step Editor */}
          {isMultiStep ? (
            <StepEditor
              steps={formSteps}
              onStepsChange={setFormSteps}
            />
          ) : (
            <>
              {/* Fields List - Improved for mobile */}
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
                <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">لم تقم بإضافة أي حقول بعد</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">ابدأ بإضافة الحقول لنموذجك</p>
                </div>
              )}

              {/* Field Editor Dialog */}
              <FieldEditorDialog
                field={editingField}
                open={editingFieldId !== null}
                onOpenChange={(open) => !open && setEditingFieldId(null)}
                onUpdate={(updates) => editingField && handleUpdateField(editingField.id, updates)}
                onSave={() => setEditingFieldId(null)}
              />

              {/* Add Field Button */}
              <button
                type="button"
                onClick={() => setShowFieldSelector(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl transition-all font-medium shadow-lg shadow-gray-900/25 dark:shadow-white/25"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة حقل جديد</span>
              </button>

              {/* Field Type Selector Modal */}
              <AnimatePresence>
                {showFieldSelector && (
                  <FieldTypeSelector
                    onSelect={handleAddField}
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-sm text-slate-800 dark:text-slate-200"
    >
      {/* Step Header */}
      <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        الخطوة 4 من 6
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">إعدادات النموذج</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        خصص سلوك النموذج
      </p>

      {/* Settings List */}
      <div className="w-full max-w-md px-4 space-y-3">
        {/* Multiple Submissions */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">السماح بالإرسال المتعدد</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">السماح للمستخدم بإرسال أكثر من رد</p>
          </div>
          <div dir="ltr">
            <Switch checked={allowMultipleSubmissions} onCheckedChange={setAllowMultipleSubmissions} />
          </div>
        </div>

        {/* Requires Authentication */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">يتطلب تسجيل الدخول</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">يجب على المستخدم تسجيل الدخول للإرسال</p>
          </div>
          <div dir="ltr">
            <Switch checked={requiresAuthentication} onCheckedChange={setRequiresAuthentication} />
          </div>
        </div>

        {/* Show Progress Bar */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">إظهار شريط التقدم</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">عرض نسبة الإكمال للمستخدم</p>
          </div>
          <div dir="ltr">
            <Switch checked={showProgressBar} onCheckedChange={setShowProgressBar} />
          </div>
        </div>

        {/* Show Question Numbers */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">ترقيم الأسئلة</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">عرض أرقام الأسئلة</p>
          </div>
          <div dir="ltr">
            <Switch checked={showQuestionNumbers} onCheckedChange={setShowQuestionNumbers} />
          </div>
        </div>

        {/* Notify on Submission */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">إشعار عند الإرسال</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">استلام بريد عند كل رد جديد</p>
            </div>
            <div dir="ltr">
              <Switch checked={notifyOnSubmission} onCheckedChange={setNotifyOnSubmission} />
            </div>
          </div>
          
          {notifyOnSubmission && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center h-11 pr-3 border border-gray-200 dark:border-gray-700 rounded-full focus-within:ring-2 focus-within:ring-gray-400 transition-all overflow-hidden bg-white dark:bg-gray-800">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="h-full px-3 w-full outline-none bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                  dir="ltr"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Step 5: Integrations (Optional)
  const renderStep5 = () => (
    <motion.div
      key="step5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-sm text-slate-800 dark:text-slate-200"
    >
      {/* Step Header */}
      <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        الخطوة 5 من 6
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">التكاملات الخارجية</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-2 text-center text-sm">
        اربط نموذجك بخدمات خارجية لتسهيل العمل
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 pb-6 text-center flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        اختياري - يمكنك إعداده لاحقاً من صفحة الردود
      </p>

      <div className="w-full max-w-md px-4 space-y-4">
        {/* Google Sheets Integration */}
        <div className={cn(
          "relative rounded-2xl border-2 transition-all overflow-hidden",
          enableGoogleSheets 
            ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" 
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
        )}>
          <button
            type="button"
            onClick={() => setEnableGoogleSheets(!enableGoogleSheets)}
            className="w-full p-4 text-right"
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
                "relative p-4 rounded-xl border-2 text-right transition-all",
                storageOption === 's3'
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600"
              )}
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
                "relative p-4 rounded-xl border-2 text-right transition-all",
                storageOption === 'google_drive'
                  ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600"
              )}
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
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
          <Sparkles className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
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
      className="flex flex-col items-center text-sm text-slate-800 dark:text-slate-200"
    >
      {/* Step Header */}
      <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        الخطوة 6 من 6
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">معاينة النموذج</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        راجع النموذج قبل الإنشاء
      </p>

      {/* Preview Card */}
      <div className="w-full max-w-md px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      {/* Auto-save Indicator */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <AnimatePresence mode="wait">
          {isSaving ? (
            <motion.div
              key="saving"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-1.5 text-xs text-gray-500"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>جاري الحفظ...</span>
            </motion.div>
          ) : lastSaved ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>تم الحفظ تلقائياً {formatTimeAgo(lastSaved)}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Form Container */}
      <div className="p-4 sm:p-6">
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
      <div className="mt-4">
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

      {/* Loading overlay during submit */}
      {isSubmitting && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          aria-hidden
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-card border border-border p-6 shadow-lg max-w-sm mx-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground text-center">
              {submitPhase === 'preparing'
                ? 'جاري تجهيز المحتوى...'
                : submitPhase === 'submitting'
                  ? 'جاري إنشاء النموذج...'
                  : 'جاري التحويل...'}
            </p>
            {showLongWaitMessage && (
              <button
                type="button"
                onClick={() => router.replace('/app/forms')}
                className="text-sm text-primary underline hover:no-underline font-medium"
              >
                انتقل إلى قائمة النماذج
              </button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}

export default CreateFormWizard;
