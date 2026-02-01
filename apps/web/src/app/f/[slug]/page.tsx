'use client';

import { useState, useEffect, useMemo, Fragment, ReactNode } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Send,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  Lock,
  Star,
  Upload,
  X,
  Share2,
  QrCode,
  Copy,
  Mail,
  Phone,
  Hash,
  ArrowRight,
  Info,
  User,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import {
  useForms,
  Form,
  FormField,
  FieldType,
  FormStatus,
} from '@/lib/hooks/useForms';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

// Helper functions
const getInitials = (name: string): string => {
  return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
};

const getAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined;
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('users/') || avatar.startsWith('profiles/')) {
    return `${API_BASE_URL}/api/${avatar}`;
  }
  return `${API_BASE_URL}/uploads/avatars/${avatar.split('/').pop()}`;
};

export default function PublicFormPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { getFormBySlug, submitForm } = useForms();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState<'qr' | 'share' | null>(null);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showQrInSheet, setShowQrInSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const infoSheetDragControls = useDragControls();

  // Fetch form data
  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      try {
        const formData = await getFormBySlug(slug);
        if (formData) {
          setForm(formData);
          const initialResponses: Record<string, any> = {};
          formData.fields?.forEach((field) => {
            if (field.defaultValue) {
              initialResponses[field.id] = field.defaultValue;
            } else if (field.type === FieldType.CHECKBOX) {
              initialResponses[field.id] = [];
            } else if (field.type === FieldType.TOGGLE) {
              initialResponses[field.id] = false;
            }
          });
          setResponses(initialResponses);
        } else {
          setError('النموذج غير موجود');
        }
      } catch {
        setError('حدث خطأ أثناء تحميل النموذج');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchForm();
  }, [slug, getFormBySlug]);

  // Get current fields
  const currentFields = useMemo(() => {
    if (!form) return [];
    if (form.isMultiStep && form.steps?.length) {
      return form.steps[currentStep]?.fields || [];
    }
    return form.fields || [];
  }, [form, currentStep]);

  const totalSteps = form?.isMultiStep ? (form.steps?.length || 1) : 1;

  // Progress
  const progress = useMemo(() => {
    if (!form?.fields?.length) return 0;
    const answered = form.fields.filter(f => 
      responses[f.id] !== undefined && responses[f.id] !== '' && responses[f.id] !== null
    );
    return Math.round((answered.length / form.fields.length) * 100);
  }, [form, responses]);

  // Validation
  const validateCurrentFields = (): boolean => {
    const errors: Record<string, string> = {};
    currentFields.forEach((field) => {
      if (field.required) {
        const value = responses[field.id];
        if (value === undefined || value === '' || value === null) {
          errors[field.id] = 'هذا الحقل مطلوب';
        } else if (field.type === FieldType.CHECKBOX && Array.isArray(value) && value.length === 0) {
          errors[field.id] = 'اختر خياراً واحداً على الأقل';
        }
      }
      if (field.type === FieldType.EMAIL && responses[field.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responses[field.id])) {
          errors[field.id] = 'بريد إلكتروني غير صالح';
        }
      }
      if (field.type === FieldType.PHONE && responses[field.id]) {
        if (!/^[\d\s\-+()]+$/.test(responses[field.id])) {
          errors[field.id] = 'رقم هاتف غير صالح';
        }
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentFields() && currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentFields()) return;
    setIsSubmitting(true);
    try {
      const result = await submitForm(slug, responses);
      if (result) {
        setIsSubmitted(true);
      } else {
        setError('فشل في إرسال النموذج');
      }
    } catch {
      setError('حدث خطأ أثناء الإرسال');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Field renderer
  const renderField = (field: FormField, index: number) => {
    const hasError = !!validationErrors[field.id];
    const value = responses[field.id];
    const fieldId = `field-${field.id}`;
    const descId = `${fieldId}-desc`;
    const errorId = `${fieldId}-error`;
    const ariaDescribedBy = [field.description ? descId : null, hasError ? errorId : null].filter(Boolean).join(' ') || undefined;

    const inputClass = cn(
      "w-full min-h-[44px] h-12 px-4 bg-gray-50/50 border rounded-xl transition-all text-sm outline-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300/80 focus-visible:ring-offset-0",
      "dark:bg-gray-800/30 dark:border-gray-600",
      hasError
        ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100 dark:border-red-500/50"
        : "border-gray-200 focus-visible:border-gray-400 dark:border-gray-600"
    );

    // Field label and description
    const fieldLabel = (
      <div className="space-y-1 mb-1.5">
        <Label
          htmlFor={field.type !== FieldType.RADIO && field.type !== FieldType.CHECKBOX && field.type !== FieldType.TOGGLE ? fieldId : undefined}
          className={cn("text-sm font-medium", hasError ? "text-red-600" : "text-gray-700 dark:text-gray-300")}
        >
          {field.label}
          {field.required && <span className="text-red-500 mr-1">*</span>}
        </Label>
        {field.description && (
          <p id={descId} className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {field.description}
          </p>
        )}
      </div>
    );

    // Error message
    const errorMessage = hasError && (
      <p id={errorId} className="text-xs text-red-500 flex items-center gap-1 mt-1.5" role="alert">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {validationErrors[field.id]}
      </p>
    );

    switch (field.type) {
      case FieldType.TEXT:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <input
              id={fieldId}
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || 'أدخل النص...'}
              className={inputClass}
              aria-invalid={hasError}
              aria-required={field.required}
              aria-describedby={ariaDescribedBy}
            />
            {errorMessage}
          </div>
        );

      case FieldType.TEXTAREA:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <textarea
              id={fieldId}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || 'أدخل النص...'}
              rows={4}
              className={cn(inputClass, "h-auto min-h-[100px] max-h-40 py-3 resize-y")}
              aria-invalid={hasError}
              aria-required={field.required}
              aria-describedby={ariaDescribedBy}
            />
            {errorMessage}
          </div>
        );

      case FieldType.EMAIL:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <div className="relative">
              <Mail className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", hasError ? "text-red-400" : "text-gray-400")} aria-hidden />
              <input
                id={fieldId}
                type="email"
                value={value || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder || 'example@email.com'}
                className={cn(inputClass, "pr-11")}
                dir="ltr"
                aria-invalid={hasError}
                aria-required={field.required}
                aria-describedby={ariaDescribedBy}
              />
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.PHONE:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <div className="relative">
              <Phone className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", hasError ? "text-red-400" : "text-gray-400")} aria-hidden />
              <input
                id={fieldId}
                type="tel"
                value={value || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder || '+964 XXX XXX XXXX'}
                className={cn(inputClass, "pr-11")}
                dir="ltr"
                aria-invalid={hasError}
                aria-required={field.required}
                aria-describedby={ariaDescribedBy}
              />
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.NUMBER:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <div className="relative">
              <Hash className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", hasError ? "text-red-400" : "text-gray-400")} aria-hidden />
              <input
                id={fieldId}
                type="number"
                value={value || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder || '0'}
                min={field.minValue}
                max={field.maxValue}
                className={cn(inputClass, "pr-11")}
                dir="ltr"
                aria-invalid={hasError}
                aria-required={field.required}
                aria-describedby={ariaDescribedBy}
              />
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.DATE:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <div className="relative">
              <Calendar className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", hasError ? "text-red-400" : "text-gray-400")} aria-hidden />
              <input
                id={fieldId}
                type="date"
                value={value || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className={cn(inputClass, "pr-11")}
                dir="ltr"
                aria-invalid={hasError}
                aria-required={field.required}
                aria-describedby={ariaDescribedBy}
              />
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.TIME:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <div className="relative">
              <Clock className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", hasError ? "text-red-400" : "text-gray-400")} aria-hidden />
              <input
                id={fieldId}
                type="time"
                value={value || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className={cn(inputClass, "pr-11")}
                dir="ltr"
                aria-invalid={hasError}
                aria-required={field.required}
                aria-describedby={ariaDescribedBy}
              />
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.DATETIME:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <input
              id={fieldId}
              type="datetime-local"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={inputClass}
              dir="ltr"
              aria-invalid={hasError}
              aria-required={field.required}
              aria-describedby={ariaDescribedBy}
            />
            {errorMessage}
          </div>
        );

      case FieldType.SELECT:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <Select value={value || ''} onValueChange={(v) => handleFieldChange(field.id, v)}>
              <SelectTrigger
                id={fieldId}
                className={cn(inputClass, "h-12")}
                aria-invalid={hasError}
                aria-required={field.required}
                aria-describedby={ariaDescribedBy}
              >
                <SelectValue placeholder={field.placeholder || 'اختر...'} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((opt, i) => {
                  const optValue = typeof opt === 'string' ? opt : opt.value;
                  const optLabel = typeof opt === 'string' ? opt : opt.label;
                  return (
                    <SelectItem key={i} value={optValue}>{optLabel}</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errorMessage}
          </div>
        );

      case FieldType.RADIO:
        return (
          <div className="space-y-1" role="group" aria-labelledby={`${fieldId}-label`} aria-describedby={ariaDescribedBy} aria-invalid={hasError} aria-required={field.required}>
            <div id={`${fieldId}-label`}>{fieldLabel}</div>
            <div className="space-y-2 mt-1">
              {(field.options || []).map((opt, i) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = value === optValue;
                const optId = `${fieldId}-opt-${i}`;
                return (
                  <label
                    key={i}
                    htmlFor={optId}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all min-h-[44px]",
                      "dark:border-gray-600 dark:hover:border-gray-500",
                      isSelected ? "border-gray-900 bg-gray-100 ring-1 ring-gray-900/10 dark:bg-gray-800/50 dark:border-gray-500" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    )}
                  >
                    <input
                      id={optId}
                      type="radio"
                      name={fieldId}
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => handleFieldChange(field.id, optValue)}
                      aria-describedby={ariaDescribedBy}
                    />
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      isSelected ? "border-gray-900 bg-gray-900 dark:bg-gray-100 dark:border-gray-100" : "border-gray-300 dark:border-gray-500"
                    )}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-900" />}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{optLabel}</span>
                  </label>
                );
              })}
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.CHECKBOX:
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-1" role="group" aria-labelledby={`${fieldId}-label`} aria-describedby={ariaDescribedBy} aria-invalid={hasError} aria-required={field.required}>
            <div id={`${fieldId}-label`}>{fieldLabel}</div>
            <div className="space-y-2 mt-1">
              {(field.options || []).map((opt, i) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = selectedValues.includes(optValue);
                const optId = `${fieldId}-opt-${i}`;
                return (
                  <label
                    key={i}
                    htmlFor={optId}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all min-h-[44px]",
                      "dark:border-gray-600 dark:hover:border-gray-500",
                      isSelected ? "border-gray-900 bg-gray-100 ring-1 ring-gray-900/10 dark:bg-gray-800/50 dark:border-gray-500" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    )}
                  >
                    <input
                      id={optId}
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFieldChange(field.id, [...selectedValues, optValue]);
                        } else {
                          handleFieldChange(field.id, selectedValues.filter((v: string) => v !== optValue));
                        }
                      }}
                    />
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0",
                      isSelected ? "border-gray-900 bg-gray-900 dark:bg-gray-100 dark:border-gray-100" : "border-gray-300 dark:border-gray-500"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white dark:text-gray-900" />}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{optLabel}</span>
                  </label>
                );
              })}
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.TOGGLE:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <div
              className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border min-h-[44px] transition-colors",
                "dark:border-gray-600",
                value ? "border-gray-900 bg-gray-100 dark:bg-gray-800/50 dark:border-gray-500" : "border-gray-200 hover:bg-gray-50/50"
              )}
              role="switch"
              aria-checked={!!value}
              aria-invalid={hasError}
              aria-describedby={ariaDescribedBy}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value ? 'نعم' : 'لا'}</span>
              <Switch
                checked={value || false}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                aria-label={field.label}
              />
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.RATING:
        const maxRating = field.maxValue || 5;
        const currentRating = value || 0;
        return (
          <div className="space-y-1">
            {fieldLabel}
            <div
              className="flex items-center gap-1 mt-1"
              role="group"
              aria-label={field.label}
              aria-describedby={ariaDescribedBy}
            >
              {Array.from({ length: maxRating }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleFieldChange(field.id, i + 1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={`${i + 1} من ${maxRating}`}
                  aria-pressed={i + 1 === currentRating}
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      i < currentRating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-600"
                    )}
                  />
                </button>
              ))}
              {currentRating > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{currentRating}/{maxRating}</span>
              )}
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.SCALE:
        const min = field.minValue || 0;
        const max = field.maxValue || 10;
        return (
          <div className="space-y-1">
            {fieldLabel}
            <div className="space-y-2 mt-1" role="group" aria-label={field.label} aria-describedby={ariaDescribedBy}>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{field.minLabel || min}</span>
                <span>{field.maxLabel || max}</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: max - min + 1 }).map((_, i) => {
                  const num = min + i;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleFieldChange(field.id, num)}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                        "dark:border dark:border-transparent",
                        value === num ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                      )}
                      aria-pressed={value === num}
                      aria-label={String(num)}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.FILE:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <div
              className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-gray-300 dark:hover:border-gray-500 transition-colors min-h-[120px] flex flex-col items-center justify-center"
              role="button"
              tabIndex={0}
              aria-label="رفع الملفات"
              aria-describedby={ariaDescribedBy}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLElement).click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" aria-hidden />
              <p className="text-sm text-gray-500 dark:text-gray-400">اضغط لرفع الملفات</p>
            </div>
            {errorMessage}
          </div>
        );

      case FieldType.SIGNATURE:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center min-h-[100px] flex items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">التوقيع غير متاح حالياً</p>
            </div>
            {errorMessage}
          </div>
        );

      default:
        return (
          <div className="space-y-1">
            {fieldLabel}
            <input
              id={fieldId}
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || 'أدخل البيانات...'}
              className={inputClass}
              aria-invalid={hasError}
              aria-required={field.required}
              aria-describedby={ariaDescribedBy}
            />
            {errorMessage}
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">النموذج غير موجود</h1>
          <p className="text-sm text-gray-500 mb-4">{error || 'لم نتمكن من العثور على هذا النموذج'}</p>
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  // Closed state
  if (form.status !== FormStatus.PUBLISHED) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">النموذج مغلق</h1>
          <p className="text-sm text-gray-500 mb-4">هذا النموذج لا يقبل إجابات جديدة</p>
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">تم الإرسال بنجاح!</h1>
          <p className="text-sm text-gray-500 mb-6">شكراً لمشاركتك في "{form.title}"</p>
          {form.autoResponseMessage && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-right mb-6">
              <p className="text-sm text-gray-600">{form.autoResponseMessage}</p>
            </div>
          )}
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </a>
        </motion.div>
      </div>
    );
  }

  const formUrl = typeof window !== 'undefined' ? window.location.href : '';
  const ownerName = form.user?.profile?.name || form.user?.email?.split('@')[0] || 'مستخدم';

  return (
    <div className="min-h-screen bg-[#ffffff]" dir="rtl">
      {/* Simple Header + بطاقة المعلومات تنبثق من هنا */}
      <header className="sticky top-2 z-40 mx-4 sm:mx-auto max-w-2xl relative">
        <div className="bg-white/90 backdrop-blur-md rounded-4xl border border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
          {/* Form Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 truncate">ركني</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setShowInfoSheet(!showInfoSheet)}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-xl transition-colors",
                showInfoSheet ? "bg-teal-100 text-teal-700" : "hover:bg-gray-100 text-gray-600"
              )}
              aria-label="معلومات"
              aria-expanded={showInfoSheet}
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowModal('share')}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="مشاركة"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setShowModal('qr')}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="QR Code"
            >
              <QrCode className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* بطاقة المعلومات — نفس التصميم المرجعي: إطار أبيض، محتوى أخضر غامق، خلفية مُموّهة */}
        <AnimatePresence onExitComplete={() => setShowQrInSheet(false)}>
          {showInfoSheet && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowInfoSheet(false)}
                aria-hidden
              />
              <motion.div
                drag="y"
                dragControls={infoSheetDragControls}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.25 }}
                dragMomentum={false}
                onDragEnd={(_, { offset, velocity }) => {
                  if (offset.y > 50 || velocity.y > 200) setShowInfoSheet(false);
                }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 sm:w-[340px] mt-2 z-50 rounded-4xl overflow-hidden bg-white shadow-xl border border-gray-200/90"
              >
                {/* شريط علوي: زر رجوع دائري أبيض + حبة خضراء (مثل المرجع) */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                  <button
                    onClick={() => setShowInfoSheet(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors flex-shrink-0 shadow-sm"
                    aria-label="إغلاق"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-1.5 rounded-full bg-green-800 text-white text-sm font-medium">
                    معلومات النموذج
                  </span>
                </div>

                {/* صورة النموذج — منفصلة عن المعلومات */}
                {form.bannerImages?.[0] && (
                  <div className="mx-4 mb-3 rounded-4xl overflow-hidden aspect-video bg-gray-100">
                    <img
                      src={form.bannerImages[0]}
                      alt={form.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* المحتوى الرئيسي — خلفية خضراء غامقة ونص أبيض (مثل المرجع) */}
                <div className="mx-4 mb-4 rounded-4xl overflow-hidden bg-green-800 border border-green-700/50">
                  <div className="p-4 space-y-4">
                    {form.description && (
                      <p className="text-white text-base leading-relaxed line-clamp-3">
                        {form.description}
                      </p>
                    )}
                    <p className="text-green-100 text-sm">
                      {form.title} — ركني
                    </p>

                    {/* اسم المنشئ + توثيق + زر الملف الشخصي */}
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-10 h-10 rounded-full ring-2 ring-white/30">
                          {form.user?.profile?.avatar && (
                            <AvatarImage src={getAvatarUrl(form.user.profile.avatar)} alt={ownerName} />
                          )}
                          <AvatarFallback className="bg-green-700 text-white text-sm rounded-full">
                            {getInitials(ownerName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full border-2 border-green-800 flex items-center justify-center" title="موثق">
                          <Check className="w-2.5 h-2.5 text-green-700" strokeWidth={2.5} />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{ownerName}</p>
                        <span className="text-green-200 text-xs">موثق</span>
                      </div>
                      {form.user?.profile?.username && (
                        <Link
                          href={`/${form.user.profile.username}`}
                          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-colors flex-shrink-0"
                          title="عرض الملف الشخصي"
                          aria-label="عرض الملف الشخصي"
                        >
                          <User className="w-4 h-4" />
                        </Link>
                      )}
                    </div>

                    {/* الرابط */}
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-green-100 text-sm truncate hover:text-white transition-colors"
                    >
                      {formUrl}
                    </a>
                  </div>
                </div>

                {/* مقبض سحب في الأسفل */}
                <div
                  className="py-2 flex justify-center cursor-grab active:cursor-grabbing touch-none border-t border-gray-100"
                  onPointerDown={(e) => infoSheetDragControls.start(e)}
                  aria-hidden
                >
                  <div className="w-8 h-1 rounded-full bg-gray-200" />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl  mx-auto px-4 py-6">
        {/* Cover Image */}
        {form.bannerImages?.[0] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-4xl border border-gray-100 overflow-hidden"
          >
            <img 
              src={form.bannerImages[0]} 
              alt={form.title}
              className="w-full h-48 sm:h-56 object-cover"
            />
          </motion.div>
        )}

        {/* Form Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-4xl border border-gray-100 p-5 mb-6"
        >
          {/* Owner */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <Avatar className="w-10 h-10 flex-shrink-0">
              {form.user?.profile?.avatar && (
                <AvatarImage src={getAvatarUrl(form.user.profile.avatar)} alt={ownerName} />
              )}
              <AvatarFallback className="bg-gray-900 text-white text-sm">
                {getInitials(ownerName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{ownerName}</p>
              <p className="text-xs text-gray-500">منشئ النموذج</p>
            </div>
            {form.user?.profile?.username && (
              <Link
                href={`/${form.user.profile.username}`}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
                title="عرض الملف الشخصي"
                aria-label="عرض الملف الشخصي"
              >
                <User className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Title & Description */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{form.title}</h1>
              {form.description && (
                <p className="text-sm text-gray-500 mt-1">{form.description}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Multi-step indicator */}
        {form.isMultiStep && form.steps && form.steps.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex gap-1 mb-2">
              {form.steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex-1 h-1 rounded-full transition-colors",
                    index <= currentStep ? "bg-gray-900" : "bg-gray-200"
                  )}
                />
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                  {currentStep + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{form.steps[currentStep].title}</p>
                  {form.steps[currentStep].description && (
                    <p className="text-xs text-gray-500">{form.steps[currentStep].description}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Fields */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-4xl"
        >
          <div className="p-5 space-y-5">
            {currentFields.map((field, index) => (
              <Fragment key={field.id}>{renderField(field, index)}</Fragment>
            ))}
          </div>

          {/* Actions */}
          <div className="p-5 border-t border-gray-100 flex items-center justify-between gap-3">
            {form.isMultiStep && currentStep > 0 ? (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </button>
            ) : (
              <div />
            )}

            {form.isMultiStep && currentStep < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    إرسال
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">مدعوم من</span>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors hover:underline underline-offset-2"
            >
              ركني
            </a>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
            © {new Date().getFullYear()} Rukny
          </p>
        </footer>
      </main>

      {/* QR Modal */}
      <AnimatePresence>
        {showModal === 'qr' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-xs w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">QR Code</h3>
                <button onClick={() => setShowModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                <QRCodeSVG value={formUrl} size={180} />
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">امسح للوصول للنموذج</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showModal === 'share' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">مشاركة النموذج</h3>
                <button onClick={() => setShowModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Copy Link */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-4">
                <input
                  type="text"
                  value={formUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
                  dir="ltr"
                />
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    copied ? "bg-green-100 text-green-600" : "bg-gray-200 hover:bg-gray-300"
                  )}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-4 gap-3">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(form.title + ' ' + formUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">واتساب</span>
                </a>

                {/* X (Twitter) */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(formUrl)}&text=${encodeURIComponent(form.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">X</span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(formUrl)}&text=${encodeURIComponent(form.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">تيليجرام</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(form.title)}&body=${encodeURIComponent(formUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">بريد</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}