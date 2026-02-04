'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Check, Type, AlignLeft, Hash, Mail, Phone, Calendar, List, CircleDot, 
  CheckSquare, Star, Gauge, Upload, Clock, ToggleLeft, Grid3X3, Pencil,
  Link, ListChecks, ArrowUpDown, Heading1, Text, Minus, Bookmark, Tag,
  Image, Video, Volume2, Code, GitBranch, Calculator, EyeOff, Shield,
  FileText, Files, HardDrive, Layers, AlertCircle,
  AlignRight, AlignCenter, AlignJustify, Play, Pause, RotateCcw, ExternalLink,
  Music, Globe, Maximize2, Settings, Eye, Variable, DollarSign, Percent, Hash as HashIcon,
  LinkIcon, Cookie, FileCode
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { FieldType, FIELD_TYPE_LABELS } from '@/lib/hooks/useForms';
import { cn } from '@/lib/utils';
import { FormFieldInput } from './FieldEditor';

// Hook to check if we're on mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

interface FieldEditorDialogProps {
  field: FormFieldInput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<FormFieldInput>) => void;
  onSave: () => void;
}

// Field type placeholders and hints for better UX
const FIELD_TYPE_PLACEHOLDERS: Record<FieldType, { placeholder: string; hint?: string }> = {
  [FieldType.TEXT]: { placeholder: 'مثال: الاسم الكامل', hint: 'حقل لإدخال نص قصير' },
  [FieldType.TEXTAREA]: { placeholder: 'مثال: اكتب ملاحظاتك هنا', hint: 'حقل لإدخال نص طويل' },
  [FieldType.EMAIL]: { placeholder: 'مثال: البريد الإلكتروني', hint: 'سيتم التحقق من صيغة البريد' },
  [FieldType.PHONE]: { placeholder: 'مثال: رقم الهاتف', hint: 'رقم هاتف مع رمز الدولة' },
  [FieldType.NUMBER]: { placeholder: 'مثال: العمر', hint: 'حقل لإدخال أرقام فقط' },
  [FieldType.DATE]: { placeholder: 'مثال: تاريخ الميلاد', hint: 'اختيار تاريخ من التقويم' },
  [FieldType.TIME]: { placeholder: 'مثال: وقت الحضور', hint: 'اختيار وقت محدد' },
  [FieldType.DATETIME]: { placeholder: 'مثال: موعد الاجتماع', hint: 'اختيار تاريخ ووقت معاً' },
  [FieldType.SELECT]: { placeholder: 'مثال: اختر المدينة', hint: 'قائمة منسدلة لاختيار خيار واحد' },
  [FieldType.RADIO]: { placeholder: 'مثال: الجنس', hint: 'اختيار خيار واحد من عدة خيارات' },
  [FieldType.CHECKBOX]: { placeholder: 'مثال: الخدمات المطلوبة', hint: 'اختيار خيارات متعددة' },
  [FieldType.MULTISELECT]: { placeholder: 'مثال: المهارات', hint: 'اختيار عدة خيارات من قائمة' },
  [FieldType.FILE]: { placeholder: 'مثال: السيرة الذاتية', hint: 'رفع ملفات أو صور' },
  [FieldType.RATING]: { placeholder: 'مثال: قيّم تجربتك', hint: 'تقييم بالنجوم' },
  [FieldType.SCALE]: { placeholder: 'مثال: مستوى الرضا', hint: 'مقياس رقمي' },
  [FieldType.TOGGLE]: { placeholder: 'مثال: هل توافق على الشروط والأحكام؟', hint: 'سؤال يُجاب عليه بـ "نعم" أو "لا"' },
  [FieldType.MATRIX]: { placeholder: 'مثال: تقييم الخدمات', hint: 'جدول أسئلة متعددة' },
  [FieldType.SIGNATURE]: { placeholder: 'مثال: التوقيع', hint: 'توقيع يدوي رقمي' },
  [FieldType.RANKING]: { placeholder: 'مثال: رتب الأولويات', hint: 'ترتيب العناصر حسب الأهمية' },
  [FieldType.URL]: { placeholder: 'مثال: رابط الموقع الشخصي', hint: 'رابط موقع ويب' },
  [FieldType.HEADING]: { placeholder: 'مثال: معلومات شخصية', hint: 'عنوان رئيسي للقسم' },
  [FieldType.TITLE]: { placeholder: 'مثال: بيانات التواصل', hint: 'عنوان فرعي' },
  [FieldType.PARAGRAPH]: { placeholder: 'مثال: يرجى ملء جميع الحقول بدقة', hint: 'نص توضيحي للمستخدم' },
  [FieldType.LABEL]: { placeholder: 'مثال: ملاحظة مهمة', hint: 'تسمية أو ملاحظة' },
  [FieldType.DIVIDER]: { placeholder: '', hint: 'خط فاصل بين الأقسام' },
  [FieldType.IMAGE]: { placeholder: 'مثال: صورة توضيحية', hint: 'عرض صورة في النموذج' },
  [FieldType.VIDEO]: { placeholder: 'مثال: فيديو تعريفي', hint: 'تضمين فيديو' },
  [FieldType.AUDIO]: { placeholder: 'مثال: ملف صوتي', hint: 'تضمين ملف صوتي' },
  [FieldType.EMBED]: { placeholder: 'مثال: خريطة الموقع', hint: 'تضمين محتوى خارجي' },
  [FieldType.CONDITIONAL_LOGIC]: { placeholder: 'مثال: أسئلة إضافية', hint: 'إظهار حقول بناءً على شروط' },
  [FieldType.CALCULATED]: { placeholder: 'مثال: المجموع الكلي', hint: 'حساب قيم تلقائياً' },
  [FieldType.HIDDEN]: { placeholder: 'مثال: معرف المستخدم', hint: 'حقل مخفي عن المستخدم' },
  [FieldType.RECAPTCHA]: { placeholder: '', hint: 'حماية من البوتات' },
};

