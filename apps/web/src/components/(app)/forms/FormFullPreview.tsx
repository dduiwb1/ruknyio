'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Mail,
  Phone,
  Hash,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  CheckSquare,
  Circle,
  Upload,
  Star,
  Image as ImageIcon,
  Type,
  AlignLeft,
  Link2,
  Calculator,
  EyeOff,
  Split,
  Grid3X3,
  PenTool,
  Send,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Monitor,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldType } from '@/lib/hooks/useForms';
import { type FormFieldInput } from './FieldEditor';
import { type FormStepInput } from './StepEditor';
import { type FormTheme, DEFAULT_THEME } from './FormThemeCustomizer';

// ============================================
// Types
// ============================================

export interface FormPreviewData {
  title: string;
  description?: string;
  fields: FormFieldInput[];
  isMultiStep: boolean;
  steps: FormStepInput[];
  theme: FormTheme;
  bannerUrl?: string;
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
}

interface FormFullPreviewProps {
  data: FormPreviewData;
  onClose?: () => void;
  formUrl?: string | null;
}

// ============================================
// Theme Styles Helper
// ============================================

const getThemeStyles = (theme: FormTheme): React.CSSProperties => {
  const fontFamilyMap: Record<string, string> = {
    default: 'inherit',
    modern: '"IBM Plex Sans Arabic", "Rubik", sans-serif',
    classic: '"Noto Naskh Arabic", "Traditional Arabic", serif',
    playful: '"Comic Sans MS", "Changa", sans-serif',
  };

  const fontSizeMap: Record<string, string> = {
    small: '14px',
    medium: '16px',
    large: '18px',
  };

  const borderRadiusMap: Record<string, string> = {
    none: '0px',
    small: '8px',
    medium: '16px',
    large: '24px',
    full: '9999px',
  };

  return {
    '--form-primary': theme.primaryColor,
    '--form-bg': theme.backgroundColor,
    '--form-text': theme.textColor,
    '--form-border': theme.borderColor,
    '--form-accent': theme.accentColor,
    '--form-font': fontFamilyMap[theme.fontFamily] || 'inherit',
    '--form-font-size': fontSizeMap[theme.fontSize] || '16px',
    '--form-radius': borderRadiusMap[theme.borderRadius] || '16px',
    fontFamily: fontFamilyMap[theme.fontFamily] || 'inherit',
    fontSize: fontSizeMap[theme.fontSize] || '16px',
  } as React.CSSProperties;
};

// ============================================
// Field Icon Helper
// ============================================

const getFieldIcon = (type: FieldType) => {
  const icons: Partial<Record<FieldType, typeof FileText>> = {
    [FieldType.TEXT]: Type,
    [FieldType.TEXTAREA]: AlignLeft,
    [FieldType.EMAIL]: Mail,
    [FieldType.PHONE]: Phone,
    [FieldType.NUMBER]: Hash,
    [FieldType.DATE]: Calendar,
    [FieldType.TIME]: Clock,
    [FieldType.DATETIME]: Calendar,
    [FieldType.SELECT]: ChevronDown,
    [FieldType.MULTISELECT]: ChevronDown,
    [FieldType.RADIO]: Circle,
    [FieldType.CHECKBOX]: CheckSquare,
    [FieldType.TOGGLE]: ToggleLeft,
    [FieldType.FILE]: Upload,
    [FieldType.RATING]: Star,
    [FieldType.SCALE]: Star,
    [FieldType.IMAGE]: ImageIcon,
    [FieldType.URL]: Link2,
    [FieldType.CALCULATED]: Calculator,
    [FieldType.HIDDEN]: EyeOff,
    [FieldType.CONDITIONAL_LOGIC]: Split,
    [FieldType.MATRIX]: Grid3X3,
    [FieldType.SIGNATURE]: PenTool,
    [FieldType.RECAPTCHA]: FileText,
    [FieldType.HEADING]: Type,
    [FieldType.PARAGRAPH]: AlignLeft,
    [FieldType.DIVIDER]: FileText,
    [FieldType.TITLE]: Type,
    [FieldType.LABEL]: Type,
    [FieldType.VIDEO]: FileText,
    [FieldType.AUDIO]: FileText,
    [FieldType.EMBED]: Link2,
    [FieldType.RANKING]: Star,
  };
  const Icon = icons[type] || FileText;
  return <Icon className="w-4 h-4" />;
};

// ============================================
// Main Component
// ============================================

