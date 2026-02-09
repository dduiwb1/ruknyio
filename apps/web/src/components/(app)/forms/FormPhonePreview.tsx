'use client';

import { useMemo, Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Mail,
  Phone,
  Hash,
  Calendar,
  Clock,
  ChevronDown,
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
  RefreshCw,
  Loader2,
  Send,
  Wifi,
  Battery,
  Signal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldType } from '@/lib/hooks/useForms';
import { type FormFieldInput } from './FieldEditor';
import { type FormStepInput } from './StepEditor';
import { type FormTheme, DEFAULT_THEME } from './FormThemeCustomizer';

// ============================================
// Types
// ============================================

interface FormPhonePreviewProps {
  title: string;
  description?: string;
  fields: FormFieldInput[];
  isMultiStep: boolean;
  steps?: FormStepInput[];
  theme: FormTheme;
  bannerUrl?: string;
  className?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  showLabel?: boolean;
  compact?: boolean;
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
    small: '11px',
    medium: '12px',
    large: '13px',
  };

  const borderRadiusMap: Record<string, string> = {
    none: '0px',
    small: '6px',
    medium: '12px',
    large: '18px',
    full: '9999px',
  };

  return {
    '--form-primary': theme.primaryColor,
    '--form-bg': theme.backgroundColor,
    '--form-text': theme.textColor,
    '--form-border': theme.borderColor,
    '--form-accent': theme.accentColor,
    '--form-font': fontFamilyMap[theme.fontFamily] || 'inherit',
    '--form-font-size': fontSizeMap[theme.fontSize] || '12px',
    '--form-radius': borderRadiusMap[theme.borderRadius] || '12px',
    fontFamily: fontFamilyMap[theme.fontFamily] || 'inherit',
    fontSize: fontSizeMap[theme.fontSize] || '12px',
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
  return <Icon className="w-3 h-3" />;
};

// ============================================
// Main Component
// ============================================