// Icons mapping for field types
const fieldTypeIcons: Record<FieldType, React.ReactNode> = {
  // Input fields
  [FieldType.TEXT]: <Type className="w-4 h-4" />,
  [FieldType.TEXTAREA]: <AlignLeft className="w-4 h-4" />,
  [FieldType.NUMBER]: <Hash className="w-4 h-4" />,
  [FieldType.EMAIL]: <Mail className="w-4 h-4" />,
  [FieldType.PHONE]: <Phone className="w-4 h-4" />,
  [FieldType.URL]: <Link className="w-4 h-4" />,
  [FieldType.DATE]: <Calendar className="w-4 h-4" />,
  [FieldType.TIME]: <Clock className="w-4 h-4" />,
  [FieldType.DATETIME]: <Calendar className="w-4 h-4" />,
  [FieldType.SELECT]: <List className="w-4 h-4" />,
  [FieldType.MULTISELECT]: <ListChecks className="w-4 h-4" />,
  [FieldType.RADIO]: <CircleDot className="w-4 h-4" />,
  [FieldType.CHECKBOX]: <CheckSquare className="w-4 h-4" />,
  [FieldType.RATING]: <Star className="w-4 h-4" />,
  [FieldType.SCALE]: <Gauge className="w-4 h-4" />,
  [FieldType.FILE]: <Upload className="w-4 h-4" />,
  [FieldType.TOGGLE]: <ToggleLeft className="w-4 h-4" />,
  [FieldType.MATRIX]: <Grid3X3 className="w-4 h-4" />,
  [FieldType.SIGNATURE]: <Pencil className="w-4 h-4" />,
  [FieldType.RANKING]: <ArrowUpDown className="w-4 h-4" />,
  // Layout blocks
  [FieldType.HEADING]: <Heading1 className="w-4 h-4" />,
  [FieldType.PARAGRAPH]: <Text className="w-4 h-4" />,
  [FieldType.DIVIDER]: <Minus className="w-4 h-4" />,
  [FieldType.TITLE]: <Bookmark className="w-4 h-4" />,
  [FieldType.LABEL]: <Tag className="w-4 h-4" />,
  // Embed blocks
  [FieldType.IMAGE]: <Image className="w-4 h-4" />,
  [FieldType.VIDEO]: <Video className="w-4 h-4" />,
  [FieldType.AUDIO]: <Volume2 className="w-4 h-4" />,
  [FieldType.EMBED]: <Code className="w-4 h-4" />,
  // Advanced blocks
  [FieldType.CONDITIONAL_LOGIC]: <GitBranch className="w-4 h-4" />,
  [FieldType.CALCULATED]: <Calculator className="w-4 h-4" />,
  [FieldType.HIDDEN]: <EyeOff className="w-4 h-4" />,
  [FieldType.RECAPTCHA]: <Shield className="w-4 h-4" />,
};

