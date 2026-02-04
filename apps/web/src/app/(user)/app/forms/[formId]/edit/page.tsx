'use client';

import React, { useState, useCallback, useEffect, memo } from 'react';
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
  ArrowLeft,
  Loader2,
  Layers,
  AlertCircle,
  Image as ImageLucide,
  Settings,
  Eye,
  CheckCircle2,
  Clock,
  Users,
  Bell,
  Hash,
  BarChart3,
  MoreVertical,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ProgressIndicator from '@/components/ui/progress-indicator';
import { 
  useForms, 
  FormType, 
  FormStatus,
  FieldType,
  FORM_TYPE_LABELS,
  FORM_STATUS_LABELS,
  FIELD_TYPE_LABELS,
  Form,
} from '@/lib/hooks/useForms';
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';
import { FieldTypeSelector } from '@/components/(app)/forms/FieldTypeSelector';
import { type FormFieldInput } from '@/components/(app)/forms/FieldEditor';
import { FieldEditorDialog } from '@/components/(app)/forms/FieldEditorDialog';
import { StepEditor, type FormStepInput } from '@/components/(app)/forms/StepEditor';
import FormBannersUpload, { type BannerDisplayMode } from '@/components/(app)/forms/FormBannersUpload';

// ============================================
// Constants
// ============================================

const TOTAL_STEPS = 4;

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
        {/* Drag Handle */}
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

        {/* Actions */}
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

