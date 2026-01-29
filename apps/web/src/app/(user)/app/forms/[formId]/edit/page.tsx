'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  AlertCircle,
  Image as ImageLucide,
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FieldTypeSelector } from '@/components/(app)/forms/FieldTypeSelector';
import { FieldEditor, type FormFieldInput } from '@/components/(app)/forms/FieldEditor';
import { StepEditor, type FormStepInput } from '@/components/(app)/forms/StepEditor';
import FormBannersUpload, { type BannerDisplayMode } from '@/components/(app)/forms/FormBannersUpload';

// ============================================
// Constants
// ============================================

const TOTAL_STEPS = 4;

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
        router.push(`/app/forms/${formId}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في حفظ التغييرات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editingField = editingFieldId ? fields.find(f => f.id === editingFieldId) : null;

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
      <p className="text-xs bg-indigo-200 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium px-3 py-1 rounded-full">
        الخطوة 1 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-gray-900 dark:text-white">تعديل معلومات النموذج</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        {originalForm?.title}
      </p>

      {/* Form Fields */}
      <div className="w-full max-w-md px-4 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="font-medium text-gray-800 dark:text-gray-200">
            عنوان النموذج <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center mt-2 mb-4 h-11 pr-3 border border-slate-300 dark:border-slate-600 rounded-full focus-within:ring-2 focus-within:ring-indigo-400 transition-all overflow-hidden bg-white dark:bg-gray-800">
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
            className="w-full mt-2 p-3 bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-600 rounded-2xl resize-none outline-none focus:ring-2 focus-within:ring-indigo-400 transition-all text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
          />
        </div>

        {/* Form Type & Status - Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Form Type */}
          <div className="text-right">
            <label className="font-medium text-gray-800 dark:text-gray-200">نوع النموذج</label>
            <Select value={formType} onValueChange={(v) => setFormType(v as FormType)}>
              <SelectTrigger className="mt-2 h-12 w-full rounded-full border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-800 text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(FORM_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="rounded-lg text-right">{label as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Status */}
          <div className="text-right">
            <label className="font-medium text-gray-800 dark:text-gray-200">حالة النموذج</label>
            <Select value={status} onValueChange={(v) => setStatus(v as FormStatus)}>
              <SelectTrigger className="mt-2 h-12 w-full rounded-full border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-800 text-right">
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
        <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
      <p className="text-xs bg-emerald-200 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-medium px-3 py-1 rounded-full">
        الخطوة 2 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-gray-900 dark:text-white">حقول النموذج</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        أضف الحقول التي تريد جمع بياناتها
      </p>

      <div className="w-full max-w-md px-4 space-y-4">
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
            >
              {fields.map((field) => (
                <Reorder.Item
                  key={field.id}
                  value={field}
                  className={cn(
                    "flex items-center gap-3 p-4 bg-white dark:bg-gray-800/50 rounded-xl border transition-all cursor-grab active:cursor-grabbing",
                    editingFieldId === field.id 
                      ? 'border-violet-400 bg-violet-50/50 dark:bg-violet-900/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{field.label}</span>
                      {field.required && <span className="text-xs text-red-500">*</span>}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {FIELD_TYPE_LABELS[field.type as FieldType]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingFieldId(editingFieldId === field.id ? null : field.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateField(field.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(field.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <Plus className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">لم تقم بإضافة أي حقول بعد</p>
            </div>
          )}

          {/* Field Editor */}
          <AnimatePresence>
            {editingField && (
              <FieldEditor
                field={editingField}
                onUpdate={(updates: Partial<FormFieldInput>) => handleUpdateField(editingField.id, updates)}
                onClose={() => setEditingFieldId(null)}
              />
            )}
          </AnimatePresence>

          {/* Add Field Button */}
          <button
            type="button"
            onClick={() => setShowFieldSelector(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة حقل جديد</span>
            <ArrowRight className="w-4 h-4 mt-0.5" />
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
      <p className="text-xs bg-amber-200 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 font-medium px-3 py-1 rounded-full">
        الخطوة 3 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-gray-900 dark:text-white">إعدادات النموذج</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        خصص سلوك النموذج
      </p>

      {/* Settings List */}
      <div className="w-full max-w-md px-4 space-y-3">
        {/* Multiple Submissions */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-slate-300 dark:border-slate-600 rounded-2xl">
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">السماح بالإرسال المتعدد</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">السماح للمستخدم بإرسال أكثر من رد</p>
          </div>
          <div dir="ltr">
            <Switch checked={allowMultipleSubmissions} onCheckedChange={setAllowMultipleSubmissions} />
          </div>
        </div>

        {/* Requires Authentication */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-slate-300 dark:border-slate-600 rounded-2xl">
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">يتطلب تسجيل الدخول</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">يجب على المستخدم تسجيل الدخول للإرسال</p>
          </div>
          <div dir="ltr">
            <Switch checked={requiresAuthentication} onCheckedChange={setRequiresAuthentication} />
          </div>
        </div>

        {/* Show Progress Bar */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-slate-300 dark:border-slate-600 rounded-2xl">
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">إظهار شريط التقدم</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">عرض نسبة الإكمال للمستخدم</p>
          </div>
          <div dir="ltr">
            <Switch checked={showProgressBar} onCheckedChange={setShowProgressBar} />
          </div>
        </div>

        {/* Show Question Numbers */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-slate-300 dark:border-slate-600 rounded-2xl">
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
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-slate-300 dark:border-slate-600 rounded-2xl">
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
              <div className="flex items-center h-11 pr-3 border border-slate-300 dark:border-slate-600 rounded-full focus-within:ring-2 focus-within:ring-indigo-400 transition-all overflow-hidden bg-white dark:bg-gray-800">
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
      <p className="text-xs bg-blue-200 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium px-3 py-1 rounded-full">
        الخطوة 4 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-gray-900 dark:text-white">معاينة التغييرات</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        راجع التغييرات قبل الحفظ
      </p>

      {/* Preview Card */}
      <div className="w-full max-w-md px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-300 dark:border-slate-600 overflow-hidden shadow-sm">
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
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
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
                <span className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
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
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
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

          {/* Changes indicator */}
          {hasChanges && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-400 text-center font-medium">
                يوجد تغييرات غير محفوظة
              </p>
            </div>
          )}
        </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 mt-5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white py-3 rounded-full transition font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <span>حفظ التغييرات</span>
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
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4 sm:p-6 space-y-5">
          
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              href={`/app/forms/${formId}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للنموذج</span>
            </Link>
          </motion.div>

          {/* Edit Form Wizard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
              {/* Form Container */}
              <div className="p-8 min-h-[520px]">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
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
                  finishLabel={isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                  disabled={isSubmitting}
                />
              </div>
            </form>
          </motion.div>

          {/* Bottom Blur Gradient Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </div>
  );
}
