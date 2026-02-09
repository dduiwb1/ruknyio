'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, Plus, Trash2, Check, Type, AlignLeft, Hash, Mail, Phone, Calendar, List, CircleDot, 
  CheckSquare, Star, Gauge, Upload, Clock, Grid3X3, Pencil, PenTool,
  Link, ListChecks, ArrowUpDown, Image,
  FileText, Files, HardDrive, Layers, AlertCircle
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

// ============================================================================
// OPTIMIZED HOOKS
// ============================================================================

/**
 * Optimized hook to detect mobile devices using matchMedia
 * Uses the standard md breakpoint (768px) for consistency with Tailwind
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Use matchMedia for better performance
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    
    // Set initial value
    setIsMobile(mediaQuery.matches);
    
    // Modern event listener
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return isMobile;
}

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface FieldEditorDialogProps {
  field: FormFieldInput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<FormFieldInput>) => void;
  onSave: () => void;
}

// Unified design tokens for consistency
const STYLES = {
  input: "h-11 rounded-xl border-border bg-muted/40 focus:bg-background text-sm transition-colors",
  label: "text-sm font-medium text-foreground mb-2 block",
  hint: "text-xs text-muted-foreground mb-2",
  card: "p-4 rounded-xl border border-border bg-card",
  section: "space-y-4",
  iconBox: "size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0",
  iconBoxSm: "size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0",
} as const;

// Field type placeholders and hints
const FIELD_TYPE_PLACEHOLDERS: Partial<Record<FieldType, { placeholder: string; hint?: string }>> = {
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
  [FieldType.MATRIX]: { placeholder: 'مثال: تقييم الخدمات', hint: 'جدول أسئلة متعددة' },
  [FieldType.SIGNATURE]: { placeholder: 'مثال: التوقيع', hint: 'توقيع يدوي رقمي' },
  [FieldType.RANKING]: { placeholder: 'مثال: رتب الأولويات', hint: 'ترتيب العناصر حسب الأهمية' },
  [FieldType.URL]: { placeholder: 'مثال: رابط الموقع الشخصي', hint: 'رابط موقع ويب' },
};

// Icons mapping for field types
const fieldTypeIcons: Partial<Record<FieldType, React.ReactNode>> = {
  [FieldType.TEXT]: <Type className="size-4" />,
  [FieldType.TEXTAREA]: <AlignLeft className="size-4" />,
  [FieldType.NUMBER]: <Hash className="size-4" />,
  [FieldType.EMAIL]: <Mail className="size-4" />,
  [FieldType.PHONE]: <Phone className="size-4" />,
  [FieldType.URL]: <Link className="size-4" />,
  [FieldType.DATE]: <Calendar className="size-4" />,
  [FieldType.TIME]: <Clock className="size-4" />,
  [FieldType.DATETIME]: <Calendar className="size-4" />,
  [FieldType.SELECT]: <List className="size-4" />,
  [FieldType.MULTISELECT]: <ListChecks className="size-4" />,
  [FieldType.RADIO]: <CircleDot className="size-4" />,
  [FieldType.CHECKBOX]: <CheckSquare className="size-4" />,
  [FieldType.RATING]: <Star className="size-4" />,
  [FieldType.SCALE]: <Gauge className="size-4" />,
  [FieldType.FILE]: <Upload className="size-4" />,
  [FieldType.MATRIX]: <Grid3X3 className="size-4" />,
  [FieldType.SIGNATURE]: <Pencil className="size-4" />,
  [FieldType.RANKING]: <ArrowUpDown className="size-4" />,
};

// File type presets
const FILE_TYPE_PRESETS: { id: string; label: string; types: string[]; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'images', label: 'صور', types: ['image/*'], icon: Image },
  { id: 'docs', label: 'مستندات', types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], icon: FileText },
  { id: 'all', label: 'الكل', types: ['*/*'], icon: Files },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Section header component */
