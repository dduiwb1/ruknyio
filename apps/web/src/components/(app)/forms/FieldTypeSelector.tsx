'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Type, 
  AlignLeft, 
  Hash, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  List, 
  CircleDot, 
  CheckSquare, 
  Paperclip, 
  Star, 
  SlidersHorizontal, 
  ToggleLeft, 
  Grid3X3, 
  PenTool,
  Link,
  ListChecks,
  ArrowUpDown,
  Heading1,
  Text,
  Minus,
  Bookmark,
  Tag,
  Image,
  Video,
  Volume2,
  Code,
  GitBranch,
  Calculator,
  EyeOff,
  Shield,
  Search,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  Upload,
  Gauge,
  FileText,
  Files,
  HardDrive,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { FieldType, FIELD_TYPE_LABELS } from '@/lib/hooks/useForms';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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

interface FieldTypeSelectorProps {
  onSelect: (type: FieldType) => void;
  onSelectField?: (field: FormFieldInput) => void; // For desktop - pass complete field
  onClose: () => void;
  // For edit mode - pass field to edit and callbacks
  editingField?: FormFieldInput | null;
  onUpdateField?: (updates: Partial<FormFieldInput>) => void;
  onSaveField?: () => void;
  mode?: 'add' | 'edit';
}

interface FieldTypeItem {
  type: FieldType;
  icon: React.ElementType;
  description: string;
}

interface FieldTypeGroup {
  id: string;
  title: string;
  types: FieldTypeItem[];
}

const FIELD_GROUPS: FieldTypeGroup[] = [
  {
    id: 'questions',
    title: 'الأسئلة',
    types: [
      { type: FieldType.TEXT, icon: Type, description: 'سؤال مع إجابة نصية قصيرة' },
      { type: FieldType.TEXTAREA, icon: AlignLeft, description: 'سؤال مع إجابة نصية طويلة' },
      { type: FieldType.RADIO, icon: CircleDot, description: 'اختيار إجابة واحدة من عدة خيارات' },
      { type: FieldType.CHECKBOX, icon: CheckSquare, description: 'اختيار إجابات متعددة' },
      { type: FieldType.SELECT, icon: List, description: 'قائمة منسدلة للاختيار منها' },
      { type: FieldType.MULTISELECT, icon: ListChecks, description: 'اختيار متعدد من قائمة' },
      { type: FieldType.NUMBER, icon: Hash, description: 'إدخال رقم صحيح أو عشري' },
      { type: FieldType.EMAIL, icon: Mail, description: 'بريد إلكتروني مع التحقق' },
      { type: FieldType.PHONE, icon: Phone, description: 'رقم هاتف مع رمز الدولة' },
      { type: FieldType.URL, icon: Link, description: 'رابط موقع ويب' },
      { type: FieldType.FILE, icon: Paperclip, description: 'رفع ملفات أو صور' },
      { type: FieldType.DATE, icon: Calendar, description: 'اختيار تاريخ من التقويم' },
      { type: FieldType.TIME, icon: Clock, description: 'اختيار وقت محدد' },
      { type: FieldType.SCALE, icon: SlidersHorizontal, description: 'مقياس من 1 إلى 10' },
      { type: FieldType.MATRIX, icon: Grid3X3, description: 'جدول أسئلة متعددة' },
      { type: FieldType.RATING, icon: Star, description: 'تقييم بالنجوم' },
      { type: FieldType.SIGNATURE, icon: PenTool, description: 'توقيع يدوي رقمي' },
      { type: FieldType.RANKING, icon: ArrowUpDown, description: 'ترتيب العناصر بالسحب' },
    ],
  },
  {
    id: 'layout',
    title: 'كتل التخطيط',
    types: [
      { type: FieldType.HEADING, icon: Heading1, description: 'عنوان كبير للقسم' },
      { type: FieldType.TITLE, icon: Bookmark, description: 'عنوان رئيسي' },
      { type: FieldType.PARAGRAPH, icon: Text, description: 'نص توضيحي أو تعليمات' },
      { type: FieldType.LABEL, icon: Tag, description: 'تسمية أو ملاحظة صغيرة' },
      { type: FieldType.DIVIDER, icon: Minus, description: 'خط فاصل بين الأقسام' },
    ],
  },
  {
    id: 'embed',
    title: 'كتل التضمين',
    types: [
      { type: FieldType.IMAGE, icon: Image, description: 'عرض صورة في النموذج' },
      { type: FieldType.VIDEO, icon: Video, description: 'تضمين فيديو YouTube أو Vimeo' },
      { type: FieldType.AUDIO, icon: Volume2, description: 'تضمين ملف صوتي' },
      { type: FieldType.EMBED, icon: Code, description: 'تضمين أي محتوى عبر iFrame' },
    ],
  },
  {
    id: 'advanced',
    title: 'حقول متقدمة',
    types: [
      { type: FieldType.CONDITIONAL_LOGIC, icon: GitBranch, description: 'عرض أو إخفاء حقول بناءً على شروط' },
      { type: FieldType.CALCULATED, icon: Calculator, description: 'حساب قيم تلقائياً' },
      { type: FieldType.HIDDEN, icon: EyeOff, description: 'حقل مخفي لتخزين بيانات' },
      { type: FieldType.TOGGLE, icon: ToggleLeft, description: 'مفتاح نعم/لا' },
      { type: FieldType.RECAPTCHA, icon: Shield, description: 'حماية من البوتات والسبام' },
    ],
  },
];

