'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { FieldEditor, type FormFieldInput } from './FieldEditor';
import { FIELD_TYPE_LABELS, FieldType } from '@/lib/hooks/useForms';

interface FieldEditorDialogProps {
  field: FormFieldInput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<FormFieldInput>) => void;
  onSave: () => void;
}

export function FieldEditorDialog({ field, open, onOpenChange, onUpdate, onSave }: FieldEditorDialogProps) {
  if (!field || !open) return null;

  return (
    <AnimatePresence>
      {/* Only show on mobile */}
      <div className="sm:hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card border-t border-border/50 shadow-xl"
          dir="rtl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/30 bg-card px-4 py-3">
            <h3 className="text-sm font-bold text-foreground">
              تعديل: {FIELD_TYPE_LABELS[field.type]}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { onSave(); onOpenChange(false); }}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Check className="size-3.5" />
                تم
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <FieldEditor
              field={field}
              onChange={onUpdate}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