export function FieldEditorDialog({ field, open, onOpenChange, onUpdate, onSave }: FieldEditorDialogProps) {
  const isMobile = useIsMobile();
  
  // Only render on mobile devices - desktop uses FieldTypeSelector
  // Return null if: no field, still checking (isMobile === null), or on desktop (!isMobile)
  // IMPORTANT: Also check open to prevent any rendering when dialog should be closed
  if (!field || isMobile === null || !isMobile || !open) return null;

  const hasOptions = field.type === FieldType.SELECT || field.type === FieldType.RADIO || field.type === FieldType.CHECKBOX || field.type === FieldType.MULTISELECT || field.type === FieldType.RANKING;
  const hasScale = field.type === FieldType.RATING || field.type === FieldType.SCALE;
  const isFileType = field.type === FieldType.FILE;
  const isRecaptcha = field.type === FieldType.RECAPTCHA;
  const isToggle = field.type === FieldType.TOGGLE;
  const isLayoutBlock = field.type === FieldType.HEADING || field.type === FieldType.PARAGRAPH || field.type === FieldType.DIVIDER || field.type === FieldType.TITLE || field.type === FieldType.LABEL;
  const isEmbedBlock = field.type === FieldType.IMAGE || field.type === FieldType.VIDEO || field.type === FieldType.AUDIO || field.type === FieldType.EMBED;
  const isImageType = field.type === FieldType.IMAGE;
  const isVideoType = field.type === FieldType.VIDEO;
  const isAudioType = field.type === FieldType.AUDIO;
  const isEmbedType = field.type === FieldType.EMBED;
  const isConditionalLogic = field.type === FieldType.CONDITIONAL_LOGIC;
  const isCalculated = field.type === FieldType.CALCULATED;
  const isHidden = field.type === FieldType.HIDDEN;
  const isAdvancedField = isConditionalLogic || isCalculated || isHidden;
  const hasPlaceholder = field.type === FieldType.TEXT || 
    field.type === FieldType.TEXTAREA || 
    field.type === FieldType.EMAIL || 
    field.type === FieldType.PHONE ||
    field.type === FieldType.NUMBER ||
    field.type === FieldType.URL ||
    isEmbedBlock;

  // Common file type presets
  const fileTypePresets = [
    { label: 'صور', types: ['image/*'] },
    { label: 'مستندات', types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
    { label: 'الكل', types: ['*/*'] },
  ];

  const handleToggleFileType = (types: string[]) => {
    const current = field.allowedFileTypes || [];
    const hasAll = types.every(t => current.includes(t));
    
    if (hasAll) {
      onUpdate({ allowedFileTypes: current.filter(t => !types.includes(t)) });
    } else {
      const newTypes = [...new Set([...current, ...types])];
      onUpdate({ allowedFileTypes: newTypes });
    }
  };

  const handleAddOption = () => {
    const currentOptions = field.options || [];
    onUpdate({ options: [...currentOptions, `خيار ${currentOptions.length + 1}`] });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = (field.options || []).filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] sm:w-full max-w-[420px] max-h-[90vh] sm:max-h-[85vh] p-0 gap-0 rounded-2xl sm:rounded-3xl border border-border shadow-2xl bg-card flex flex-col overflow-hidden" 
        showCloseButton={false}
        aria-labelledby="field-editor-title"
      >
        <VisuallyHidden>
          <DialogTitle>تعديل الحقل</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              {fieldTypeIcons[field.type]}
            </div>
            <div>
              <h3 id="field-editor-title" className="text-sm sm:text-base font-semibold text-foreground">
                تعديل الحقل
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                {FIELD_TYPE_LABELS[field.type]}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-5 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          {/* Label Field - Hide for RECAPTCHA */}
          {!isRecaptcha && (
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5 block">
                {isToggle ? 'السؤال' : 'عنوان الحقل'} <span className="text-destructive">*</span>
              </label>
              {FIELD_TYPE_PLACEHOLDERS[field.type]?.hint && (
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">
                  {FIELD_TYPE_PLACEHOLDERS[field.type].hint}
                </p>
              )}
              <Input
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder={FIELD_TYPE_PLACEHOLDERS[field.type]?.placeholder || 'أدخل عنوان الحقل'}
                className="h-10 sm:h-11 rounded-lg sm:rounded-xl border-border bg-muted/30 focus:bg-background text-sm"
              />
            </div>
          )}

          {/* Description Field - Hide for RECAPTCHA */}
          {!isRecaptcha && (
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5 block">
                وصف الحقل <span className="text-[10px] sm:text-xs text-muted-foreground">(اختياري)</span>
              </label>
              <textarea
                value={field.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="أضف وصفاً توضيحياً للحقل..."
                rows={2}
                className="w-full px-3 py-2 sm:py-2.5 text-sm rounded-lg sm:rounded-xl border border-border bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none resize-none transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Placeholder Field */}
          {hasPlaceholder && !isRecaptcha && (
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5 block">
                نص توضيحي (Placeholder)
              </label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                placeholder="مثال: أدخل اسمك الكامل..."
                className="h-10 sm:h-11 rounded-lg sm:rounded-xl border-border bg-muted/30 focus:bg-background text-sm"
              />
            </div>
          )}

          {/* Options for Select/Radio/Checkbox */}
          {hasOptions && (
            <div className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center gap-2.5 py-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  {field.type === FieldType.RADIO && <CircleDot className="w-4 h-4 text-primary" />}
                  {field.type === FieldType.CHECKBOX && <CheckSquare className="w-4 h-4 text-primary" />}
                  {field.type === FieldType.SELECT && <List className="w-4 h-4 text-primary" />}
                  {field.type === FieldType.MULTISELECT && <ListChecks className="w-4 h-4 text-primary" />}
                  {field.type === FieldType.RANKING && <ArrowUpDown className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {field.type === FieldType.RADIO && 'اختيار واحد'}
                    {field.type === FieldType.CHECKBOX && 'اختيار متعدد'}
                    {field.type === FieldType.SELECT && 'قائمة منسدلة'}
                    {field.type === FieldType.MULTISELECT && 'قائمة متعددة'}
                    {field.type === FieldType.RANKING && 'ترتيب'}
                  </p>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {field.options?.length || 0} خيار
                </span>
              </div>

              {/* Options List */}
              <div className="rounded-xl border border-border overflow-hidden bg-background">
                <div className="p-2 max-h-[200px] overflow-y-auto space-y-1.5">
                  {(field.options || []).map((option, index) => (
                    <div 
                      key={index} 
                      className="group flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/20 rounded-xl transition-all"
                    >
                      <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">{index + 1}</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleUpdateOption(index, e.target.value)}
                        className="flex-1 bg-transparent border-0 p-0 text-sm text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground font-medium min-w-0"
                        placeholder={`أدخل الخيار ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        disabled={(field.options?.length || 0) <= 2}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-border bg-muted/20">
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-primary font-semibold bg-primary/5 hover:bg-primary/10 rounded-xl transition-all border border-dashed border-primary/30 hover:border-primary/50"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة خيار جديد
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scale Values */}
          {hasScale && (
            <div className="space-y-2.5">
              {/* Preview Card */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl border border-amber-200/50 dark:border-amber-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    {field.type === FieldType.RATING ? <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {field.type === FieldType.RATING ? 'تقييم بالنجوم' : 'مقياس رقمي'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {field.type === FieldType.RATING ? `تقييم من ١ إلى ${field.maxValue || 5} نجوم` : `مقياس من ${field.minValue || 0} إلى ${field.maxValue || 5}`}
                    </p>
                  </div>
                </div>
                
                {/* Visual Preview */}
                <div className="p-3 bg-background/80 rounded-xl border border-border/50">
                  {field.type === FieldType.RATING ? (
                    <div className="flex items-center gap-1 justify-center">
                      {Array.from({ length: field.maxValue || 5 }).map((_, i) => (
                        <Star key={i} className={cn(
                          "w-6 h-6 transition-all",
                          i < 3 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                        )} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 justify-center">
                      {Array.from({ length: Math.min((field.maxValue || 5) - (field.minValue || 0) + 1, 6) }).map((_, i) => (
                        <button key={i} className={cn(
                          "flex-1 h-7 rounded-lg text-xs font-bold transition-all",
                          i === 2 ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
                        )}>
                          {(field.minValue || 0) + i}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Scale Range Editor */}
              <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                <label className="text-sm font-semibold text-foreground mb-3 block">نطاق المقياس</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <label className="text-xs text-muted-foreground mb-1.5 block">القيمة الدنيا</label>
                    <Input
                      type="number"
                      value={field.minValue || 0}
                      onChange={(e) => onUpdate({ minValue: parseInt(e.target.value) || 0 })}
                      className="h-10 rounded-lg border-border bg-muted/30 text-center font-bold text-lg"
                    />
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <label className="text-xs text-muted-foreground mb-1.5 block">القيمة العليا</label>
                    <Input
                      type="number"
                      value={field.maxValue || 5}
                      onChange={(e) => onUpdate({ maxValue: parseInt(e.target.value) || 5 })}
                      className="h-10 rounded-lg border-border bg-muted/30 text-center font-bold text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Settings */}
          {isFileType && (
            <div className="space-y-2.5">
              {/* Preview Card */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">رفع الملفات</p>
                    <p className="text-xs text-muted-foreground">حتى {field.maxFiles || 1} ملف - {((field.maxFileSize || 10 * 1024 * 1024) / (1024 * 1024)).toFixed(0)} MB</p>
                  </div>
                </div>
                
                {/* Visual Preview */}
                <div className="p-4 bg-background/80 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-foreground">اسحب الملفات هنا</p>
                  <p className="text-xs text-muted-foreground">أو انقر للاختيار</p>
                </div>
              </div>

              {/* File Types Selection */}
              <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                <label className="text-sm font-semibold text-foreground mb-3 block">أنواع الملفات المسموحة</label>
                <div className="grid grid-cols-3 gap-2">
                  {fileTypePresets.map((preset) => {
                    const isSelected = preset.types.every(t => 
                      (field.allowedFileTypes || []).includes(t)
                    );
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleToggleFileType(preset.types)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl text-sm font-medium transition-all",
                          isSelected 
                            ? "bg-primary/10 text-primary border-2 border-primary/30" 
                            : "bg-background text-muted-foreground hover:bg-muted/50 border-2 border-transparent"
                        )}
                      >
                        {preset.label === 'صور' && <Image className="w-5 h-5" />}
                        {preset.label === 'مستندات' && <FileText className="w-5 h-5" />}
                        {preset.label === 'الكل' && <Files className="w-5 h-5" />}
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Size and Count */}
              <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                <label className="text-sm font-semibold text-foreground mb-3 block">قيود الملفات</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5" />
                      الحجم الأقصى (MB)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={(field.maxFileSize || 10 * 1024 * 1024) / (1024 * 1024)}
                      onChange={(e) => {
                        const mb = parseFloat(e.target.value) || 10;
                        onUpdate({ maxFileSize: mb * 1024 * 1024 });
                      }}
                      className="h-10 rounded-lg border-border bg-muted/30 text-center font-bold"
                    />
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      العدد الأقصى
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={field.maxFiles || 1}
                      onChange={(e) => onUpdate({ maxFiles: parseInt(e.target.value) || 1 })}
                      className="h-10 rounded-lg border-border bg-muted/30 text-center font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Required Toggle - Hide for RECAPTCHA */}
          {!isRecaptcha && (
            <div className={cn(
              "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
              field.required 
                ? "bg-gradient-to-br from-rose-50 to-red-100/50 dark:from-rose-900/20 dark:to-red-900/10 border-rose-200 dark:border-rose-700/50" 
                : "bg-muted/20 border-border"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  field.required 
                    ? "bg-rose-500/20" 
                    : "bg-muted"
                )}>
                  {field.required ? (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  ) : (
                    <span className="text-muted-foreground font-bold">*</span>
                  )}
                </div>
                <div>
                  <p className={cn(
                    "font-semibold text-sm",
                    field.required ? "text-rose-700 dark:text-rose-400" : "text-foreground"
                  )}>حقل إلزامي</p>
                  <p className="text-xs text-muted-foreground">
                    {field.required ? "المستخدم ملزم بتعبئة هذا الحقل" : "هذا الحقل اختياري"}
                  </p>
                </div>
              </div>
              <div dir="ltr">
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => onUpdate({ required: checked })}
                />
              </div>
            </div>
          )}

          {/* reCAPTCHA Preview */}
          {isRecaptcha && (
            <div className="space-y-4">
              {/* Info Card */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-900/10 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">حماية reCAPTCHA</p>
                    <p className="text-xs text-muted-foreground">حماية متقدمة من Google ضد البوتات والسبام</p>
                  </div>
                </div>
                
                {/* Features */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">حماية من البوتات</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">منع السبام</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">سهل الاستخدام</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">مجاني تماماً</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  ⚠️ يُنصح بإضافة reCAPTCHA مرة واحدة فقط في نهاية النموذج
                </p>
              </div>
            </div>
          )}

          {/* Toggle (Yes/No) Preview */}
          {isToggle && (
            <div className="space-y-4">
              {/* Info Card */}
              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-100/50 dark:from-violet-900/20 dark:to-purple-900/10 rounded-2xl border border-violet-200/50 dark:border-violet-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <ToggleLeft className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">سؤال نعم/لا</p>
                    <p className="text-xs text-muted-foreground">سؤال بسيط يُجاب عليه بنعم أو لا</p>
                  </div>
                </div>
                
                {/* Use Cases */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg text-xs">
                    <span className="text-violet-500">✓</span>
                    <span className="text-muted-foreground">"هل توافق على الشروط والأحكام؟"</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg text-xs">
                    <span className="text-violet-500">✓</span>
                    <span className="text-muted-foreground">"هل لديك خبرة سابقة؟"</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg text-xs">
                    <span className="text-violet-500">✓</span>
                    <span className="text-muted-foreground">"هل تريد تلقي الإشعارات؟"</span>
                  </div>
                </div>
              </div>

              {/* Visual Preview */}
              <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                <label className="text-sm font-semibold text-foreground mb-3 block">معاينة الحقل</label>
                <div className="flex gap-3 p-3 bg-background rounded-xl border border-border">
                  {/* Yes Button */}
                  <div className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">نعم</span>
                  </div>
                  {/* No Button */}
                  <div className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border-2 border-border bg-muted/30">
                    <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">لا</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  المستخدم يختار إجابة واحدة فقط
                </p>
              </div>
            </div>
          )}

          {/* ==================== EMBED BLOCKS ==================== */}

          {/* Image Settings */}
          {isImageType && (
            <div className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center gap-2.5 py-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Image className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">إعدادات الصورة</p>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">رابط الصورة</label>
                <Input
                  value={field.imageUrl || ''}
                  onChange={(e) => onUpdate({ imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="h-9 rounded-lg border-border bg-muted/30 focus:bg-background text-sm"
                  dir="ltr"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">النص البديل (Alt)</label>
                <Input
                  value={field.imageAlt || ''}
                  onChange={(e) => onUpdate({ imageAlt: e.target.value })}
                  placeholder="وصف الصورة..."
                  className="h-9 rounded-lg border-border bg-muted/30 focus:bg-background text-sm"
                />
              </div>

              {/* Width */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">العرض</label>
                <div className="flex gap-1">
                  {[
                    { value: 'full', label: 'كامل' },
                    { value: 'medium', label: 'متوسط' },
                    { value: 'small', label: 'صغير' },
                  ].map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => onUpdate({ imageWidth: size.value as 'full' | 'medium' | 'small' })}
                      className={cn(
                        "flex-1 py-2 text-xs rounded-lg transition-colors",
                        field.imageWidth === size.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alignment */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">المحاذاة</label>
                <div className="flex gap-1">
                  {[
                    { value: 'right', icon: AlignRight, label: 'يمين' },
                    { value: 'center', icon: AlignCenter, label: 'وسط' },
                    { value: 'left', icon: AlignJustify, label: 'يسار' },
                  ].map((align) => (
                    <button
                      key={align.value}
                      type="button"
                      onClick={() => onUpdate({ imageAlign: align.value as 'right' | 'center' | 'left' })}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-colors",
                        field.imageAlign === align.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      <align.icon className="w-3.5 h-3.5" />
                      {align.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link on Click */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">رابط عند الضغط (اختياري)</label>
                <Input
                  value={field.imageLink || ''}
                  onChange={(e) => onUpdate({ imageLink: e.target.value })}
                  placeholder="https://example.com"
                  className="h-9 rounded-lg border-border bg-muted/30 focus:bg-background text-sm"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* Video Settings */}
          {isVideoType && (
            <div className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center gap-2.5 py-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Video className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">إعدادات الفيديو</p>
              </div>

              {/* Video Source */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">مصدر الفيديو</label>
                <div className="flex gap-1">
                  {[
                    { value: 'youtube', label: 'YouTube' },
                    { value: 'vimeo', label: 'Vimeo' },
                    { value: 'direct', label: 'رابط مباشر' },
                  ].map((source) => (
                    <button
                      key={source.value}
                      type="button"
                      onClick={() => onUpdate({ videoSource: source.value as 'youtube' | 'vimeo' | 'direct' })}
                      className={cn(
                        "flex-1 py-2 text-xs rounded-lg transition-colors",
                        field.videoSource === source.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {source.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">رابط الفيديو</label>
                <Input
                  value={field.videoUrl || ''}
                  onChange={(e) => onUpdate({ videoUrl: e.target.value })}
                  placeholder={
                    field.videoSource === 'youtube' 
                      ? 'https://youtube.com/watch?v=...' 
                      : field.videoSource === 'vimeo'
                      ? 'https://vimeo.com/...'
                      : 'https://example.com/video.mp4'
                  }
                  className="h-9 rounded-lg border-border bg-muted/30 focus:bg-background text-sm"
                  dir="ltr"
                />
              </div>

              {/* Video Options */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => onUpdate({ videoAutoplay: !field.videoAutoplay })}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-colors text-sm",
                    field.videoAutoplay
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Play className="w-4 h-4" />
                  <span>تشغيل تلقائي</span>
                  {field.videoAutoplay && <Check className="w-4 h-4 mr-auto text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdate({ videoControls: !field.videoControls })}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-colors text-sm",
                    field.videoControls !== false
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span>أدوات التحكم</span>
                  {field.videoControls !== false && <Check className="w-4 h-4 mr-auto text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdate({ videoLoop: !field.videoLoop })}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-colors text-sm",
                    field.videoLoop
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تكرار</span>
                  {field.videoLoop && <Check className="w-4 h-4 mr-auto text-primary" />}
                </button>
              </div>
            </div>
          )}

          {/* Audio Settings */}
          {isAudioType && (
            <div className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center gap-2.5 py-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">إعدادات الصوت</p>
              </div>

              {/* Audio URL */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">رابط الملف الصوتي</label>
                <Input
                  value={field.audioUrl || ''}
                  onChange={(e) => onUpdate({ audioUrl: e.target.value })}
                  placeholder="https://example.com/audio.mp3"
                  className="h-9 rounded-lg border-border bg-muted/30 focus:bg-background text-sm"
                  dir="ltr"
                />
              </div>

              {/* Audio Options */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => onUpdate({ audioAutoplay: !field.audioAutoplay })}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-colors text-sm",
                    field.audioAutoplay
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Play className="w-4 h-4" />
                  <span>تشغيل تلقائي</span>
                  {field.audioAutoplay && <Check className="w-4 h-4 mr-auto text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdate({ audioControls: !field.audioControls })}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-colors text-sm",
                    field.audioControls !== false
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span>أدوات التحكم</span>
                  {field.audioControls !== false && <Check className="w-4 h-4 mr-auto text-primary" />}
                </button>
              </div>

              {/* Preview */}
              {field.audioUrl && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Music className="w-3.5 h-3.5" />
                    <span>معاينة</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background rounded-md border border-border">
                    <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <div className="flex-1 h-1 bg-muted rounded-full">
                      <div className="w-1/3 h-full bg-muted-foreground/40 rounded-full" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">0:00</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Embed Settings */}
          {isEmbedType && (
            <div className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center gap-2.5 py-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Code className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">تضمين محتوى</p>
                  <p className="text-xs text-muted-foreground">خرائط، تغريدات، وغيرها</p>
                </div>
              </div>

              {/* Embed Code */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">كود التضمين (HTML/iframe)</label>
                <textarea
                  value={field.embedCode || ''}
                  onChange={(e) => onUpdate({ embedCode: e.target.value })}
                  placeholder='<iframe src="..." width="100%" height="400"></iframe>'
                  rows={4}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-muted/30 focus:bg-background outline-none resize-none font-mono text-foreground placeholder:text-muted-foreground"
                  dir="ltr"
                />
              </div>

              {/* Embed Height */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/30 rounded-lg">
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">الارتفاع (بكسل)</label>
                  <Input
                    type="number"
                    value={field.embedHeight || 400}
                    onChange={(e) => onUpdate({ embedHeight: parseInt(e.target.value) || 400 })}
                    className="h-9 rounded-lg border-border bg-background text-center font-medium text-sm"
                  />
                </div>
              </div>

              {/* Examples */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">أمثلة على المحتوى المدعوم:</p>
                <div className="space-y-1">
                  {['خرائط Google', 'تغريدات Twitter', 'منشورات Instagram', 'ملفات Figma'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== ADVANCED FIELDS ==================== */}

          {/* Conditional Logic Settings */}
          {isConditionalLogic && (
            <div className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center gap-2.5 py-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">منطق شرطي</p>
                  <p className="text-xs text-muted-foreground">إظهار/إخفاء حقول بناءً على شروط</p>
                </div>
              </div>

              {/* Action */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">الإجراء</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdate({ 
                      conditionalLogic: { 
                        ...field.conditionalLogic, 
                        action: 'show',
                        rules: field.conditionalLogic?.rules || [],
                        operator: field.conditionalLogic?.operator || 'and'
                      } 
                    })}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-colors",
                      field.conditionalLogic?.action === 'show'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    إظهار
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ 
                      conditionalLogic: { 
                        ...field.conditionalLogic, 
                        action: 'hide',
                        rules: field.conditionalLogic?.rules || [],
                        operator: field.conditionalLogic?.operator || 'and'
                      } 
                    })}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-colors",
                      field.conditionalLogic?.action === 'hide'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    إخفاء
                  </button>
                </div>
              </div>

              {/* Operator */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">عند تحقق</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdate({ 
                      conditionalLogic: { 
                        ...field.conditionalLogic, 
                        operator: 'and',
                        action: field.conditionalLogic?.action || 'show',
                        rules: field.conditionalLogic?.rules || []
                      } 
                    })}
                    className={cn(
                      "flex-1 py-2 text-xs rounded-lg transition-colors",
                      field.conditionalLogic?.operator === 'and' || !field.conditionalLogic?.operator
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    جميع الشروط (و)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ 
                      conditionalLogic: { 
                        ...field.conditionalLogic, 
                        operator: 'or',
                        action: field.conditionalLogic?.action || 'show',
                        rules: field.conditionalLogic?.rules || []
                      } 
                    })}
                    className={cn(
                      "flex-1 py-2 text-xs rounded-lg transition-colors",
                      field.conditionalLogic?.operator === 'or'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    أي شرط (أو)
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  💡 سيتم إعداد الشروط التفصيلية من إعدادات النموذج الرئيسية
                </p>
              </div>
            </div>
          )}

          {/* Calculated Field Settings */}
          {isCalculated && (
            <div className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center gap-2.5 py-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">حقل محسوب</p>
                  <p className="text-xs text-muted-foreground">حساب قيم تلقائياً</p>
                </div>
              </div>

              {/* Formula */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">المعادلة</label>
                <Input
                  value={field.formula || ''}
                  onChange={(e) => onUpdate({ formula: e.target.value })}
                  placeholder="مثال: {السعر} × {الكمية}"
                  className="h-9 rounded-lg border-border bg-muted/30 focus:bg-background text-sm font-mono"
                />
              </div>

              {/* Format */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">تنسيق النتيجة</label>
                <div className="flex gap-1">
                  {[
                    { value: 'number', icon: HashIcon, label: 'رقم' },
                    { value: 'currency', icon: DollarSign, label: 'عملة' },
                    { value: 'percentage', icon: Percent, label: 'نسبة' },
                  ].map((format) => (
                    <button
                      key={format.value}
                      type="button"
                      onClick={() => onUpdate({ formulaFormat: format.value as 'number' | 'currency' | 'percentage' })}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-colors",
                        field.formulaFormat === format.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      <format.icon className="w-3.5 h-3.5" />
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Example */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">أمثلة على المعادلات:</p>
                <div className="space-y-1.5 font-mono text-[10px] text-muted-foreground">
                  <p className="p-1.5 bg-background rounded">{'{السعر} × {الكمية}'}</p>
                  <p className="p-1.5 bg-background rounded">{'{المجموع} × 0.15'}</p>
                  <p className="p-1.5 bg-background rounded">{'{الراتب} + {البدلات} - {الخصومات}'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Field Settings */}
          {isHidden && (
            <div className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center gap-2.5 py-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <EyeOff className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">حقل مخفي</p>
                  <p className="text-xs text-muted-foreground">لا يظهر للمستخدم</p>
                </div>
              </div>

              {/* Value Source */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">مصدر القيمة</label>
                <div className="space-y-1">
                  {[
                    { value: 'static', icon: FileCode, label: 'قيمة ثابتة' },
                    { value: 'url_param', icon: LinkIcon, label: 'معامل URL' },
                    { value: 'cookie', icon: Cookie, label: 'Cookie' },
                  ].map((source) => (
                    <button
                      key={source.value}
                      type="button"
                      onClick={() => onUpdate({ hiddenSource: source.value as 'static' | 'url_param' | 'cookie' })}
                      className={cn(
                        "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-colors text-sm",
                        field.hiddenSource === source.value
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <source.icon className="w-4 h-4" />
                      <span>{source.label}</span>
                      {field.hiddenSource === source.value && <Check className="w-4 h-4 mr-auto text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Static Value */}
              {(field.hiddenSource === 'static' || !field.hiddenSource) && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">القيمة الثابتة</label>
                  <Input
                    value={field.hiddenValue || ''}
                    onChange={(e) => onUpdate({ hiddenValue: e.target.value })}
                    placeholder="مثال: campaign_2024"
                    className="h-9 rounded-lg border-border bg-muted/30 focus:bg-background text-sm"
                  />
                </div>
              )}

              {/* URL Param */}
              {field.hiddenSource === 'url_param' && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">اسم المعامل</label>
                  <Input
                    value={field.hiddenParamName || ''}
                    onChange={(e) => onUpdate({ hiddenParamName: e.target.value })}
                    placeholder="مثال: utm_source"
                    className="h-9 rounded-lg border-border bg-muted/30 focus:bg-background text-sm"
                    dir="ltr"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    سيقرأ من: example.com/form?<span className="text-foreground">{field.hiddenParamName || 'utm_source'}</span>=value
                  </p>
                </div>
              )}

              {/* Cookie Name */}
              {field.hiddenSource === 'cookie' && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">اسم الـ Cookie</label>
                  <Input
                    value={field.hiddenParamName || ''}
                    onChange={(e) => onUpdate({ hiddenParamName: e.target.value })}
                    placeholder="مثال: user_id"
                    className="h-9 rounded-lg border-border bg-muted/30 focus:bg-background text-sm"
                    dir="ltr"
                  />
                </div>
              )}

              {/* Note */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ هذا الحقل لن يظهر للمستخدم لكن قيمته ستُرسل مع النموذج
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-3 sm:p-4 border-t border-border bg-card flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9 sm:h-11 rounded-lg sm:rounded-xl text-muted-foreground hover:bg-muted text-xs sm:text-sm"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={onSave}
            className="flex-1 h-9 sm:h-11 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs sm:text-sm"
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-1.5" />
            حفظ التغييرات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FieldEditorDialog;