export function FormPhonePreview({
  title,
  description,
  fields,
  isMultiStep,
  steps = [],
  theme,
  bannerUrl,
  className,
  onRefresh,
  isLoading = false,
  showLabel = true,
  compact = false,
}: FormPhonePreviewProps) {
  const themeStyles = useMemo(() => getThemeStyles(theme), [theme]);
  const [currentPreviewStep, setCurrentPreviewStep] = useState(0);

  // Get current step fields for multi-step forms
  const displayFields = useMemo(() => {
    if (isMultiStep && steps.length > 0) {
      return steps[currentPreviewStep]?.fields || [];
    }
    return fields.slice(0, 6); // Show max 6 fields in preview
  }, [isMultiStep, steps, fields, currentPreviewStep]);

  // Field style based on theme
  const fieldStyleClasses = {
    outlined: 'border bg-transparent',
    filled: 'border-0 bg-gray-100',
    underlined: 'border-0 border-b-2 rounded-none bg-transparent',
  };

  // Get current time
  const currentTime = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', hour12: false });
  }, []);

  const renderFieldPreview = (field: FormFieldInput, index: number) => {
    const baseInputClass = cn(
      'w-full h-7 px-2.5 text-[10px] transition-all outline-none',
      fieldStyleClasses[theme.fieldStyle] || fieldStyleClasses.outlined,
      theme.fieldStyle !== 'underlined' && 'rounded-lg'
    );

    const inputStyle: React.CSSProperties = {
      borderColor: theme.borderColor,
      backgroundColor: theme.fieldStyle === 'filled' ? `${theme.borderColor}30` : 'transparent',
      borderRadius: theme.fieldStyle !== 'underlined' ? `var(--form-radius, 8px)` : undefined,
      color: theme.textColor,
    };

    return (
      <div key={field.id} className="space-y-1">
        {/* Label */}
        <label 
          className="text-[10px] font-medium flex items-center gap-1"
          style={{ color: theme.textColor }}
        >
          <span 
            className="w-4 h-4 rounded flex items-center justify-center"
            style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
          >
            {getFieldIcon(field.type)}
          </span>
          {field.label}
          {field.required && <span style={{ color: theme.accentColor }}>*</span>}
        </label>

        {/* Field Input Preview */}
        {field.type === FieldType.TEXTAREA ? (
          <div
            className={cn(baseInputClass, 'h-14 py-1.5')}
            style={inputStyle}
          >
            <span className="text-[9px] opacity-50">{field.placeholder || 'أدخل النص...'}</span>
          </div>
        ) : field.type === FieldType.SELECT ? (
          <div
            className={cn(baseInputClass, 'flex items-center justify-between')}
            style={inputStyle}
          >
            <span className="text-[9px] opacity-50">{field.placeholder || 'اختر...'}</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </div>
        ) : field.type === FieldType.RADIO || field.type === FieldType.CHECKBOX ? (
          <div className="space-y-1">
            {((field.options as (string | { label: string; value: string })[]) || ['خيار 1', 'خيار 2']).slice(0, 3).map((opt, i) => {
              const optLabel = typeof opt === 'string' ? opt : (opt as { label: string }).label;
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 p-1.5 rounded-md border text-[9px]"
                  style={{ borderColor: theme.borderColor, color: theme.textColor }}
                >
                  <div
                    className={cn(
                      'w-3 h-3 border flex-shrink-0',
                      field.type === FieldType.RADIO ? 'rounded-full' : 'rounded'
                    )}
                    style={{ borderColor: theme.primaryColor }}
                  />
                  <span>{optLabel}</span>
                </div>
              );
            })}
          </div>
        ) : field.type === FieldType.TOGGLE ? (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-4 rounded-full relative"
              style={{ backgroundColor: `${theme.primaryColor}30` }}
            >
              <div
                className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full"
                style={{ backgroundColor: theme.primaryColor }}
              />
            </div>
            <span className="text-[9px]" style={{ color: theme.textColor }}>{field.label}</span>
          </div>
        ) : field.type === FieldType.RATING ? (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn('w-4 h-4', star <= 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')}
              />
            ))}
          </div>
        ) : field.type === FieldType.FILE || field.type === FieldType.IMAGE ? (
          <div
            className="flex flex-col items-center justify-center h-12 border-2 border-dashed rounded-lg text-[9px]"
            style={{ borderColor: theme.borderColor, color: `${theme.textColor}80` }}
          >
            <Upload className="w-4 h-4 mb-0.5" />
            <span>اضغط للرفع</span>
          </div>
        ) : field.type === FieldType.SIGNATURE ? (
          <div
            className="flex flex-col items-center justify-center h-12 border-2 border-dashed rounded-lg text-[9px]"
            style={{ borderColor: theme.borderColor, color: `${theme.textColor}80` }}
          >
            <PenTool className="w-4 h-4 mb-0.5" />
            <span>اضغط للتوقيع</span>
          </div>
        ) : (
          <div
            className={baseInputClass}
            style={inputStyle}
          >
            <span className="text-[9px] opacity-50">
              {field.placeholder || 
                (field.type === FieldType.EMAIL ? 'example@email.com' :
                 field.type === FieldType.PHONE ? '+964 XXX XXX XXXX' :
                 field.type === FieldType.NUMBER ? '0' :
                 field.type === FieldType.DATE ? 'YYYY-MM-DD' :
                 field.type === FieldType.TIME ? 'HH:MM' :
                 field.type === FieldType.URL ? 'https://...' :
                 'أدخل البيانات...')}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      className={cn('flex flex-col items-center', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Phone Frame */}
      <div className={cn(
        "relative bg-gradient-to-b from-gray-50 to-white rounded-[2.5rem] p-2",
        "border border-gray-200",
        "transition-all duration-300",
        compact ? "w-[240px] h-[480px]" : "w-[280px] h-[560px]"
      )}>
        {/* Inner Screen */}
        <div 
          className={cn(
            "absolute inset-2 rounded-[2rem] overflow-hidden",
            "bg-white"
          )}
          style={{ backgroundColor: theme.backgroundColor }}
        >
          {/* Screen Content */}
          <div 
            className="h-[calc(100%-2.5rem)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            dir="rtl"
            style={{ ...themeStyles }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-3"
                >
                  <div className="relative">
                    <div 
                      className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: `${theme.primaryColor}30`, borderTopColor: theme.primaryColor }}
                    />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: `${theme.textColor}70` }}>
                    جاري التحميل...
                  </span>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pb-4"
                >
                  {/* Banner */}
                  {bannerUrl && (
                    <motion.div 
                      className="relative mx-3 mt-2 rounded-xl overflow-hidden h-20"
                      initial={{ scale: 0.95
, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <img 
                        src={bannerUrl} 
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>
                  )}

                  {/* Form Header */}
                  <motion.div 
                    className="px-4 py-3"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <h1 
                      className={cn("font-bold mb-1 line-clamp-2", compact ? "text-xs" : "text-sm")}
                      style={{ color: theme.textColor }}
                    >
                      {title || 'عنوان النموذج'}
                    </h1>
                    {description && (
                      <p 
                        className="text-[10px] line-clamp-2 opacity-60"
                        style={{ color: theme.textColor }}
                      >
                        {description}
                      </p>
                    )}
                  </motion.div>

                  {/* Multi-step Progress */}
                  {isMultiStep && steps.length > 0 && (
                    <motion.div 
                      className="px-3 pb-3"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Progress Bar */}
                      <div className="flex gap-1 mb-2">
                        {steps.map((_, idx) => (
                          <motion.div
                            key={idx}
                            className="flex-1 h-1 rounded-full cursor-pointer"
                            style={{ 
                              backgroundColor: idx <= currentPreviewStep ? theme.primaryColor : `${theme.borderColor}40`
                            }}
                            onClick={() => setCurrentPreviewStep(idx)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          />
                        ))}
                      </div>
                      
                      {/* Step Info */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setCurrentPreviewStep(Math.max(0, currentPreviewStep - 1))}
                          disabled={currentPreviewStep === 0}
                          className="p-1 rounded-full disabled:opacity-30 transition-opacity"
                          style={{ color: theme.primaryColor }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            {currentPreviewStep + 1}
                          </div>
                          <span className="text-[10px] font-medium" style={{ color: theme.textColor }}>
                            {steps[currentPreviewStep]?.title || `الخطوة ${currentPreviewStep + 1}`}
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setCurrentPreviewStep(Math.min(steps.length - 1, currentPreviewStep + 1))}
                          disabled={currentPreviewStep === steps.length - 1}
                          className="p-1 rounded-full disabled:opacity-30 transition-opacity"
                          style={{ color: theme.primaryColor }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Form Fields */}
                  <motion.div 
                    className="mx-3 p-3 rounded-2xl"
                    style={{ 
                      backgroundColor: `${theme.backgroundColor}`,
                      border: `1px solid ${theme.borderColor}30`,
                    }}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <AnimatePresence mode="wait">
                      {displayFields.length > 0 ? (
                        <motion.div
                          key={`fields-${currentPreviewStep}`}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-3"
                        >
                          {displayFields.map((field, index) => (
                            <motion.div
                              key={field.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * index }}
                            >
                              {renderFieldPreview(field, index)}
                            </motion.div>
                          ))}
                          {fields.length > 6 && !isMultiStep && (
                            <div 
                              className="text-center py-2 text-[9px] border-t"
                              style={{ 
                                color: `${theme.textColor}50`,
                                borderColor: `${theme.borderColor}30`
                              }}
                            >
                              +{fields.length - 6} حقول أخرى
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-8"
                          style={{ color: `${theme.textColor}40` }}
                        >
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: `${theme.primaryColor}10` }}
                          >
                            <FileText className="w-6 h-6" style={{ color: theme.primaryColor }} />
                          </div>
                          <p className="text-[11px] font-medium" style={{ color: theme.textColor }}>
                            لا توجد حقول
                          </p>
                          <p className="text-[9px] mt-1 opacity-60">
                            أضف حقولاً لمعاينة النموذج
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    {displayFields.length > 0 && (
                      <motion.div 
                        className="mt-4 pt-3 border-t"
                        style={{ borderColor: `${theme.borderColor}30` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-white text-[10px] font-semibold rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
                          style={{ 
                            backgroundColor: theme.primaryColor,
                            boxShadow: `0 4px 14px ${theme.primaryColor}40`
                          }}
                        >
                          <Send className="w-3 h-3" />
                          {isMultiStep && currentPreviewStep < steps.length - 1 ? 'التالي' : 'إرسال'}
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
      </div>

      {/* Label */}
      {showLabel && (
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {theme.presetId && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              {theme.presetId === 'default' ? 'السمة الافتراضية' :
               theme.presetId === 'ocean' ? 'سمة المحيط' :
               theme.presetId === 'forest' ? 'سمة الغابة' :
               theme.presetId === 'sunset' ? 'سمة الغروب' :
               theme.presetId === 'rose' ? 'سمة وردي' :
               theme.presetId === 'midnight' ? 'سمة منتصف الليل' :
               theme.presetId === 'minimal' ? 'سمة بسيطة' :
               theme.presetId === 'corporate' ? 'سمة رسمية' : 'سمة مخصصة'}
            </p>
          )}
        </motion.div>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <motion.button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="mt-3 flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          تحديث
        </motion.button>
      )}
    </motion.div>
  );
}

export default FormPhonePreview;