// Flatten all types for search
const ALL_FIELD_TYPES = FIELD_GROUPS.flatMap(g => g.types);

// Common file type presets
const FILE_TYPE_PRESETS = [
  { label: 'صور', types: ['image/*'] },
  { label: 'مستندات', types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  { label: 'الكل', types: ['*/*'] },
];

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

export function FieldTypeSelector({ 
  onSelect,
  onSelectField,
  onClose, 
  editingField,
  onUpdateField,
  onSaveField,
  mode = 'add'
}: FieldTypeSelectorProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FieldTypeItem | null>(
    editingField ? ALL_FIELD_TYPES.find(t => t.type === editingField.type) || null : null
  );
  const [hoveredType, setHoveredType] = useState<FieldTypeItem | null>(null);
  
  // For desktop editing - create local field state if in add mode
  const [localField, setLocalField] = useState<FormFieldInput | null>(editingField || null);

  // Update local field when editing field changes
  useEffect(() => {
    if (editingField) {
      setLocalField(editingField);
      setSelectedType(ALL_FIELD_TYPES.find(t => t.type === editingField.type) || null);
    }
  }, [editingField]);
  
  // In edit mode, only render on desktop - mobile uses FieldEditorDialog
  // In add mode, render on all devices
  if (mode === 'edit' && (isMobile === null || isMobile)) return null;

  // Filter types based on search
  const filteredGroups = searchQuery.trim()
    ? [{
        id: 'search',
        title: 'نتائج البحث',
        types: ALL_FIELD_TYPES.filter(t => 
          FIELD_TYPE_LABELS[t.type].includes(searchQuery) ||
          t.description.includes(searchQuery)
        )
      }]
    : FIELD_GROUPS;

  const displayedType = hoveredType || selectedType;

  // Handle selecting a type (for add mode on desktop, creates local field)
  const handleSelectType = (item: FieldTypeItem) => {
    setSelectedType(item);
    // Create a new local field for editing on desktop
    // All fields start empty so user writes their own label
    const newField: FormFieldInput = {
      id: `field-${Date.now()}`,
      label: item.type === FieldType.RECAPTCHA ? 'حماية reCAPTCHA' : '', // عنوان افتراضي لـ reCAPTCHA
      type: item.type,
      order: 0,
      required: false,
      placeholder: '',
      options: item.type === FieldType.SELECT || item.type === FieldType.RADIO || item.type === FieldType.CHECKBOX || item.type === FieldType.MULTISELECT || item.type === FieldType.RANKING
        ? ['خيار 1', 'خيار 2', 'خيار 3'] 
        : undefined,
      minValue: item.type === FieldType.RATING ? 1 : item.type === FieldType.SCALE ? 0 : undefined,
      maxValue: item.type === FieldType.RATING ? 5 : item.type === FieldType.SCALE ? 10 : undefined,
    };
    setLocalField(newField);
  };

  // Handle mobile selection (just pass type to parent)
  const handleMobileSelect = (item: FieldTypeItem) => {
    onSelect(item.type);
  };

  // Handle desktop insert/save
  const handleDesktopSave = () => {
    if (mode === 'edit' && onSaveField) {
      onSaveField();
    } else if (localField) {
      // On desktop, pass the complete field with all user-entered data
      if (onSelectField) {
        onSelectField(localField);
      } else {
        // Fallback for mobile - just pass the type
        onSelect(localField.type);
      }
    }
    onClose();
  };

  // Update local field
  const handleUpdateLocalField = (updates: Partial<FormFieldInput>) => {
    if (mode === 'edit' && onUpdateField) {
      onUpdateField(updates);
    }
    setLocalField(prev => prev ? { ...prev, ...updates } : null);
  };

  // Field editor helpers
  const currentField = mode === 'edit' ? editingField : localField;
  const isRecaptcha = currentField && currentField.type === FieldType.RECAPTCHA;
  const isToggle = currentField && currentField.type === FieldType.TOGGLE;
  const hasOptions = currentField && (currentField.type === FieldType.SELECT || currentField.type === FieldType.RADIO || currentField.type === FieldType.CHECKBOX || currentField.type === FieldType.MULTISELECT || currentField.type === FieldType.RANKING);
  const hasScale = currentField && (currentField.type === FieldType.RATING || currentField.type === FieldType.SCALE);
  const isFileType = currentField && currentField.type === FieldType.FILE;
  const hasPlaceholder = currentField && (currentField.type === FieldType.TEXT || 
    currentField.type === FieldType.TEXTAREA || 
    currentField.type === FieldType.EMAIL || 
    currentField.type === FieldType.PHONE ||
    currentField.type === FieldType.NUMBER ||
    currentField.type === FieldType.URL);

  const handleToggleFileType = (types: string[]) => {
    if (!currentField) return;
    const current = currentField.allowedFileTypes || [];
    const hasAll = types.every(t => current.includes(t));
    
    if (hasAll) {
      handleUpdateLocalField({ allowedFileTypes: current.filter(t => !types.includes(t)) });
    } else {
      const newTypes = [...new Set([...current, ...types])];
      handleUpdateLocalField({ allowedFileTypes: newTypes });
    }
  };

  const handleAddOption = () => {
    if (!currentField) return;
    const currentOptions = currentField.options || [];
    handleUpdateLocalField({ options: [...currentOptions, `خيار ${currentOptions.length + 1}`] });
  };

  const handleUpdateOption = (index: number, value: string) => {
    if (!currentField) return;
    const newOptions = [...(currentField.options || [])];
    newOptions[index] = value;
    handleUpdateLocalField({ options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (!currentField) return;
    const newOptions = (currentField.options || []).filter((_, i) => i !== index);
    handleUpdateLocalField({ options: newOptions });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />
      
      {/* Mobile Modal - Full Screen List */}
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-0 bg-white dark:bg-gray-950 z-50 flex flex-col md:hidden"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <X className="w-4.5 h-4.5 text-gray-600 dark:text-gray-400" />
            </button>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">إضافة حقل</h2>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 py-3 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pr-11 pl-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-300 dark:focus:border-gray-700 transition-all"
            />
          </div>
        </div>

        {/* Mobile List - Only for add mode */}
        {mode === 'add' && (
          <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
            {filteredGroups.map((group, groupIndex) => (
              <div key={group.id} className={groupIndex > 0 ? 'mt-2' : ''}>
                {/* Group Header */}
                <div className="px-4 py-2.5 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 sticky top-0">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {group.title}
                  </h3>
                </div>
                
                {/* Group Items */}
                <div className="bg-white dark:bg-gray-950">
                  {group.types.map((item, index) => (
                    <button
                      key={item.type}
                      onClick={() => handleMobileSelect(item)}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-4 py-3 active:bg-gray-100 dark:active:bg-gray-800 transition-colors text-right",
                        index !== group.types.length - 1 && "border-b border-gray-50 dark:border-gray-900"
                      )}
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                        {FIELD_TYPE_LABELS[item.type]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Bottom Safe Area */}
            <div className="h-8" />
          </div>
        )}
      </motion.div>

      {/* Desktop Modal - Split View with Field Editor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="hidden md:flex fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] max-h-[85vh] bg-card border border-border rounded-3xl shadow-2xl z-50 overflow-hidden"
      >
        {/* Left Sidebar - Field Types List (only in add mode) */}
        {mode === 'add' && (
          <div className="w-[260px] border-l border-border flex flex-col bg-muted/30">
            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pr-10 pl-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                />
              </div>
            </div>

            {/* Types List */}
            <div className="flex-1 overflow-y-auto py-2">
              {filteredGroups.map((group) => (
                <div key={group.id} className="mb-2">
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-medium text-muted-foreground">
                      {group.title}
                    </h3>
                  </div>
                  {group.types.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleSelectType(item)}
                      onMouseEnter={() => !selectedType && setHoveredType(item)}
                      onMouseLeave={() => setHoveredType(null)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-right transition-colors",
                        selectedType?.type === item.type
                          ? "bg-primary/10 text-primary"
                          : hoveredType?.type === item.type
                            ? "bg-muted text-foreground"
                            : "hover:bg-muted/50 text-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {FIELD_TYPE_LABELS[item.type]}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Content - Field Editor */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {currentField && (
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {(() => {
                    const typeItem = ALL_FIELD_TYPES.find(t => t.type === currentField.type);
                    if (typeItem) {
                      const Icon = typeItem.icon;
                      return <Icon className="w-5 h-5" />;
                    }
                    return <Type className="w-5 h-5" />;
                  })()}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {mode === 'edit' ? 'تعديل الحقل' : currentField ? 'إعداد الحقل' : 'إضافة حقل جديد'}
                </h2>
                {currentField && (
                  <p className="text-sm text-muted-foreground">
                    {FIELD_TYPE_LABELS[currentField.type]}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Field Editor Form */}
          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {currentField ? (
                <motion.div
                  key={currentField.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  {/* Label Field - Hide for RECAPTCHA */}
                  {!isRecaptcha && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {isToggle ? 'السؤال' : 'عنوان الحقل'} <span className="text-red-500">*</span>
                      </label>
                      {currentField && FIELD_TYPE_PLACEHOLDERS[currentField.type]?.hint && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {FIELD_TYPE_PLACEHOLDERS[currentField.type].hint}
                        </p>
                      )}
                      <Input
                        value={currentField.label}
                        onChange={(e) => handleUpdateLocalField({ label: e.target.value })}
                        placeholder={currentField ? FIELD_TYPE_PLACEHOLDERS[currentField.type]?.placeholder || 'أدخل عنوان الحقل' : 'أدخل عنوان الحقل'}
                        className="h-11 rounded-xl border-border bg-muted/30 focus:bg-background"
                      />
                    </div>
                  )}

                  {/* Description Field - Hide for RECAPTCHA */}
                  {!isRecaptcha && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        وصف الحقل <span className="text-xs text-muted-foreground">(اختياري)</span>
                      </label>
                      <textarea
                        value={currentField.description || ''}
                        onChange={(e) => handleUpdateLocalField({ description: e.target.value })}
                        placeholder="أضف وصفاً توضيحياً للحقل..."
                        rows={2}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none resize-none transition-all text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  )}

                  {/* Placeholder Field */}
                  {hasPlaceholder && !isRecaptcha && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        نص توضيحي (Placeholder)
                      </label>
                      <Input
                        value={currentField.placeholder || ''}
                        onChange={(e) => handleUpdateLocalField({ placeholder: e.target.value })}
                        placeholder="مثال: أدخل اسمك الكامل..."
                        className="h-11 rounded-xl border-border bg-muted/30 focus:bg-background"
                      />
                    </div>
                  )}

                  {/* Options for Select/Radio/Checkbox */}
                  {hasOptions && (
                    <div className="space-y-4">
                      {/* Preview Card */}
                      <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                            {currentField.type === FieldType.RADIO && <CircleDot className="w-4 h-4 text-primary" />}
                            {currentField.type === FieldType.CHECKBOX && <CheckSquare className="w-4 h-4 text-primary" />}
                            {currentField.type === FieldType.SELECT && <List className="w-4 h-4 text-primary" />}
                            {currentField.type === FieldType.MULTISELECT && <ListChecks className="w-4 h-4 text-primary" />}
                            {currentField.type === FieldType.RANKING && <ArrowUpDown className="w-4 h-4 text-primary" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {currentField.type === FieldType.RADIO && 'اختيار واحد'}
                              {currentField.type === FieldType.CHECKBOX && 'اختيار متعدد'}
                              {currentField.type === FieldType.SELECT && 'قائمة منسدلة'}
                              {currentField.type === FieldType.MULTISELECT && 'قائمة متعددة'}
                              {currentField.type === FieldType.RANKING && 'ترتيب'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {currentField.type === FieldType.RADIO && 'المستخدم يختار خيار واحد فقط'}
                              {currentField.type === FieldType.CHECKBOX && 'المستخدم يمكنه اختيار عدة خيارات'}
                              {currentField.type === FieldType.SELECT && 'قائمة منسدلة - اختيار خيار واحد'}
                              {currentField.type === FieldType.MULTISELECT && 'قائمة منسدلة - اختيار عدة خيارات'}
                              {currentField.type === FieldType.RANKING && 'المستخدم يرتب الخيارات بالسحب'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Visual Preview */}
                        <div className="p-3 bg-background/80 rounded-xl border border-border/50">
                          {currentField.type === FieldType.RADIO && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-lg border border-primary/20">
                                <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                                <span className="text-sm font-medium text-foreground">الخيار المحدد</span>
                              </div>
                              <div className="flex items-center gap-3 p-2 rounded-lg">
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                                <span className="text-sm text-muted-foreground">خيار آخر</span>
                              </div>
                            </div>
                          )}
                          {currentField.type === FieldType.CHECKBOX && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-lg border border-primary/20">
                                <div className="w-5 h-5 rounded-md border-2 border-primary bg-primary flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-foreground">خيار محدد ١</span>
                              </div>
                              <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-lg border border-primary/20">
                                <div className="w-5 h-5 rounded-md border-2 border-primary bg-primary flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-foreground">خيار محدد ٢</span>
                              </div>
                            </div>
                          )}
                          {currentField.type === FieldType.SELECT && (
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                              <span className="text-sm text-muted-foreground">اختر من القائمة...</span>
                              <ChevronLeft className="w-5 h-5 text-muted-foreground -rotate-90" />
                            </div>
                          )}
                          {currentField.type === FieldType.MULTISELECT && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg flex items-center gap-1">
                                  خيار ١
                                  <X className="w-3 h-3" />
                                </span>
                                <span className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg flex items-center gap-1">
                                  خيار ٢
                                  <X className="w-3 h-3" />
                                </span>
                                <span className="text-sm text-muted-foreground">+ إضافة المزيد</span>
                              </div>
                            </div>
                          )}
                          {currentField.type === FieldType.RANKING && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <span className="w-6 h-6 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                                <span className="text-sm font-medium text-foreground">الأهم</span>
                                <ArrowUpDown className="w-4 h-4 text-muted-foreground mr-auto" />
                              </div>
                              <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border border-border">
                                <span className="w-6 h-6 rounded-lg bg-muted-foreground/20 text-muted-foreground text-xs font-bold flex items-center justify-center">2</span>
                                <span className="text-sm text-muted-foreground">أقل أهمية</span>
                                <ArrowUpDown className="w-4 h-4 text-muted-foreground mr-auto" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Options Editor */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-semibold text-foreground">
                            الخيارات المتاحة
                          </label>
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {currentField.options?.length || 0} خيار
                          </span>
                        </div>
                        <div className="rounded-2xl border border-border overflow-hidden bg-background">
                          <div className="p-2 max-h-[200px] overflow-y-auto space-y-1.5">
                            {(currentField.options || []).map((option, index) => (
                              <div 
                                key={index} 
                                className="group flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/20 rounded-xl transition-all"
                              >
                                <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {index + 1}
                                </span>
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
                                  disabled={(currentField.options?.length || 0) <= 2}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
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
                    </div>
                  )}

                  {/* Scale Values */}
                  {hasScale && (
                    <div className="space-y-4">
                      {/* Preview Card */}
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl border border-amber-200/50 dark:border-amber-700/30">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            {currentField.type === FieldType.RATING ? <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {currentField.type === FieldType.RATING ? 'تقييم بالنجوم' : 'مقياس رقمي'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {currentField.type === FieldType.RATING ? 'تقييم من ١ إلى ٥ نجوم' : `مقياس من ${currentField.minValue || 0} إلى ${currentField.maxValue || 5}`}
                            </p>
                          </div>
                        </div>
                        
                        {/* Visual Preview */}
                        <div className="p-3 bg-background/80 rounded-xl border border-border/50">
                          {currentField.type === FieldType.RATING ? (
                            <div className="flex items-center gap-1 justify-center">
                              {Array.from({ length: currentField.maxValue || 5 }).map((_, i) => (
                                <Star key={i} className={cn(
                                  "w-7 h-7 transition-all",
                                  i < 3 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                                )} />
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 justify-center">
                              <span className="text-xs font-medium text-muted-foreground">{currentField.minValue || 0}</span>
                              <div className="flex-1 flex items-center gap-1">
                                {Array.from({ length: (currentField.maxValue || 5) - (currentField.minValue || 0) + 1 }).map((_, i) => (
                                  <button key={i} className={cn(
                                    "flex-1 h-8 rounded-lg text-xs font-bold transition-all",
                                    i === 3 ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                  )}>
                                    {(currentField.minValue || 0) + i}
                                  </button>
                                ))}
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">{currentField.maxValue || 5}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Scale Range Editor */}
                      <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                        <label className="text-sm font-semibold text-foreground mb-3 block">نطاق المقياس</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-background rounded-xl border border-border">
                            <label className="text-xs text-muted-foreground mb-1.5 block">القيمة الدنيا</label>
                            <Input
                              type="number"
                              value={currentField.minValue || 0}
                              onChange={(e) => handleUpdateLocalField({ minValue: parseInt(e.target.value) || 0 })}
                              className="h-10 rounded-lg border-border bg-muted/30 text-center font-bold text-lg"
                            />
                          </div>
                          <div className="p-3 bg-background rounded-xl border border-border">
                            <label className="text-xs text-muted-foreground mb-1.5 block">القيمة العليا</label>
                            <Input
                              type="number"
                              value={currentField.maxValue || 5}
                              onChange={(e) => handleUpdateLocalField({ maxValue: parseInt(e.target.value) || 5 })}
                              className="h-10 rounded-lg border-border bg-muted/30 text-center font-bold text-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Upload Settings */}
                  {isFileType && (
                    <div className="space-y-4">
                      {/* Preview Card */}
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">رفع الملفات</p>
                            <p className="text-xs text-muted-foreground">حتى {currentField.maxFiles || 1} ملف - {((currentField.maxFileSize || 10 * 1024 * 1024) / (1024 * 1024)).toFixed(0)} MB</p>
                          </div>
                        </div>
                        
                        {/* Visual Preview */}
                        <div className="p-4 bg-background/80 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-blue-500" />
                          </div>
                          <p className="text-sm font-medium text-foreground">اسحب الملفات هنا</p>
                          <p className="text-xs text-muted-foreground">أو انقر للاختيار</p>
                        </div>
                      </div>

                      {/* File Types Selection */}
                      <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                        <label className="text-sm font-semibold text-foreground mb-3 block">أنواع الملفات المسموحة</label>
                        <div className="grid grid-cols-3 gap-2">
                          {FILE_TYPE_PRESETS.map((preset) => {
                            const isSelected = preset.types.every(t => 
                              (currentField.allowedFileTypes || []).includes(t)
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
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-background rounded-xl border border-border">
                            <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                              <HardDrive className="w-3.5 h-3.5" />
                              الحجم الأقصى (MB)
                            </label>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              value={(currentField.maxFileSize || 10 * 1024 * 1024) / (1024 * 1024)}
                              onChange={(e) => {
                                const mb = parseFloat(e.target.value) || 10;
                                handleUpdateLocalField({ maxFileSize: mb * 1024 * 1024 });
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
                              value={currentField.maxFiles || 1}
                              onChange={(e) => handleUpdateLocalField({ maxFiles: parseInt(e.target.value) || 1 })}
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
                      currentField.required 
                        ? "bg-gradient-to-br from-rose-50 to-red-100/50 dark:from-rose-900/20 dark:to-red-900/10 border-rose-200 dark:border-rose-700/50" 
                        : "bg-muted/20 border-border"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          currentField.required 
                            ? "bg-rose-500/20" 
                            : "bg-muted"
                        )}>
                          {currentField.required ? (
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                          ) : (
                            <span className="text-muted-foreground font-bold">*</span>
                          )}
                        </div>
                        <div>
                          <p className={cn(
                            "font-semibold text-sm",
                            currentField.required ? "text-rose-700 dark:text-rose-400" : "text-foreground"
                          )}>حقل إلزامي</p>
                          <p className="text-xs text-muted-foreground">
                            {currentField.required ? "المستخدم ملزم بتعبئة هذا الحقل" : "هذا الحقل اختياري"}
                          </p>
                        </div>
                      </div>
                      <div dir="ltr">
                        <Switch
                          checked={currentField.required}
                          onCheckedChange={(checked) => handleUpdateLocalField({ required: checked })}
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

                      {/* Visual Preview */}
                      <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                        <label className="text-sm font-semibold text-foreground mb-3 block">معاينة التحقق</label>
                        <div className="flex justify-center p-4 bg-background rounded-xl border border-border">
                          <div className="bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] p-3 shadow-sm" style={{ width: '304px', height: '78px' }}>
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 border-2 border-[#c1c1c1] rounded-sm bg-white flex-shrink-0" />
                              <span className="text-[14px] text-[#555] font-normal">I'm not a robot</span>
                              <div className="mr-auto flex flex-col items-center">
                                <svg width="32" height="32" viewBox="0 0 64 64" className="mb-0.5">
                                  <path fill="#4285f4" d="M32 0L40 16L32 32L24 16z"/>
                                  <path fill="#34a853" d="M48 16L56 32L48 48L40 32z"/>
                                  <path fill="#fbbc05" d="M32 32L40 48L32 64L24 48z"/>
                                  <path fill="#ea4335" d="M16 16L24 32L16 48L8 32z"/>
                                </svg>
                                <span className="text-[8px] text-[#555]">reCAPTCHA</span>
                                <span className="text-[6px] text-[#999]">Privacy - Terms</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 text-center bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
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
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Type className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    اختر نوع الحقل
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    اختر نوع الحقل من القائمة على اليمين لبدء إعداده
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 p-4 border-t border-border bg-muted/20">
            <button
              onClick={onClose}
              className="flex-1 h-11 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleDesktopSave}
              disabled={!currentField || (!currentField.label.trim() && currentField.type !== FieldType.RECAPTCHA)}
              className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {mode === 'edit' ? 'حفظ التغييرات' : 'إضافة الحقل'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