function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className={STYLES.iconBoxSm}>{icon}</div>
      <span className="text-sm font-medium text-foreground flex-1">{title}</span>
      {badge && (
        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}

/** Option item for select/radio/checkbox */
function OptionItem({ 
  index, 
  value, 
  onChange, 
  onRemove, 
  canRemove 
}: { 
  index: number; 
  value: string; 
  onChange: (value: string) => void; 
  onRemove: () => void; 
  canRemove: boolean;
}) {
  return (
    <div className="group flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted/50 rounded-xl transition-colors">
      <span className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
        {index + 1}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border-0 p-0 text-sm text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground font-medium min-w-0"
        placeholder={`أدخل الخيار ${index + 1}`}
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className={cn(
          "size-8 flex items-center justify-center rounded-lg transition-all shrink-0",
          "bg-destructive/10 hover:bg-destructive/20",
          "opacity-0 group-hover:opacity-100",
          "disabled:opacity-0 disabled:cursor-not-allowed"
        )}
      >
        <Trash2 className="size-4 text-destructive" />
      </button>
    </div>
  );
}

/** Toggle button for settings */
function ToggleButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 w-full px-3 py-3 rounded-xl transition-colors text-sm",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/50"
      )}
    >
      {icon}
      <span className="flex-1 text-right">{label}</span>
      {active && <Check className="size-4 text-primary" />}
    </button>
  );
}

