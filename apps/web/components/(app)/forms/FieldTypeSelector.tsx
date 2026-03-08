'use client';

import { FieldType, FIELD_TYPE_LABELS } from '@/lib/hooks/useForms';
import {
  FileText, AlignLeft, Hash, Mail, Phone, Link, Calendar, Clock, CalendarClock,
  List, ListChecks, CircleDot, CheckSquare, Upload, Star, SlidersHorizontal,
  ToggleLeft, Grid3X3, PenTool, ArrowUpDown, Heading, Type, Minus,
  Image as ImageIcon, Video, AudioLines, Code, Eye, EyeOff, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type FormFieldInput } from './FieldEditor';
import { FieldEditor } from './FieldEditor';

interface FieldTypeSelectorProps {
  onSelect: (type: FieldType) => void;
  onSelectField?: (field: FormFieldInput) => void;
  onClose?: () => void;
  editingField?: FormFieldInput | null;
  onUpdateField?: (updates: Partial<FormFieldInput>) => void;
  onSaveField?: () => void;
  mode?: 'select' | 'edit';
}

const FIELD_CATEGORIES = [
  {
    label: 'الإدخال',
    fields: [
      { type: FieldType.TEXT, icon: FileText },
      { type: FieldType.TEXTAREA, icon: AlignLeft },
      { type: FieldType.NUMBER, icon: Hash },
      { type: FieldType.EMAIL, icon: Mail },
      { type: FieldType.PHONE, icon: Phone },
      { type: FieldType.URL, icon: Link },
    ],
  },
  {
    label: 'التاريخ والوقت',
    fields: [
      { type: FieldType.DATE, icon: Calendar },
      { type: FieldType.TIME, icon: Clock },
      { type: FieldType.DATETIME, icon: CalendarClock },
    ],
  },
  {
    label: 'الاختيار',
    fields: [
      { type: FieldType.SELECT, icon: List },
      { type: FieldType.MULTISELECT, icon: ListChecks },
      { type: FieldType.RADIO, icon: CircleDot },
      { type: FieldType.CHECKBOX, icon: CheckSquare },
      { type: FieldType.TOGGLE, icon: ToggleLeft },
    ],
  },
  {
    label: 'متقدم',
    fields: [
      { type: FieldType.FILE, icon: Upload },
      { type: FieldType.RATING, icon: Star },
      { type: FieldType.SCALE, icon: SlidersHorizontal },
      { type: FieldType.MATRIX, icon: Grid3X3 },
      { type: FieldType.SIGNATURE, icon: PenTool },
      { type: FieldType.RANKING, icon: ArrowUpDown },
    ],
  },
  {
    label: 'المظهر',
    fields: [
      { type: FieldType.HEADING, icon: Heading },
      { type: FieldType.PARAGRAPH, icon: Type },
      { type: FieldType.DIVIDER, icon: Minus },
      { type: FieldType.IMAGE, icon: ImageIcon },
      { type: FieldType.VIDEO, icon: Video },
    ],
  },
  {
    label: 'خاص',
    fields: [
      { type: FieldType.HIDDEN, icon: EyeOff },
      { type: FieldType.RECAPTCHA, icon: ShieldCheck },
    ],
  },
];

export function FieldTypeSelector({ onSelect, onSelectField, onClose, editingField, onUpdateField, onSaveField, mode = 'select' }: FieldTypeSelectorProps) {
  // Edit mode - show inline editor (desktop only)
  if (mode === 'edit' && editingField) {
    return (
      <div className="hidden sm:block bg-card border border-border rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-foreground">
            تعديل: {FIELD_TYPE_LABELS[editingField.type]}
          </h4>
          <button
            type="button"
            onClick={onSaveField}
            className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            تم
          </button>
        </div>
        <FieldEditor
          field={editingField}
          onChange={(updates) => onUpdateField?.(updates)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {FIELD_CATEGORIES.map((category) => (
        <div key={category.label}>
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {category.label}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {category.fields.map(({ type, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => onSelect(type)}
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors text-right"
              >
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <span className="truncate text-xs">{FIELD_TYPE_LABELS[type]}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