// ==================== MAIN COMPONENT ====================

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  
  const { getFormById, updateForm, isLoading: hookLoading } = useForms();
  
  // Loading state
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [originalForm, setOriginalForm] = useState<Form | null>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'preparing' | 'submitting' | 'redirecting'>('idle');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [formType, setFormType] = useState<FormType>(FormType.SURVEY);
  const [status, setStatus] = useState<FormStatus>(FormStatus.DRAFT);
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
  const [opensAt, setOpensAt] = useState<string>('');
  const [closesAt, setClosesAt] = useState<string>('');
  const [maxSubmissions, setMaxSubmissions] = useState<number | undefined>(undefined);
  
  // Banners state (cover images)
  const [banners, setBanners] = useState<(File | string)[]>([]);
  const [bannerDisplayMode, setBannerDisplayMode] = useState<BannerDisplayMode>('single');

  // Load form data
  useEffect(() => {
    const loadForm = async () => {
      if (!formId) return;
      
      setIsPageLoading(true);
      setLoadError(null);
      
      try {
        const data = await getFormById(formId);
        if (data) {
          setOriginalForm(data);
          
          // Populate form fields
          setTitle(data.title);
          setSlug(data.slug);
          setDescription(data.description || '');
          setFormType(data.type);
          setStatus(data.status);
          
          // Settings
          setAllowMultipleSubmissions(data.allowMultipleSubmissions);
          setRequiresAuthentication(data.requiresAuthentication);
          setShowProgressBar(data.showProgressBar);
          setShowQuestionNumbers(data.showQuestionNumbers);
          setNotifyOnSubmission(data.notifyOnSubmission);
          setNotificationEmail(data.notificationEmail || '');
          setMaxSubmissions(data.maxSubmissions || data.submissionLimit);
          
          // Time restrictions
          if (data.opensAt) {
            setOpensAt(new Date(data.opensAt).toISOString().slice(0, 16));
          }
          if (data.closesAt) {
            setClosesAt(new Date(data.closesAt).toISOString().slice(0, 16));
          }
          
          // Check if form has steps (multi-step form)
          if (data.steps && data.steps.length > 0) {
            setIsMultiStep(true);
            const mappedSteps: FormStepInput[] = data.steps.map((step: any) => ({
              id: step.id,
              title: step.title,
              description: step.description,
              order: step.order,
              fields: step.fields?.map((f: any) => ({
                id: f.id,
                label: f.label,
                description: f.description,
                type: f.type as FieldType,
                order: f.order,
                required: f.required,
                placeholder: f.placeholder,
                options: f.options as string[] | undefined,
                minValue: f.minValue,
                maxValue: f.maxValue,
              })) || [],
            }));
            setFormSteps(mappedSteps);
            // Also set fields for backwards compatibility
            const allFields: FormFieldInput[] = data.steps.flatMap((step: any) =>
              step.fields?.map((f: any) => ({
                id: f.id,
                label: f.label,
                description: f.description,
                type: f.type as FieldType,
                order: f.order,
                required: f.required,
                placeholder: f.placeholder,
                options: f.options as string[] | undefined,
                minValue: f.minValue,
                maxValue: f.maxValue,
              })) || []
            );
            setFields(allFields);
          } else if (data.fields && data.fields.length > 0) {
            // Single-step form with direct fields
            setIsMultiStep(false);
            const mappedFields: FormFieldInput[] = data.fields.map((f: any) => ({
              id: f.id,
              label: f.label,
              description: f.description,
              type: f.type as FieldType,
              order: f.order,
              required: f.required,
              placeholder: f.placeholder,
              options: f.options as string[] | undefined,
              minValue: f.minValue,
              maxValue: f.maxValue,
            }));
            setFields(mappedFields);
          }
          
          // Load banners/cover image
          if (data.bannerImages && data.bannerImages.length > 0) {
            setBanners(data.bannerImages);
            setBannerDisplayMode(data.bannerDisplayMode || 'single');
          } else if (data.coverImage) {
            // Fallback to coverImage for backwards compatibility
            setBanners([data.coverImage]);
            setBannerDisplayMode('single');
          }
        } else {
          setLoadError('لم يتم العثور على النموذج');
        }
      } catch (err) {
        setLoadError('حدث خطأ أثناء تحميل النموذج');
        console.error('Error loading form:', err);
      } finally {
        setIsPageLoading(false);
      }
    };

    loadForm();
  }, [formId, getFormById]);

  // Track changes
  useEffect(() => {
    if (!originalForm) return;
    
    const hasModifications = 
      title !== originalForm.title ||
      description !== (originalForm.description || '') ||
      formType !== originalForm.type ||
      status !== originalForm.status ||
      allowMultipleSubmissions !== originalForm.allowMultipleSubmissions ||
      requiresAuthentication !== originalForm.requiresAuthentication ||
      showProgressBar !== originalForm.showProgressBar ||
      showQuestionNumbers !== originalForm.showQuestionNumbers ||
      notifyOnSubmission !== originalForm.notifyOnSubmission ||
      notificationEmail !== (originalForm.notificationEmail || '') ||
      fields.length !== (originalForm.fields?.length || 0) ||
      banners.length !== (originalForm.bannerImages?.length || (originalForm.coverImage ? 1 : 0));
    
    setHasChanges(hasModifications);
  }, [title, description, formType, status, allowMultipleSubmissions, requiresAuthentication, 
      showProgressBar, showQuestionNumbers, notifyOnSubmission, notificationEmail, fields, banners, originalForm]);

  // Helper to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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

  // Add new field
  const handleAddField = (type: FieldType) => {
    const newField: FormFieldInput = {
      id: `field-${Date.now()}`,
      label: type === FieldType.RECAPTCHA ? 'حماية reCAPTCHA' : '', // عنوان افتراضي لـ reCAPTCHA
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
    if (currentStep === 1) {
      if (!title.trim()) {
        toast.error('الرجاء إدخال عنوان النموذج');
        return false;
      }
      if (!slug || slug.length < 3) {
        toast.error('الرجاء إدخال رابط صالح (3 أحرف على الأقل)');
        return false;
      }
    }
    if (currentStep === 2) {
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
    
    try {
      // Convert banner files to base64 or keep URLs
      let coverImageData: string | undefined | null;
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
      } else if (banners.length === 0) {
        // User removed all banners
        coverImageData = null;
      }

      setSubmitPhase('submitting');

      const formData: any = {
        title,
        description: description || undefined,
        type: formType,
        status,
        allowMultipleSubmissions,
        requiresAuthentication,
        showProgressBar,
        showQuestionNumbers,
        notifyOnSubmission,
        notificationEmail: notifyOnSubmission ? notificationEmail : undefined,
        opensAt: opensAt ? new Date(opensAt).toISOString() : null,
        closesAt: closesAt ? new Date(closesAt).toISOString() : null,
        maxSubmissions: maxSubmissions || null,
        coverImage: coverImageData,
        bannerImages: bannerImagesData.length > 0 ? bannerImagesData : [],
        bannerDisplayMode: bannerDisplayMode,
      };
      
      // Add fields or steps based on form type
      if (isMultiStep) {
        formData.steps = formSteps.map((step, stepIndex) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          order: stepIndex,
          fields: step.fields.map((f: FormFieldInput, fieldIndex: number) => ({
            label: f.label,
            description: f.description,
            type: f.type,
            order: fieldIndex,
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
          type: f.type,
          order: index,
          required: f.required,
          placeholder: f.placeholder,
          options: f.options,
          minValue: f.minValue,
          maxValue: f.maxValue,
        }));
      }
      
      const result = await updateForm(formId, formData);
      
      if (result) {
        toast.success('تم حفظ التغييرات بنجاح! ✨');
        setSubmitPhase('redirecting');
        await new Promise((r) => setTimeout(r, 500));
        router.push('/app/forms');
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في حفظ التغييرات');
    } finally {
      setIsSubmitting(false);
      setSubmitPhase('idle');
    }
  };

  // Loading State
  if (isPageLoading) {
    return (
      <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري تحميل النموذج...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (loadError || !originalForm) {
    return (
      <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {loadError || 'لم يتم العثور على النموذج'}
          </h2>
          <p className="text-muted-foreground mb-6">
            تأكد من صحة الرابط أو عد للنماذج
          </p>
          <Link
            href="/app/forms"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للنماذج</span>
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // Render Steps
  // ============================================

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-sm text-slate-800 dark:text-slate-200"
    >
      {/* Step Header */}
      <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        الخطوة 1 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">المعلومات الأساسية</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        عدّل المعلومات الأساسية للنموذج
      </p>

      <div className="w-full max-w-md px-4 space-y-5">
        {/* Title */}
        <div className="text-right">
          <Label className="font-medium text-gray-800 dark:text-gray-200">
            عنوان النموذج <span className="text-destructive">*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: استبيان رضا العملاء"
            className="mt-2 h-12 rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Description */}
        <div className="text-right">
          <Label className="font-medium text-gray-800 dark:text-gray-200">
            الوصف <span className="text-muted-foreground text-xs">(اختياري)</span>
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر للنموذج..."
            rows={3}
            className="mt-2 rounded-2xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-400 resize-none"
          />
        </div>

        {/* Form Type & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-right">
            <Label className="font-medium text-gray-800 dark:text-gray-200">نوع النموذج</Label>
            <Select value={formType} onValueChange={(v) => setFormType(v as FormType)}>
              <SelectTrigger className="mt-2 h-12 w-full rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-800 text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(FORM_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="rounded-lg text-right">{label as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-right">
            <Label className="font-medium text-gray-800 dark:text-gray-200">حالة النموذج</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as FormStatus)}>
              <SelectTrigger className="mt-2 h-12 w-full rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-800 text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(FORM_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="rounded-lg text-right">{label as string}</SelectItem>
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
            <Switch checked={isMultiStep} onCheckedChange={setIsMultiStep} />
          </div>
        </div>

        {/* Cover Images */}
        <div>
          <Label className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
            <ImageLucide className="w-4 h-4" />
            صور الغلاف (اختياري)
          </Label>
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

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-sm text-slate-800 dark:text-slate-200"
    >
      {/* Step Header */}
      <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        الخطوة 2 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">حقول النموذج</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-4 text-center text-sm">
        راجع الحقول أو عدّلها حسب احتياجاتك
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
              <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">لم تقم بإضافة أي حقول بعد</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">ابدأ بإضافة الحقول لنموذجك</p>
              </div>
            )}

            {/* Field Editor - Desktop uses FieldTypeSelector, Mobile uses FieldEditorDialog */}
            {editingFieldId && (
              <>
                {/* Desktop: FieldTypeSelector */}
                <AnimatePresence>
                  <FieldTypeSelector
                    onSelect={() => {}}
                    onClose={() => setEditingFieldId(null)}
                    editingField={fields.find(f => f.id === editingFieldId) ?? null}
                    onUpdateField={(updates) => editingFieldId && handleUpdateField(editingFieldId, updates)}
                    onSaveField={() => setEditingFieldId(null)}
                    mode="edit"
                  />
                </AnimatePresence>
                {/* Mobile: FieldEditorDialog (auto-hides on desktop) */}
                <FieldEditorDialog
                  field={fields.find(f => f.id === editingFieldId) ?? null}
                  open={editingFieldId !== null}
                  onOpenChange={(open) => !open && setEditingFieldId(null)}
                  onUpdate={(updates) => editingFieldId && handleUpdateField(editingFieldId, updates)}
                  onSave={() => setEditingFieldId(null)}
                />
              </>
            )}

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

  const renderStep3 = () => (
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
        الخطوة 3 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">إعدادات النموذج</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        خصص سلوك النموذج
      </p>

      {/* Settings List */}
      <div className="w-full max-w-md px-4 space-y-3">
        {/* Multiple Submissions */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">السماح بالإرسال المتعدد</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">السماح للمستخدم بإرسال أكثر من رد</p>
            </div>
          </div>
          <div dir="ltr">
            <Switch checked={allowMultipleSubmissions} onCheckedChange={setAllowMultipleSubmissions} />
          </div>
        </div>

        {/* Requires Authentication */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">يتطلب تسجيل الدخول</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">يجب على المستخدم تسجيل الدخول قبل الإرسال</p>
            </div>
          </div>
          <div dir="ltr">
            <Switch checked={requiresAuthentication} onCheckedChange={setRequiresAuthentication} />
          </div>
        </div>

        {/* Show Progress Bar */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">إظهار شريط التقدم</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">عرض نسبة إكمال النموذج</p>
            </div>
          </div>
          <div dir="ltr">
            <Switch checked={showProgressBar} onCheckedChange={setShowProgressBar} />
          </div>
        </div>

        {/* Show Question Numbers */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">ترقيم الأسئلة</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">عرض أرقام الأسئلة في النموذج</p>
            </div>
          </div>
          <div dir="ltr">
            <Switch checked={showQuestionNumbers} onCheckedChange={setShowQuestionNumbers} />
          </div>
        </div>

        {/* Notify on Submission */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">إشعار عند الإرسال</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">استلام بريد إلكتروني عند كل رد جديد</p>
            </div>
          </div>
          <div dir="ltr">
            <Switch checked={notifyOnSubmission} onCheckedChange={setNotifyOnSubmission} />
          </div>
        </div>

        {/* Email Input (if notification enabled) */}
        <AnimatePresence>
          {notifyOnSubmission && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="h-10 border-0 bg-transparent focus-visible:ring-0"
                  dir="ltr"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

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
        الخطوة 4 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">المعاينة والحفظ</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        راجع التغييرات قبل الحفظ
      </p>

      <div className="w-full max-w-md px-4">
        {/* Preview Card */}
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg">
          {/* Cover Image Preview */}
          {banners.length > 0 && (
            <div className="relative h-32 overflow-hidden bg-gray-100 dark:bg-gray-800">
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
          </div>
        </div>

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <Save className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">يوجد تغييرات غير محفوظة</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  // ============================================
  // Main Render
  // ============================================

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4 sm:p-6">
          
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4"
          >
            <Link 
              href="/app/forms" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للنماذج</span>
            </Link>
          </motion.div>

          {/* Edit Form Wizard */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            {/* Form Title */}
            <div className="text-center mb-2">
              <span className="text-xs text-muted-foreground">تعديل:</span>
              <h1 className="text-lg font-bold text-foreground truncate">{originalForm?.title}</h1>
            </div>

            {/* Form Container */}
            <div className="p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
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
                      ? 'جاري حفظ التغييرات...'
                      : submitPhase === 'redirecting'
                        ? 'جاري التحويل...'
                        : 'حفظ التغييرات'
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
                        ? 'جاري حفظ التغييرات...'
                        : 'جاري التحويل...'}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