/** Segment control for options */
function SegmentControl<T extends string>({ 
  value, 
  onChange, 
  options 
}: { 
  value: T; 
  onChange: (value: T) => void; 
  options: { value: T; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg transition-all",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FieldEditorDialog({ 
  field, 
  open, 
  onOpenChange, 
  onUpdate, 
  onSave 
}: FieldEditorDialogProps) {
  const isMobile = useIsMobile();
  
  // Memoized field type checks
  const fieldFlags = useMemo(() => {
    if (!field) return null;
    return {
      hasOptions: [FieldType.SELECT, FieldType.RADIO, FieldType.CHECKBOX, FieldType.MULTISELECT, FieldType.RANKING].includes(field.type),
      hasScale: [FieldType.RATING, FieldType.SCALE].includes(field.type),
      isFileType: field.type === FieldType.FILE,
      isMatrix: field.type === FieldType.MATRIX,
      isSignature: field.type === FieldType.SIGNATURE,
      hasPlaceholder: [
        FieldType.TEXT, FieldType.TEXTAREA, FieldType.EMAIL, FieldType.PHONE,
        FieldType.NUMBER, FieldType.URL
      ].includes(field.type),
    };
  }, [field?.type]);

  // Event handlers
  const handleAddOption = useCallback(() => {
    if (!field) return;
    const currentOptions = field.options || [];
    onUpdate({ options: [...currentOptions, `خيار ${currentOptions.length + 1}`] });
  }, [field, onUpdate]);

  const handleUpdateOption = useCallback((index: number, value: string) => {
    if (!field) return;
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  }, [field, onUpdate]);

  const handleRemoveOption = useCallback((index: number) => {
    if (!field) return;
    const newOptions = (field.options || []).filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  }, [field, onUpdate]);

  const handleToggleFileType = useCallback((types: string[]) => {
    if (!field) return;
    const current = field.allowedFileTypes || [];
    const hasAll = types.every(t => current.includes(t));
    
    if (hasAll) {
      onUpdate({ allowedFileTypes: current.filter(t => !types.includes(t)) });
    } else {
      const newTypes = [...new Set([...current, ...types])];
      onUpdate({ allowedFileTypes: newTypes });
    }
  }, [field, onUpdate]);

  const handleAddMatrixRow = useCallback(() => {
    if (!field) return;
    const current = field.matrixRows || [];
    onUpdate({ matrixRows: [...current, `صف ${current.length + 1}`] });
  }, [field, onUpdate]);

  const handleUpdateMatrixRow = useCallback((index: number, value: string) => {
    if (!field) return;
    const rows = [...(field.matrixRows || [])];
    rows[index] = value;
    onUpdate({ matrixRows: rows });
  }, [field, onUpdate]);

  const handleRemoveMatrixRow = useCallback((index: number) => {
    if (!field) return;
    const rows = (field.matrixRows || []).filter((_, i) => i !== index);
    onUpdate({ matrixRows: rows });
  }, [field, onUpdate]);

  const handleAddMatrixColumn = useCallback(() => {
    if (!field) return;
    const current = field.matrixColumns || [];
    onUpdate({ matrixColumns: [...current, `عمود ${current.length + 1}`] });
  }, [field, onUpdate]);

  const handleUpdateMatrixColumn = useCallback((index: number, value: string) => {
    if (!field) return;
    const cols = [...(field.matrixColumns || [])];
    cols[index] = value;
    onUpdate({ matrixColumns: cols });
  }, [field, onUpdate]);

  const handleRemoveMatrixColumn = useCallback((index: number) => {
    if (!field) return;
    const cols = (field.matrixColumns || []).filter((_, i) => i !== index);
    onUpdate({ matrixColumns: cols });
  }, [field, onUpdate]);

  const SIGNATURE_PEN_COLORS = [
    { value: '#0f172a', label: 'أسود' },
    { value: '#1e40af', label: 'أزرق' },
    { value: '#166534', label: 'أخضر' },
    { value: '#991b1b', label: 'أحمر' },
  ];

  // Don't render if conditions not met
  if (!field || !fieldFlags || !isMobile || !open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] max-w-md max-h-[90vh] p-0 gap-0 rounded-2xl border border-border shadow-2xl bg-background flex flex-col overflow-hidden"
        showCloseButton={false}
        aria-labelledby="field-editor-title"
      >
        <VisuallyHidden>
          <DialogTitle>تعديل الحقل</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className={STYLES.iconBox}>
              {fieldTypeIcons[field.type]}
            </div>
            <div>
              <h3 id="field-editor-title" className="text-base font-semibold text-foreground">
                تعديل الحقل
              </h3>
              <p className="text-xs text-muted-foreground">
                {FIELD_TYPE_LABELS[field.type]}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="size-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            aria-label="إغلاق"
          >
            <X className="size-5 text-muted-foreground" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Basic Fields */}
          <>
            {/* Label */}
            <div>
              <label className={STYLES.label}>
                عنوان الحقل 
                  <span className="text-destructive mr-1">*</span>
                </label>
                {FIELD_TYPE_PLACEHOLDERS[field.type]?.hint && (
                  <p className={STYLES.hint}>
                    {FIELD_TYPE_PLACEHOLDERS[field.type]?.hint}
                  </p>
                )}
                <Input
                  value={field.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder={FIELD_TYPE_PLACEHOLDERS[field.type]?.placeholder || 'أدخل عنوان الحقل'}
                  className={STYLES.input}
                />
              </div>

              {/* Description */}
              <div>
                <label className={STYLES.label}>
                  وصف الحقل 
                  <span className="text-xs text-muted-foreground font-normal mr-1">(اختياري)</span>
                </label>
                <textarea
                  value={field.description || ''}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="أضف وصفاً توضيحياً للحقل..."
                  rows={2}
                  className={cn(
                    "w-full px-3 py-2.5 text-sm rounded-xl border border-border",
                    "bg-muted/40 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
                    "outline-none resize-none transition-all text-foreground placeholder:text-muted-foreground"
                  )}
                />
              </div>

              {/* Placeholder */}
              {fieldFlags.hasPlaceholder && (
                <div>
                  <label className={STYLES.label}>نص توضيحي (Placeholder)</label>
                  <Input
                    value={field.placeholder || ''}
                    onChange={(e) => onUpdate({ placeholder: e.target.value })}
                    placeholder="مثال: أدخل اسمك الكامل..."
                    className={STYLES.input}
                  />
                </div>
              )}
          </>

          {/* Options (Select, Radio, Checkbox, etc.) */}
          {fieldFlags.hasOptions && (
            <div className={STYLES.section}>
              <SectionHeader
                icon={fieldTypeIcons[field.type]}
                title={FIELD_TYPE_LABELS[field.type]}
                badge={`${field.options?.length || 0} خيار`}
              />
              
              <div className={cn(STYLES.card, "p-0 overflow-hidden")}>
                <div className="p-2 max-h-48 overflow-y-auto space-y-1.5">
                  {(field.options || []).map((option, index) => (
                    <OptionItem
                      key={index}
                      index={index}
                      value={option}
                      onChange={(value) => handleUpdateOption(index, value)}
                      onRemove={() => handleRemoveOption(index)}
                      canRemove={(field.options?.length || 0) > 2}
                    />
                  ))}
                </div>
                <div className="p-2 border-t border-border bg-muted/20">
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className={cn(
                      "flex items-center justify-center gap-2 w-full py-3 text-sm font-medium",
                      "text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors",
                      "border border-dashed border-primary/30 hover:border-primary/50"
                    )}
                  >
                    <Plus className="size-4" />
                    إضافة خيار جديد
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scale (Rating, Scale) */}
          {fieldFlags.hasScale && (
            <div className={STYLES.section}>
              <SectionHeader
                icon={field.type === FieldType.RATING ? <Star className="size-4" /> : <Gauge className="size-4" />}
                title={field.type === FieldType.RATING ? 'تقييم بالنجوم' : 'مقياس رقمي'}
              />
              
              {/* Preview */}
              <div className={cn(STYLES.card, "bg-muted/30")}>
                <div className="flex items-center justify-center py-2">
                  {field.type === FieldType.RATING ? (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: field.maxValue || 5 }).map((_, i) => (
                        <Star key={i} className={cn(
                          "size-7 transition-all",
                          i < 3 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                        )} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: Math.min((field.maxValue || 5) - (field.minValue || 0) + 1, 6) }).map((_, i) => (
                        <button key={i} className={cn(
                          "size-9 rounded-lg text-xs font-bold transition-all",
                          i === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {(field.minValue || 0) + i}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Range Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={STYLES.hint}>القيمة الدنيا</label>
                  <Input
                    type="number"
                    value={field.minValue || 0}
                    onChange={(e) => onUpdate({ minValue: parseInt(e.target.value) || 0 })}
                    className={cn(STYLES.input, "text-center font-bold")}
                  />
                </div>
                <div>
                  <label className={STYLES.hint}>القيمة العليا</label>
                  <Input
                    type="number"
                    value={field.maxValue || 5}
                    onChange={(e) => onUpdate({ maxValue: parseInt(e.target.value) || 5 })}
                    className={cn(STYLES.input, "text-center font-bold")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* File Upload */}
          {fieldFlags.isFileType && (
            <div className={STYLES.section}>
              <SectionHeader
                icon={<Upload className="size-4" />}
                title="إعدادات الملفات"
              />
              
              {/* File Types */}
              <div className="grid grid-cols-3 gap-2">
                {FILE_TYPE_PRESETS.map((preset) => {
                  const isSelected = preset.types.every(t => 
                    (field.allowedFileTypes || []).includes(t)
                  );
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleToggleFileType(preset.types)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all",
                        isSelected 
                          ? "bg-primary/10 text-primary border-2 border-primary/30" 
                          : "bg-muted/40 text-muted-foreground hover:bg-muted/60 border-2 border-transparent"
                      )}
                    >
                      <Icon className="size-5" />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Size & Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={STYLES.hint}>
                    <HardDrive className="size-3.5 inline ml-1" />
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
                    className={cn(STYLES.input, "text-center font-bold")}
                  />
                </div>
                <div>
                  <label className={STYLES.hint}>
                    <Layers className="size-3.5 inline ml-1" />
                    العدد الأقصى
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={field.maxFiles || 1}
                    onChange={(e) => onUpdate({ maxFiles: parseInt(e.target.value) || 1 })}
                    className={cn(STYLES.input, "text-center font-bold")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Matrix (جدول اختيارات): صفوف وأعمدة */}
          {fieldFlags.isMatrix && (
            <div className={STYLES.section}>
              <SectionHeader
                icon={<Grid3X3 className="size-4" />}
                title="جدول الاختيارات"
                badge="صفوف × أعمدة"
              />
              <div className="space-y-3">
                <div>
                  <p className={STYLES.hint}>صفوف الجدول (أسئلة أو بنود)</p>
                  <div className={cn(STYLES.card, "p-0 overflow-hidden")}>
                    <div className="p-2 max-h-40 overflow-y-auto space-y-1.5">
                      {(field.matrixRows || []).map((row, index) => (
                        <OptionItem
                          key={index}
                          index={index}
                          value={row}
                          onChange={(value) => handleUpdateMatrixRow(index, value)}
                          onRemove={() => handleRemoveMatrixRow(index)}
                          canRemove={(field.matrixRows?.length || 0) > 1}
                        />
                      ))}
                    </div>
                    <div className="p-2 border-t border-border bg-muted/20">
                      <button
                        type="button"
                        onClick={handleAddMatrixRow}
                        className={cn(
                          "flex items-center justify-center gap-2 w-full py-3 text-sm font-medium",
                          "text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors",
                          "border border-dashed border-primary/30 hover:border-primary/50"
                        )}
                      >
                        <Plus className="size-4" />
                        إضافة صف
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <p className={STYLES.hint}>أعمدة الجدول (خيارات التقييم)</p>
                  <div className={cn(STYLES.card, "p-0 overflow-hidden")}>
                    <div className="p-2 max-h-40 overflow-y-auto space-y-1.5">
                      {(field.matrixColumns || []).map((col, index) => (
                        <OptionItem
                          key={index}
                          index={index}
                          value={col}
                          onChange={(value) => handleUpdateMatrixColumn(index, value)}
                          onRemove={() => handleRemoveMatrixColumn(index)}
                          canRemove={(field.matrixColumns?.length || 0) > 1}
                        />
                      ))}
                    </div>
                    <div className="p-2 border-t border-border bg-muted/20">
                      <button
                        type="button"
                        onClick={handleAddMatrixColumn}
                        className={cn(
                          "flex items-center justify-center gap-2 w-full py-3 text-sm font-medium",
                          "text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors",
                          "border border-dashed border-primary/30 hover:border-primary/50"
                        )}
                      >
                        <Plus className="size-4" />
                        إضافة عمود
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Signature (توقيع): لون وسُمك القلم */}
          {fieldFlags.isSignature && (
            <div className={STYLES.section}>
              <SectionHeader
                icon={<PenTool className="size-4" />}
                title="تخصيص التوقيع"
              />
              <div className={STYLES.card}>
                <div className="space-y-4">
                  <div>
                    <label className={STYLES.hint}>لون القلم</label>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {SIGNATURE_PEN_COLORS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => onUpdate({ signaturePenColor: value })}
                          className={cn(
                            "size-10 rounded-xl border-2 transition-all",
                            (field.signaturePenColor || "#0f172a") === value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-border"
                          )}
                          style={{ backgroundColor: value }}
                          title={label}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={STYLES.hint}>سُمك القلم (px)</label>
                    <Input
                      type="number"
                      min={1}
                      max={6}
                      value={field.signaturePenWidth ?? 2}
                      onChange={(e) =>
                        onUpdate({
                          signaturePenWidth: Math.min(6, Math.max(1, parseInt(e.target.value) || 2)),
                        })
                      }
                      className={cn(STYLES.input, "text-center font-bold")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Required Toggle */}
          <div className={cn(
              STYLES.card,
              "flex items-center justify-between",
              field.required && "bg-destructive/5 border-destructive/20"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  STYLES.iconBoxSm,
                  field.required ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
                )}>
                  {field.required ? <AlertCircle className="size-4" /> : <span className="font-bold">*</span>}
                </div>
                <div>
                  <p className={cn(
                    "font-medium text-sm",
                    field.required ? "text-destructive" : "text-foreground"
                  )}>
                    حقل إلزامي
                  </p>
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
        </div>

        {/* Footer */}
        <footer className="flex items-center gap-3 p-4 border-t border-border bg-muted/30 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 rounded-xl text-muted-foreground hover:bg-muted"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={onSave}
            className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Check className="size-4 ml-2" />
            حفظ التغييرات
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

export default FieldEditorDialog;
