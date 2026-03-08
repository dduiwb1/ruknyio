'use client';

import { FieldType, FIELD_TYPE_LABELS } from '@/lib/hooks/useForms';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export interface FormFieldInput {
  id: string;
  label: string;
  description?: string;
  type: FieldType;
  order: number;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validationRules?: any;
  conditionalLogic?: any;
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  // Matrix field properties
  matrixRows?: string[];
  matrixColumns?: string[];
  // Signature field properties
  signaturePenColor?: string;
  signaturePenWidth?: number;
  // Toggle field properties
  toggleLabelOn?: string;
  toggleLabelOff?: string;
  // File field properties
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

interface FieldEditorProps {
  field: FormFieldInput;
  onChange: (updates: Partial<FormFieldInput>) => void;
}

const HAS_OPTIONS = [FieldType.SELECT, FieldType.MULTISELECT, FieldType.RADIO, FieldType.CHECKBOX, FieldType.RANKING];
const HAS_MIN_MAX = [FieldType.RATING, FieldType.SCALE, FieldType.NUMBER];

export function FieldEditor({ field, onChange }: FieldEditorProps) {
  const showOptions = HAS_OPTIONS.includes(field.type);
  const showMinMax = HAS_MIN_MAX.includes(field.type);

  const addOption = () => {
    const opts = field.options || [];
    onChange({ options: [...opts, `خيار ${opts.length + 1}`] });
  };

  const updateOption = (index: number, value: string) => {
    const opts = [...(field.options || [])];
    opts[index] = value;
    onChange({ options: opts });
  };

  const removeOption = (index: number) => {
    const opts = (field.options || []).filter((_, i) => i !== index);
    onChange({ options: opts });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Label */}
      <div>
        <Label className="text-sm font-medium">عنوان الحقل <span className="text-destructive">*</span></Label>
        <Input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="مثال: الاسم الكامل"
          className="mt-1.5"
        />
      </div>

      {/* Description */}
      <div>
        <Label className="text-sm font-medium">الوصف <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
        <Textarea
          value={field.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="وصف مساعد للحقل..."
          rows={2}
          className="mt-1.5 resize-none"
        />
      </div>

      {/* Placeholder */}
      {![FieldType.CHECKBOX, FieldType.RADIO, FieldType.FILE, FieldType.RATING, FieldType.SCALE, FieldType.TOGGLE, FieldType.SIGNATURE].includes(field.type) && (
        <div>
          <Label className="text-sm font-medium">النص التوضيحي</Label>
          <Input
            value={field.placeholder || ''}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            placeholder="نص يظهر قبل الكتابة..."
            className="mt-1.5"
          />
        </div>
      )}

      {/* Required */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 p-3">
        <Label className="text-sm font-medium">حقل مطلوب</Label>
        <div dir="ltr">
          <Switch checked={field.required} onCheckedChange={(v) => onChange({ required: v })} />
        </div>
      </div>

      {/* Options */}
      {showOptions && (
        <div>
          <Label className="text-sm font-medium mb-2 block">الخيارات</Label>
          <div className="space-y-1.5">
            {(field.options || []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="size-4" />
              إضافة خيار
            </button>
          </div>
        </div>
      )}

      {/* Min/Max */}
      {showMinMax && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium">الحد الأدنى</Label>
            <Input
              type="number"
              value={field.minValue ?? ''}
              onChange={(e) => onChange({ minValue: e.target.value ? Number(e.target.value) : undefined })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">الحد الأقصى</Label>
            <Input
              type="number"
              value={field.maxValue ?? ''}
              onChange={(e) => onChange({ maxValue: e.target.value ? Number(e.target.value) : undefined })}
              className="mt-1.5"
            />
          </div>
        </div>
      )}
    </div>
  );
}
