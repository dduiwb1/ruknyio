'use client';

import React from 'react';
import { X, Plus, Trash2, Check, Type, AlignLeft, Hash, Mail, Phone, Calendar, List, CircleDot, CheckSquare, Star, Gauge, Upload, Clock, ToggleLeft, Grid3X3, Pencil } from 'lucide-react';
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

interface FieldEditorDialogProps {
  field: FormFieldInput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<FormFieldInput>) => void;
  onSave: () => void;
}

// Icons mapping for field types
const fieldTypeIcons: Record<FieldType, React.ReactNode> = {
  [FieldType.TEXT]: <Type className="w-4 h-4" />,
  [FieldType.TEXTAREA]: <AlignLeft className="w-4 h-4" />,
  [FieldType.NUMBER]: <Hash className="w-4 h-4" />,
  [FieldType.EMAIL]: <Mail className="w-4 h-4" />,
  [FieldType.PHONE]: <Phone className="w-4 h-4" />,
  [FieldType.DATE]: <Calendar className="w-4 h-4" />,
  [FieldType.TIME]: <Clock className="w-4 h-4" />,
  [FieldType.DATETIME]: <Calendar className="w-4 h-4" />,
  [FieldType.SELECT]: <List className="w-4 h-4" />,
  [FieldType.RADIO]: <CircleDot className="w-4 h-4" />,
  [FieldType.CHECKBOX]: <CheckSquare className="w-4 h-4" />,
  [FieldType.RATING]: <Star className="w-4 h-4" />,
  [FieldType.SCALE]: <Gauge className="w-4 h-4" />,
  [FieldType.FILE]: <Upload className="w-4 h-4" />,
  [FieldType.TOGGLE]: <ToggleLeft className="w-4 h-4" />,
  [FieldType.MATRIX]: <Grid3X3 className="w-4 h-4" />,
  [FieldType.SIGNATURE]: <Pencil className="w-4 h-4" />,
};

export function FieldEditorDialog({ field, open, onOpenChange, onUpdate, onSave }: FieldEditorDialogProps) {
  if (!field) return null;

  const hasOptions = field.type === FieldType.SELECT || field.type === FieldType.RADIO || field.type === FieldType.CHECKBOX;
  const hasScale = field.type === FieldType.RATING || field.type === FieldType.SCALE;
  const isFileType = field.type === FieldType.FILE;
  const hasPlaceholder = field.type === FieldType.TEXT || 
    field.type === FieldType.TEXTAREA || 
    field.type === FieldType.EMAIL || 
    field.type === FieldType.PHONE ||
    field.type === FieldType.NUMBER;

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
        className="w-[95vw] sm:w-full max-w-[420px] max-h-[90vh] sm:max-h-[85vh] p-0 gap-0 rounded-2xl sm:rounded-3xl border-0 shadow-2xl bg-white dark:bg-gray-900 flex flex-col overflow-hidden" 
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>تعديل الحقل</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              {fieldTypeIcons[field.type]}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                تعديل الحقل
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                {FIELD_TYPE_LABELS[field.type]}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-5 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {/* Label Field */}
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5 block">
              عنوان الحقل <span className="text-red-500">*</span>
            </label>
            <Input
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="أدخل عنوان الحقل"
              className="h-10 sm:h-11 rounded-lg sm:rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 text-sm"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5 block">
              وصف الحقل <span className="text-[10px] sm:text-xs text-gray-400">(اختياري)</span>
            </label>
            <textarea
              value={field.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="أضف وصفاً توضيحياً للحقل..."
              rows={2}
              className="w-full px-3 py-2 sm:py-2.5 text-sm rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>

          {/* Placeholder Field */}
          {hasPlaceholder && (
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5 block">
                نص توضيحي (Placeholder)
              </label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                placeholder="مثال: أدخل اسمك الكامل..."
                className="h-10 sm:h-11 rounded-lg sm:rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 text-sm"
              />
            </div>
          )}

          {/* Options for Select/Radio/Checkbox */}
          {hasOptions && (
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  الخيارات
                </label>
                <span className="text-[9px] sm:text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {field.options?.length || 0} خيار
                </span>
              </div>
              <div className="rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Options List - Clean Vertical Layout */}
                <div className="p-2 sm:p-2.5 max-h-[25vh] sm:max-h-[30vh] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-700 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                  <div className="space-y-1 sm:space-y-1.5">
                    {(field.options || []).map((option, index) => (
                      <div 
                        key={index} 
                        className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md sm:rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all"
                      >
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded sm:rounded-md bg-indigo-500 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white flex-shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleUpdateOption(index, e.target.value)}
                          className="flex-1 bg-transparent border-0 p-0 text-xs sm:text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-0 placeholder:text-gray-400 font-medium min-w-0"
                          placeholder={`خيار ${index + 1}`}
                          title={option}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          disabled={(field.options?.length || 0) <= 2}
                          className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded sm:rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0"
                          title="حذف"
                        >
                          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Add Option Button */}
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50">
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 w-full py-1 sm:py-1.5 text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md sm:rounded-lg transition-all"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    إضافة خيار جديد
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scale Values */}
          {hasScale && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5 block">
                  القيمة الدنيا
                </label>
                <Input
                  type="number"
                  value={field.minValue || 0}
                  onChange={(e) => onUpdate({ minValue: parseInt(e.target.value) || 0 })}
                  className="h-10 sm:h-11 rounded-lg sm:rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5 block">
                  القيمة العليا
                </label>
                <Input
                  type="number"
                  value={field.maxValue || 5}
                  onChange={(e) => onUpdate({ maxValue: parseInt(e.target.value) || 5 })}
                  className="h-10 sm:h-11 rounded-lg sm:rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                />
              </div>
            </div>
          )}

          {/* File Upload Settings */}
          {isFileType && (
            <div className="space-y-2.5 sm:space-y-3">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block">
                أنواع الملفات
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                        "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all",
                        isSelected 
                          ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 block">
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
                    className="h-8 sm:h-9 rounded-md sm:rounded-lg text-xs sm:text-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 block">
                    العدد الأقصى
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={field.maxFiles || 1}
                    onChange={(e) => onUpdate({ maxFiles: parseInt(e.target.value) || 1 })}
                    className="h-8 sm:h-9 rounded-md sm:rounded-lg text-xs sm:text-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Required Toggle */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-red-500 font-bold text-[10px] sm:text-xs">*</span>
              </div>
              <div>
                <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">حقل إلزامي</p>
                <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">يجب على المستخدم إدخال قيمة</p>
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
        <div className="flex items-center gap-2 p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9 sm:h-11 rounded-lg sm:rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={onSave}
            className="flex-1 h-9 sm:h-11 rounded-lg sm:rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm"
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
