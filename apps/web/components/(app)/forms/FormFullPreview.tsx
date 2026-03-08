'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Check, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { type FormFieldInput } from './FieldEditor';
import { type FormStepInput } from './StepEditor';
import { type FormTheme, DEFAULT_THEME } from './FormThemeCustomizer';
import { FieldType, FIELD_TYPE_LABELS } from '@/lib/hooks/useForms';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export interface FormPreviewData {
  title: string;
  description?: string;
  theme?: FormTheme;
  fields: FormFieldInput[];
  steps: FormStepInput[];
  isMultiStep: boolean;
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
  bannerImages?: string[];
  bannerDisplayMode?: string;
  slug?: string;
  userId?: string;
}

interface FormFullPreviewProps {
  data: FormPreviewData;
  onClose: () => void;
  formUrl?: string | null;
}

export function FormFullPreview({ data, onClose, formUrl }: FormFullPreviewProps) {
  const theme = data.theme || DEFAULT_THEME;
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const allFields = data.isMultiStep
    ? data.steps.flatMap((s) => s.fields)
    : data.fields;

  const totalSteps = data.isMultiStep ? data.steps.length : 1;
  const currentStepData = data.isMultiStep ? data.steps[currentStep] : null;
  const currentFields = data.isMultiStep
    ? currentStepData?.fields || []
    : data.fields;

  const progress = data.isMultiStep
    ? Math.round(((currentStep + 1) / totalSteps) * 100)
    : 100;

  const handleCopyUrl = async () => {
    if (!formUrl) return;
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const renderFieldPreview = (field: FormFieldInput, index: number) => {
    const fieldNum = data.showQuestionNumbers ? `${index + 1}. ` : '';

    // Layout/appearance fields
    if (field.type === FieldType.HEADING) {
      return (
        <div key={field.id}>
          <h3 className="text-lg font-bold" style={{ color: theme.textColor }}>
            {field.label}
          </h3>
          {field.description && (
            <p className="text-sm text-gray-500 mt-1">{field.description}</p>
          )}
        </div>
      );
    }

    if (field.type === FieldType.PARAGRAPH) {
      return (
        <div key={field.id}>
          <p className="text-sm" style={{ color: theme.textColor }}>
            {field.label}
          </p>
        </div>
      );
    }

    if (field.type === FieldType.DIVIDER) {
      return <hr key={field.id} className="border-border" />;
    }

    // Interactive fields
    return (
      <div key={field.id} className="space-y-1.5">
        <Label className="text-sm font-medium" style={{ color: theme.textColor }}>
          {fieldNum}{field.label}
          {field.required && <span className="text-red-500 mr-1">*</span>}
        </Label>
        {field.description && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}

        {/* Input preview based on type */}
        {(field.type === FieldType.TEXT || field.type === FieldType.EMAIL ||
          field.type === FieldType.PHONE || field.type === FieldType.URL ||
          field.type === FieldType.NUMBER) && (
          <Input
            type={field.type === FieldType.EMAIL ? 'email' : field.type === FieldType.NUMBER ? 'number' : 'text'}
            placeholder={field.placeholder || 'أدخل إجابتك...'}
            disabled
            className="h-11"
            style={{ borderRadius: theme.borderRadius }}
          />
        )}

        {field.type === FieldType.TEXTAREA && (
          <Textarea
            placeholder={field.placeholder || 'أدخل إجابتك...'}
            disabled
            rows={3}
            className="resize-none"
            style={{ borderRadius: theme.borderRadius }}
          />
        )}

        {(field.type === FieldType.DATE || field.type === FieldType.TIME ||
          field.type === FieldType.DATETIME) && (
          <Input
            type={field.type === FieldType.DATE ? 'date' : field.type === FieldType.TIME ? 'time' : 'datetime-local'}
            disabled
            className="h-11"
            style={{ borderRadius: theme.borderRadius }}
          />
        )}

        {(field.type === FieldType.SELECT || field.type === FieldType.MULTISELECT) && (
          <div
            className="h-11 px-3 flex items-center border border-border text-sm text-muted-foreground bg-muted/30"
            style={{ borderRadius: theme.borderRadius }}
          >
            {field.placeholder || 'اختر...'}
          </div>
        )}

        {(field.type === FieldType.RADIO || field.type === FieldType.CHECKBOX) && (
          <div className="space-y-2">
            {(field.options || []).map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-4 h-4 border-2 border-border',
                    field.type === FieldType.RADIO ? 'rounded-full' : 'rounded'
                  )}
                />
                <span className="text-sm" style={{ color: theme.textColor }}>
                  {option}
                </span>
              </div>
            ))}
          </div>
        )}

        {field.type === FieldType.TOGGLE && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-5 bg-muted rounded-full relative">
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow" />
            </div>
          </div>
        )}

        {field.type === FieldType.RATING && (
          <div className="flex gap-1">
            {Array.from({ length: field.maxValue || 5 }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground">
                ★
              </div>
            ))}
          </div>
        )}

        {field.type === FieldType.FILE && (
          <div
            className="h-20 border-2 border-dashed border-border flex items-center justify-center text-sm text-muted-foreground"
            style={{ borderRadius: theme.borderRadius }}
          >
            اضغط لرفع ملف
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950" dir="rtl">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>معاينة النموذج</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {formUrl && (
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'تم النسخ' : 'نسخ الرابط'}
            </button>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto p-4 py-8">
          {/* Banner */}
          {data.bannerImages && data.bannerImages.length > 0 && (
            <div className="mb-6 rounded-2xl overflow-hidden">
              <img
                src={data.bannerImages[0]}
                alt="Form banner"
                className="w-full h-40 object-cover"
              />
            </div>
          )}

          {/* Form Card */}
          <div
            className="rounded-2xl border border-border overflow-hidden shadow-sm"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            {/* Progress Bar */}
            {data.showProgressBar && data.isMultiStep && (
              <div className="h-1 bg-muted">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: theme.primaryColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            <div className="p-6">
              {/* Title */}
              <h1 className="text-xl font-bold mb-1" style={{ color: theme.textColor }}>
                {data.title}
              </h1>
              {data.description && (
                <p className="text-sm text-gray-500 mb-6">{data.description}</p>
              )}

              {/* Step Title (multi-step) */}
              {data.isMultiStep && currentStepData && (
                <div className="mb-5 pb-3 border-b border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    الخطوة {currentStep + 1} من {totalSteps}
                  </p>
                  <h2 className="font-bold text-base" style={{ color: theme.textColor }}>
                    {currentStepData.title}
                  </h2>
                  {currentStepData.description && (
                    <p className="text-xs text-gray-500 mt-1">{currentStepData.description}</p>
                  )}
                </div>
              )}

              {/* Fields */}
              <div className="space-y-5">
                {currentFields.map((field, index) => renderFieldPreview(field, index))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 gap-3">
                {data.isMultiStep && currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    السابق
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (data.isMultiStep && currentStep < totalSteps - 1) {
                      setCurrentStep((s) => s + 1);
                    }
                  }}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  {data.isMultiStep && currentStep < totalSteps - 1 ? (
                    <>
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </>
                  ) : (
                    'إرسال'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