export function FormFullPreview({ data, onClose, formUrl }: FormFullPreviewProps) {
  const {
    title,
    description,
    fields,
    isMultiStep,
    steps,
    theme,
    bannerUrl,
    showProgressBar,
    showQuestionNumbers,
  } = data;

  const themeStyles = useMemo(() => getThemeStyles(theme), [theme]);
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [expandedSelect, setExpandedSelect] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Copy form URL to clipboard
  const handleCopyUrl = async () => {
    if (!formUrl) return;
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Get current fields
  const displayFields = useMemo(() => {
    if (isMultiStep && steps.length > 0) {
      return steps[currentStep]?.fields || [];
    }
    return fields;
  }, [isMultiStep, steps, fields, currentStep]);

  // Field style based on theme
  const fieldStyleClasses = {
    outlined: 'border bg-transparent',
    filled: 'border-0 bg-gray-100 dark:bg-gray-800',
    underlined: 'border-0 border-b-2 rounded-none bg-transparent',
  };

  // Handle field value change
  const handleValueChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  // Render individual field
  const renderField = (field: FormFieldInput, index: number) => {
    const value = formValues[field.id];
    
    const baseInputClass = cn(
      'w-full px-4 py-3 text-base transition-all outline-none focus:ring-2 focus:ring-offset-0',
      fieldStyleClasses[theme.fieldStyle] || fieldStyleClasses.outlined,
      theme.fieldStyle !== 'underlined' && 'rounded-xl'
    );

    const inputStyle: React.CSSProperties = {
      borderColor: theme.borderColor,
      backgroundColor: theme.fieldStyle === 'filled' ? `${theme.borderColor}20` : 'transparent',
      borderRadius: theme.fieldStyle !== 'underlined' ? `var(--form-radius, 16px)` : undefined,
      color: theme.textColor,
    };

    const focusRingColor = `${theme.primaryColor}40`;

    return (
      <motion.div 
        key={field.id} 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        {/* Label */}
        <label 
          className="text-sm font-medium flex items-center gap-2"
          style={{ color: theme.textColor }}
        >
          {showQuestionNumbers && (
            <span 
              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
            >
              {index + 1}
            </span>
          )}
          <span className="flex items-center gap-2">
            <span 
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${theme.primaryColor}10`, color: theme.primaryColor }}
            >
              {getFieldIcon(field.type)}
            </span>
            {field.label}
          </span>
          {field.required && <span style={{ color: theme.accentColor }}>*</span>}
        </label>

        {/* Field Description */}
        {field.description && (
          <p className="text-xs opacity-60" style={{ color: theme.textColor }}>
            {field.description}
          </p>
        )}

        {/* Field Input */}
        {field.type === FieldType.TEXTAREA ? (
          <textarea
            value={value || ''}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'أدخل النص...'}
            rows={4}
            className={cn(baseInputClass, 'resize-none')}
            style={{ ...inputStyle, '--tw-ring-color': focusRingColor } as React.CSSProperties}
          />
        ) : field.type === FieldType.SELECT ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setExpandedSelect(expandedSelect === field.id ? null : field.id)}
              className={cn(baseInputClass, 'flex items-center justify-between text-right')}
              style={inputStyle}
            >
              <span className={value ? '' : 'opacity-50'}>
                {value || field.placeholder || 'اختر...'}
              </span>
              <ChevronDown className={cn('w-5 h-5 transition-transform', expandedSelect === field.id && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {expandedSelect === field.id && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 rounded-xl border shadow-lg overflow-hidden"
                  style={{ backgroundColor: theme.backgroundColor, borderColor: theme.borderColor }}
                >
                  {((field.options as (string | { label: string; value: string })[]) || []).map((opt, i) => {
                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                    const optValue = typeof opt === 'string' ? opt : opt.value;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          handleValueChange(field.id, optLabel);
                          setExpandedSelect(null);
                        }}
                        className="w-full px-4 py-3 text-right hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                        style={{ color: theme.textColor }}
                      >
                        <span>{optLabel}</span>
                        {value === optLabel && <Check className="w-4 h-4" style={{ color: theme.primaryColor }} />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : field.type === FieldType.RADIO ? (
          <div className="space-y-2">
            {((field.options as (string | { label: string; value: string })[]) || []).map((opt, i) => {
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleValueChange(field.id, optLabel)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all"
                  style={{ 
                    borderColor: value === optLabel ? theme.primaryColor : theme.borderColor,
                    backgroundColor: value === optLabel ? `${theme.primaryColor}10` : 'transparent',
                    color: theme.textColor,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: value === optLabel ? theme.primaryColor : theme.borderColor }}
                  >
                    {value === optLabel && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                    )}
                  </div>
                  <span>{optLabel}</span>
                </button>
              );
            })}
          </div>
        ) : field.type === FieldType.CHECKBOX ? (
          <div className="space-y-2">
            {((field.options as (string | { label: string; value: string })[]) || []).map((opt, i) => {
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const isChecked = Array.isArray(value) && value.includes(optLabel);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const current = Array.isArray(value) ? value : [];
                    const newValue = isChecked
                      ? current.filter((v: string) => v !== optLabel)
                      : [...current, optLabel];
                    handleValueChange(field.id, newValue);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all"
                  style={{ 
                    borderColor: isChecked ? theme.primaryColor : theme.borderColor,
                    backgroundColor: isChecked ? `${theme.primaryColor}10` : 'transparent',
                    color: theme.textColor,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ 
                      borderColor: isChecked ? theme.primaryColor : theme.borderColor,
                      backgroundColor: isChecked ? theme.primaryColor : 'transparent',
                    }}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>{optLabel}</span>
                </button>
              );
            })}
          </div>
        ) : field.type === FieldType.TOGGLE ? (
          <button
            type="button"
            onClick={() => handleValueChange(field.id, !value)}
            className="flex items-center gap-3"
          >
            <div
              className="w-12 h-7 rounded-full relative transition-colors"
              style={{ backgroundColor: value ? theme.primaryColor : `${theme.borderColor}50` }}
            >
              <motion.div
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                animate={{ right: value ? 6 : 'auto', left: value ? 'auto' : 6 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
            <span style={{ color: theme.textColor }}>{field.label}</span>
          </button>
        ) : field.type === FieldType.RATING ? (() => {
          const minR = field.minValue ?? 1;
          const maxR = field.maxValue ?? 5;
          const count = Math.max(1, maxR - minR + 1);
          return (
            <div className="flex items-center gap-2">
              {Array.from({ length: count }, (_, i) => {
                const star = minR + i;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleValueChange(field.id, star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn('w-8 h-8', (value || 0) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')}
                    />
                  </button>
                );
              })}
            </div>
          );
        })() : field.type === FieldType.SCALE ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs opacity-60" style={{ color: theme.textColor }}>
              <span>{field.minValue || 0}</span>
              <span>{field.maxValue || 10}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: (field.maxValue || 10) - (field.minValue || 0) + 1 }, (_, i) => {
                const num = (field.minValue || 0) + i;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleValueChange(field.id, num)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ 
                      backgroundColor: value === num ? theme.primaryColor : `${theme.borderColor}30`,
                      color: value === num ? '#fff' : theme.textColor,
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        ) : field.type === FieldType.FILE || field.type === FieldType.IMAGE ? (
          <div
            className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            style={{ borderColor: theme.borderColor, color: `${theme.textColor}70` }}
          >
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">اضغط لرفع ملف</span>
            <span className="text-xs mt-1 opacity-60">أو اسحب الملف هنا</span>
          </div>
        ) : field.type === FieldType.SIGNATURE ? (
          <div
            className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            style={{ borderColor: theme.borderColor, color: `${theme.textColor}70` }}
          >
            <PenTool className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">اضغط للتوقيع</span>
          </div>
        ) : field.type === FieldType.HEADING ? (
          <h2 className="text-xl font-bold" style={{ color: theme.textColor }}>{field.label}</h2>
        ) : field.type === FieldType.PARAGRAPH ? (
          <p className="text-base opacity-80" style={{ color: theme.textColor }}>{field.label}</p>
        ) : field.type === FieldType.DIVIDER ? (
          <hr style={{ borderColor: theme.borderColor }} />
        ) : (
          <input
            type={
              field.type === FieldType.EMAIL ? 'email' :
              field.type === FieldType.NUMBER ? 'number' :
              field.type === FieldType.PHONE ? 'tel' :
              field.type === FieldType.URL ? 'url' :
              field.type === FieldType.DATE ? 'date' :
              field.type === FieldType.TIME ? 'time' :
              field.type === FieldType.DATETIME ? 'datetime-local' :
              'text'
            }
            value={value || ''}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            placeholder={field.placeholder || 
              (field.type === FieldType.EMAIL ? 'example@email.com' :
               field.type === FieldType.PHONE ? '+964 XXX XXX XXXX' :
               field.type === FieldType.URL ? 'https://...' :
               'أدخل البيانات...')}
            className={baseInputClass}
            style={{ ...inputStyle, '--tw-ring-color': focusRingColor } as React.CSSProperties}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-screen overflow-y-auto" style={{ backgroundColor: `${theme.primaryColor}08` }} dir="rtl">
      {/* Preview Banner - Like Google Forms */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        {/* Top accent line */}
        <div className="h-1 w-full" style={{ backgroundColor: theme.primaryColor }} />
        
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Right: Back + Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose || (() => window.close())}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors shrink-0 hover:opacity-80"
              style={{ color: theme.primaryColor }}
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">رجوع</span>
            </button>
            
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />
            
            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
              هذه معاينة للنموذج
            </span>
          </div>

          {/* Center: URL Bar */}
          <div className="flex-1 max-w-xl">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1.5">
              <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {formUrl ? (
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate font-mono select-all" dir="ltr">
                  {formUrl}
                </span>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500 truncate" dir="ltr">
                  rukny.io/f/...
                </span>
              )}
              {formUrl && (
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="shrink-0 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-auto"
                  title="نسخ الرابط"
                >
                  {copiedUrl ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Left: View Toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={cn(
                'p-2 rounded-lg text-sm transition-all',
                viewMode === 'desktop' 
                  ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800' 
                  : 'text-gray-400 hover:text-gray-600'
              )}
              title="سطح المكتب"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={cn(
                'p-2 rounded-lg text-sm transition-all',
                viewMode === 'mobile' 
                  ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800' 
                  : 'text-gray-400 hover:text-gray-600'
              )}
              title="موبايل"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-6 pb-16 px-4">
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'w-full transition-all duration-300',
                viewMode === 'mobile' ? 'max-w-md' : 'max-w-2xl'
              )}
            >
              {/* Form Container */}
              <div
                className={cn(
                  'rounded-3xl shadow-xl overflow-hidden',
                  viewMode === 'mobile' && 'mx-4'
                )}
                style={{ 
                  backgroundColor: theme.backgroundColor,
                  ...themeStyles 
                }}
              >
                {/* Banner */}
                {bannerUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={bannerUrl} 
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}

                {/* Form Content */}
                <div className="p-6 sm:p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <h1 
                      className="text-2xl sm:text-3xl font-bold mb-2"
                      style={{ color: theme.textColor }}
                    >
                      {title || 'عنوان النموذج'}
                    </h1>
                    {description && (
                      <p 
                        className="text-base opacity-70"
                        style={{ color: theme.textColor }}
                      >
                        {description}
                      </p>
                    )}
                  </div>

                  {/* Multi-step Progress */}
                  {isMultiStep && steps.length > 0 && showProgressBar && (
                    <div className="mb-8">
                      {/* Progress Bar */}
                      <div className="flex gap-2 mb-3">
                        {steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex-1 h-2 rounded-full cursor-pointer transition-colors"
                            style={{ 
                              backgroundColor: idx <= currentStep ? theme.primaryColor : `${theme.borderColor}40`
                            }}
                            onClick={() => setCurrentStep(idx)}
                          />
                        ))}
                      </div>
                      
                      {/* Step Info */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                          disabled={currentStep === 0}
                          className="p-2 rounded-xl disabled:opacity-30 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                          style={{ color: theme.primaryColor }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            {currentStep + 1}
                          </div>
                          <div>
                            <span className="text-sm font-medium" style={{ color: theme.textColor }}>
                              {steps[currentStep]?.title || `الخطوة ${currentStep + 1}`}
                            </span>
                            <p className="text-xs opacity-50" style={{ color: theme.textColor }}>
                              {steps[currentStep]?.description}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                          disabled={currentStep === steps.length - 1}
                          className="p-2 rounded-xl disabled:opacity-30 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                          style={{ color: theme.primaryColor }}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <AnimatePresence mode="wait">
                      {displayFields.length > 0 ? (
                        <motion.div
                          key={`fields-${currentStep}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          {displayFields.map((field, index) => renderField(field, index))}
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-16"
                          style={{ color: `${theme.textColor}40` }}
                        >
                          <div 
                            className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                            style={{ backgroundColor: `${theme.primaryColor}10` }}
                          >
                            <FileText className="w-10 h-10" style={{ color: theme.primaryColor }} />
                          </div>
                          <p className="text-lg font-medium" style={{ color: theme.textColor }}>
                            لا توجد حقول
                          </p>
                          <p className="text-sm mt-1 opacity-60">
                            أضف حقولاً للنموذج
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    {displayFields.length > 0 && (
                      <motion.div 
                        className="pt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-2 py-4 text-white text-base font-semibold rounded-2xl transition-all hover:opacity-90 active:scale-[0.99]"
                          style={{ 
                            backgroundColor: theme.primaryColor,
                            boxShadow: `0 8px 24px ${theme.primaryColor}40`
                          }}
                          onClick={() => {
                            if (isMultiStep && currentStep < steps.length - 1) {
                              setCurrentStep(currentStep + 1);
                            } else {
                              alert('هذه معاينة فقط - لا يمكن إرسال البيانات');
                            }
                          }}
                        >
                          <Send className="w-5 h-5" />
                          {isMultiStep && currentStep < steps.length - 1 ? 'التالي' : 'إرسال'}
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div 
                  className="px-6 py-4 border-t text-center"
                  style={{ borderColor: `${theme.borderColor}30` }}
                >
                  <p className="text-xs opacity-50" style={{ color: theme.textColor }}>
                    هذه معاينة فقط • لم يتم حفظ أي بيانات
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default FormFullPreview;
