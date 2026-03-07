'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  FileText, Plus, GripVertical, Trash2, Copy, Edit2,
  Loader2, Layers, AlertCircle, Image as ImageLucide,
  Eye, Mail, Hash, BarChart3, Users, Bell, MoreVertical,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
} from '@/lib/hooks/useForms';
import { toast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';
import { FieldTypeSelector } from './FieldTypeSelector';
import { type FormFieldInput } from './FieldEditor';
import { FieldEditorDialog } from './FieldEditorDialog';
import { StepEditor, type FormStepInput } from './StepEditor';
import FormBannersUpload, { type BannerDisplayMode } from './FormBannersUpload';

// ============================================
// Types
// ============================================

export interface FormDraftRestore {
  slug: string;
  currentStep: number;
  title: string;
  description: string;
  formType: FormType;
  isMultiStep: boolean;
  fields: FormFieldInput[];
  formSteps: FormStepInput[];
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
  notifyOnSubmission: boolean;
  notificationEmail: string;
}

interface CreateFormWizardProps {
  initialDraft?: FormDraftRestore;
  initialSlug: string;
}

// ============================================
// Constants
// ============================================

const TOTAL_STEPS = 4;
const FORM_DRAFT_KEY = 'rukny_form_draft';

// ============================================
// Main Component
// ============================================

export function CreateFormWizard({ initialDraft, initialSlug }: CreateFormWizardProps) {
  const router = useRouter();
  const { createForm, isLoading: hookLoading } = useForms();

  const [currentStep, setCurrentStep] = useState(initialDraft?.currentStep || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'preparing' | 'submitting' | 'redirecting'>('idle');

  // Step 1: Basic Info
  const [title, setTitle] = useState(initialDraft?.title || '');
  const [slug] = useState(initialDraft?.slug || initialSlug);
  const [description, setDescription] = useState(initialDraft?.description || '');
  const [formType, setFormType] = useState<FormType>(initialDraft?.formType || FormType.SURVEY);
  const [isMultiStep, setIsMultiStep] = useState(initialDraft?.isMultiStep || false);

  // Step 2: Fields
  const [fields, setFields] = useState<FormFieldInput[]>(initialDraft?.fields || []);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  // Step 2: Steps (multi-step)
  const [formSteps, setFormSteps] = useState<FormStepInput[]>(initialDraft?.formSteps || []);

  // Step 3: Settings
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(initialDraft?.allowMultipleSubmissions || false);
  const [requiresAuthentication, setRequiresAuthentication] = useState(initialDraft?.requiresAuthentication || false);
  const [showProgressBar, setShowProgressBar] = useState(initialDraft?.showProgressBar ?? true);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(initialDraft?.showQuestionNumbers ?? true);
  const [notifyOnSubmission, setNotifyOnSubmission] = useState(initialDraft?.notifyOnSubmission || false);
  const [notificationEmail, setNotificationEmail] = useState(initialDraft?.notificationEmail || '');

  // Banners
  const [banners, setBanners] = useState<(File | string)[]>([]);
  const [bannerDisplayMode, setBannerDisplayMode] = useState<BannerDisplayMode>('single');

  // Save draft to localStorage
  useEffect(() => {
    const draft: FormDraftRestore = {
      slug,
      currentStep,
      title,
      description,
      formType,
      isMultiStep,
      fields,
      formSteps,
      allowMultipleSubmissions,
      requiresAuthentication,
      showProgressBar,
      showQuestionNumbers,
      notifyOnSubmission,
      notificationEmail,
    };
    localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(draft));
  }, [slug, currentStep, title, description, formType, isMultiStep, fields, formSteps, allowMultipleSubmissions, requiresAuthentication, showProgressBar, showQuestionNumbers, notifyOnSubmission, notificationEmail]);

  // Field icon helper
  const getFieldIcon = (type: FieldType) => {
    const icons: Record<string, React.ReactNode> = {
      [FieldType.TEXT]: <FileText className="w-4 h-4" />,
      [FieldType.TEXTAREA]: <FileText className="w-4 h-4" />,
      [FieldType.EMAIL]: <Mail className="w-4 h-4" />,
      [FieldType.NUMBER]: <Hash className="w-4 h-4" />,
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  // ---- Field Operations ----
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
        : undefined,
      minValue: type === FieldType.RATING ? 1 : type === FieldType.SCALE ? 0 : undefined,
      maxValue: type === FieldType.RATING ? 5 : type === FieldType.SCALE ? 10 : undefined,
    };
    setFields(prev => [...prev, newField]);
    setShowFieldSelector(false);
  };

  const handleAddCompleteField = (field: FormFieldInput) => {
    const newField: FormFieldInput = {
      ...field,
      id: `field-${Date.now()}`,
      order: fields.length,
    };
    setFields(prev => [...prev, newField]);
    setShowFieldSelector(false);
  };

  const handleUpdateField = (id: string, updates: Partial<FormFieldInput>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleDeleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (editingFieldId === id) setEditingFieldId(null);
  };

  const handleDuplicateField = (id: string) => {
    const field = fields.find(f => f.id === id);
    if (field) {
      setFields(prev => [...prev, {
        ...field,
        id: `field-${Date.now()}`,
        label: `${field.label} (نسخة)`,
        order: fields.length,
      }]);
    }
  };

  const handleReorderFields = (newOrder: FormFieldInput[]) => {
    setFields(newOrder.map((f, i) => ({ ...f, order: i })));
  };

  // ---- Helpers ----
  const getTotalFieldsCount = () => {
    if (isMultiStep) {
      return formSteps.reduce((acc, step) => acc + step.fields.length, 0);
    }
    return fields.length;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ---- Validation ----
  const validateStep = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        toast.error('الرجاء إدخال عنوان النموذج');
        return false;
      }
    }
    if (currentStep === 2) {
      if (isMultiStep) {
        if (formSteps.length === 0) {
          toast.error('الرجاء إضافة خطوة واحدة على الأقل');
          return false;
        }
        if (getTotalFieldsCount() === 0) {
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

  // ---- Navigation ----
  const handleContinue = () => {
    if (validateStep()) {
      if (currentStep === TOTAL_STEPS) {
        const formElement = document.querySelector('form');
        if (formElement) formElement.requestSubmit();
      } else {
        setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== TOTAL_STEPS) return;

    setIsSubmitting(true);
    setSubmitPhase('preparing');

    try {
      let bannerImagesData: string[] = [];
      let coverImageData: string | undefined;

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

      setSubmitPhase('submitting');

      const formData: any = {
        title,
        slug,
        description: description || undefined,
        type: formType,
        status: FormStatus.DRAFT,
        allowMultipleSubmissions,
        requiresAuthentication,
        showProgressBar,
        showQuestionNumbers,
        notifyOnSubmission,
        notificationEmail: notifyOnSubmission ? notificationEmail : undefined,
        coverImage: coverImageData,
        bannerImages: bannerImagesData.length > 0 ? bannerImagesData : [],
        bannerDisplayMode,
      };

      if (isMultiStep) {
        formData.steps = formSteps.map((step, stepIndex) => ({
          title: step.title,
          description: step.description,
          order: stepIndex,
          fields: step.fields.map((f, fieldIndex) => ({
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

      const result = await createForm(formData);

      if (result) {
        localStorage.removeItem(FORM_DRAFT_KEY);
        toast.success('تم إنشاء النموذج بنجاح! ✨');
        setSubmitPhase('redirecting');
        await new Promise((r) => setTimeout(r, 500));
        router.push('/app/forms');
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في إنشاء النموذج');
    } finally {
      setIsSubmitting(false);
      setSubmitPhase('idle');
    }
  };

  // ============================================
  // Step Renderers
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
      <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        الخطوة 1 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">معلومات النموذج</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        أدخل المعلومات الأساسية للنموذج الجديد
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

        {/* Form Type */}
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

        {/* Multi-step Toggle */}
        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">نموذج متعدد الخطوات</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">تقسيم النموذج إلى عدة مراحل</p>
            </div>
          </div>
          <div dir="ltr" className="flex-shrink-0">
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
      <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        الخطوة 2 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">حقول النموذج</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-4 text-center text-sm">
        أضف الحقول التي تريدها في النموذج
      </p>

      {fields.length > 0 && !isMultiStep && (
        <div className="flex items-center gap-2 mb-4 text-xs">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
            {fields.length} حقول
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500 dark:text-gray-400">اسحب للترتيب</span>
        </div>
      )}

      <div className="w-full max-w-lg px-4 space-y-3">
        {isMultiStep ? (
          <StepEditor steps={formSteps} onStepsChange={setFormSteps} />
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

            {/* Field Editor */}
            {editingFieldId && (
              <>
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
      <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        الخطوة 3 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">إعدادات النموذج</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        خصص سلوك النموذج
      </p>

      <div className="w-full max-w-md px-4 space-y-3">
        {/* Multiple Submissions */}
        <SettingToggle
          icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          title="السماح بالإرسال المتعدد"
          description="السماح للمستخدم بإرسال أكثر من رد"
          checked={allowMultipleSubmissions}
          onCheckedChange={setAllowMultipleSubmissions}
        />

        {/* Requires Authentication */}
        <SettingToggle
          icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          title="يتطلب تسجيل الدخول"
          description="يجب على المستخدم تسجيل الدخول قبل الإرسال"
          checked={requiresAuthentication}
          onCheckedChange={setRequiresAuthentication}
        />

        {/* Show Progress Bar */}
        <SettingToggle
          icon={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          title="إظهار شريط التقدم"
          description="عرض نسبة إكمال النموذج"
          checked={showProgressBar}
          onCheckedChange={setShowProgressBar}
        />

        {/* Show Question Numbers */}
        <SettingToggle
          icon={<Hash className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          title="ترقيم الأسئلة"
          description="عرض أرقام الأسئلة في النموذج"
          checked={showQuestionNumbers}
          onCheckedChange={setShowQuestionNumbers}
        />

        {/* Notify on Submission */}
        <SettingToggle
          icon={<Bell className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400" />}
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          title="إشعار عند الإرسال"
          description="استلام بريد إلكتروني عند كل رد جديد"
          checked={notifyOnSubmission}
          onCheckedChange={setNotifyOnSubmission}
        />

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
      <p className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        الخطوة 4 من 4
      </p>
      <h2 className="text-2xl font-bold py-3 text-center text-foreground">المعاينة والإنشاء</h2>
      <p className="text-gray-500 dark:text-gray-400 pb-6 text-center text-sm">
        راجع النموذج قبل الإنشاء
      </p>

      <div className="w-full max-w-md px-4">
        {/* Preview Card */}
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-5">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{title || 'بدون عنوان'}</h3>
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
                <SettingDot label="إرسال متعدد" active={allowMultipleSubmissions} />
                <SettingDot label="يتطلب تسجيل دخول" active={requiresAuthentication} />
                <SettingDot label="إشعارات البريد" active={notifyOnSubmission} />
                <SettingDot label="شريط التقدم" active={showProgressBar} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ============================================
  // Main Render
  // ============================================

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
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
                ? 'جاري إنشاء النموذج...'
                : submitPhase === 'redirecting'
                  ? 'جاري التحويل...'
                  : 'إنشاء النموذج'
          }
          disabled={isSubmitting}
        />
      </div>

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-card border border-border p-6 shadow-lg max-w-sm mx-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground text-center">
              {submitPhase === 'preparing'
                ? 'جاري تجهيز المحتوى...'
                : submitPhase === 'submitting'
                  ? 'جاري إنشاء النموذج...'
                  : 'جاري التحويل...'}
            </p>
          </div>
        </div>
      )}
    </form>
  );
}

// ============================================
// Helper Components
// ============================================

function SettingToggle({
  icon, iconBg, title, description, checked, onCheckedChange,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className={cn('w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0', iconBg)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
        </div>
      </div>
      <div dir="ltr" className="flex-shrink-0">
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}

function SettingDot({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full', active ? 'bg-green-500' : 'bg-gray-300')} />
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
}

// ============================================
// Draggable Field Item (duplicated from edit page for self-containment)
// ============================================

interface DraggableFieldItemProps {
  field: FormFieldInput;
  index: number;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  getFieldIcon: (type: FieldType) => React.ReactNode;
}

function DraggableFieldItem({ field, index, onEdit, onDuplicate, onDelete, getFieldIcon }: DraggableFieldItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={dragControls}
      layout="position"
      className={cn(
        'group relative bg-card rounded-xl border border-border',
        'shadow-sm hover:shadow-md transition-shadow duration-200'
      )}
      whileDrag={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 50 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 p-3">
        <div
          className="flex flex-col items-center justify-center p-2 -m-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors select-none"
          onPointerDown={(e) => { e.preventDefault(); dragControls.start(e); }}
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-5 h-5 pointer-events-none" />
        </div>
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground">
          {getFieldIcon(field.type as FieldType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground truncate">{field.label || 'بدون عنوان'}</span>
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

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-0.5">
          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(field.id); }} className="p-2 hover:bg-muted rounded-lg transition-colors" title="تعديل">
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(field.id); }} className="p-2 hover:bg-muted rounded-lg transition-colors" title="نسخ">
            <Copy className="w-4 h-4 text-muted-foreground" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(field.id); }} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="حذف">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="p-2 hover:bg-muted rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px] rounded-xl">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(field.id); }} className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer">
                <Edit2 className="w-4 h-4" /> تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(field.id); }} className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer">
                <Copy className="w-4 h-4" /> نسخ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(field.id); }} className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer text-red-600">
                <Trash2 className="w-4 h-4" /> حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Reorder.Item>
  );
}
