'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  Plus, GripVertical, Trash2, Edit2, ChevronDown, ChevronUp, FileText, Copy,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FieldType, FIELD_TYPE_LABELS } from '@/lib/hooks/useForms';
import { cn } from '@/lib/utils';
import { FieldTypeSelector } from './FieldTypeSelector';
import { FieldEditor, type FormFieldInput } from './FieldEditor';

export interface FormStepInput {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormFieldInput[];
}

interface StepEditorProps {
  steps: FormStepInput[];
  onStepsChange: (steps: FormStepInput[]) => void;
}

export function StepEditor({ steps, onStepsChange }: StepEditorProps) {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(
    steps.length > 0 ? steps[0].id : null
  );
  const [showFieldSelectorForStep, setShowFieldSelectorForStep] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ stepId: string; fieldId: string } | null>(null);

  const handleAddStep = () => {
    const newStep: FormStepInput = {
      id: `step-${Date.now()}`,
      title: `الخطوة ${steps.length + 1}`,
      description: '',
      order: steps.length,
      fields: [],
    };
    onStepsChange([...steps, newStep]);
    setExpandedStepId(newStep.id);
  };

  const handleDeleteStep = (stepId: string) => {
    const updated = steps
      .filter((s) => s.id !== stepId)
      .map((s, i) => ({ ...s, order: i }));
    onStepsChange(updated);
    if (expandedStepId === stepId) {
      setExpandedStepId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleUpdateStep = (stepId: string, updates: Partial<FormStepInput>) => {
    onStepsChange(steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)));
  };

  const handleAddFieldToStep = (stepId: string, type: FieldType) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    const newField: FormFieldInput = {
      id: `field-${Date.now()}`,
      label: '',
      type,
      order: step.fields.length,
      required: false,
      placeholder: '',
      options:
        type === FieldType.SELECT || type === FieldType.RADIO || type === FieldType.CHECKBOX
          ? ['خيار 1', 'خيار 2', 'خيار 3']
          : undefined,
      minValue: type === FieldType.RATING ? 1 : type === FieldType.SCALE ? 0 : undefined,
      maxValue: type === FieldType.RATING ? 5 : type === FieldType.SCALE ? 10 : undefined,
    };

    handleUpdateStep(stepId, { fields: [...step.fields, newField] });
    setShowFieldSelectorForStep(null);
  };

  const handleUpdateFieldInStep = (stepId: string, fieldId: string, updates: Partial<FormFieldInput>) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;
    const updatedFields = step.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f));
    handleUpdateStep(stepId, { fields: updatedFields });
  };

  const handleDeleteFieldInStep = (stepId: string, fieldId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;
    const updatedFields = step.fields
      .filter((f) => f.id !== fieldId)
      .map((f, i) => ({ ...f, order: i }));
    handleUpdateStep(stepId, { fields: updatedFields });
    if (editingField?.stepId === stepId && editingField?.fieldId === fieldId) {
      setEditingField(null);
    }
  };

  const handleDuplicateFieldInStep = (stepId: string, fieldId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;
    const field = step.fields.find((f) => f.id === fieldId);
    if (!field) return;
    const newField: FormFieldInput = {
      ...field,
      id: `field-${Date.now()}`,
      label: `${field.label} (نسخة)`,
      order: step.fields.length,
    };
    handleUpdateStep(stepId, { fields: [...step.fields, newField] });
  };

  const handleReorderFieldsInStep = (stepId: string, newFields: FormFieldInput[]) => {
    handleUpdateStep(stepId, {
      fields: newFields.map((f, i) => ({ ...f, order: i })),
    });
  };

  return (
    <div className="space-y-3">
      {steps.map((step, stepIndex) => {
        const isExpanded = expandedStepId === step.id;

        return (
          <div
            key={step.id}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            {/* Step Header */}
            <div
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
            >
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                {stepIndex + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {step.title || `الخطوة ${stepIndex + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.fields.length} حقول
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteStep(step.id); }}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 pt-0 space-y-3 border-t border-border/30">
                    {/* Step Title & Description */}
                    <div className="space-y-2">
                      <Input
                        value={step.title}
                        onChange={(e) => handleUpdateStep(step.id, { title: e.target.value })}
                        placeholder="عنوان الخطوة"
                        className="h-10 rounded-xl text-sm"
                      />
                      <Textarea
                        value={step.description || ''}
                        onChange={(e) => handleUpdateStep(step.id, { description: e.target.value })}
                        placeholder="وصف الخطوة (اختياري)"
                        rows={2}
                        className="rounded-xl text-sm resize-none"
                      />
                    </div>

                    {/* Fields List */}
                    {step.fields.length > 0 ? (
                      <Reorder.Group
                        axis="y"
                        values={step.fields}
                        onReorder={(newFields) => handleReorderFieldsInStep(step.id, newFields)}
                        className="space-y-1.5"
                      >
                        {step.fields.map((field, fieldIndex) => (
                          <StepFieldItem
                            key={field.id}
                            field={field}
                            index={fieldIndex}
                            onEdit={() => setEditingField(
                              editingField?.fieldId === field.id ? null : { stepId: step.id, fieldId: field.id }
                            )}
                            onDuplicate={() => handleDuplicateFieldInStep(step.id, field.id)}
                            onDelete={() => handleDeleteFieldInStep(step.id, field.id)}
                            isEditing={editingField?.stepId === step.id && editingField?.fieldId === field.id}
                            onUpdateField={(updates) => handleUpdateFieldInStep(step.id, field.id, updates)}
                          />
                        ))}
                      </Reorder.Group>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground">لم تقم بإضافة حقول لهذه الخطوة</p>
                      </div>
                    )}

                    {/* Add Field */}
                    {showFieldSelectorForStep === step.id ? (
                      <div className="border border-border rounded-xl p-3 bg-muted/20">
                        <FieldTypeSelector
                          onSelect={(type) => handleAddFieldToStep(step.id, type)}
                          onClose={() => setShowFieldSelectorForStep(null)}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowFieldSelectorForStep(step.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-border hover:border-primary/50 rounded-xl text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة حقل
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Add Step Button */}
      <button
        type="button"
        onClick={handleAddStep}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl transition-all font-medium shadow-lg shadow-gray-900/25 dark:shadow-white/25"
      >
        <Plus className="w-5 h-5" />
        إضافة خطوة جديدة
      </button>
    </div>
  );
}

// ---- Step Field Item ----

interface StepFieldItemProps {
  field: FormFieldInput;
  index: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isEditing: boolean;
  onUpdateField: (updates: Partial<FormFieldInput>) => void;
}

function StepFieldItem({ field, index, onEdit, onDuplicate, onDelete, isEditing, onUpdateField }: StepFieldItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={dragControls}
      layout="position"
      className="bg-background rounded-lg border border-border/50"
    >
      <div className="flex items-center gap-2 p-2">
        <div
          className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors select-none"
          onPointerDown={(e) => { e.preventDefault(); dragControls.start(e); }}
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="w-5 h-5 rounded-full bg-primary/80 text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-foreground truncate block">
            {field.label || 'بدون عنوان'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {FIELD_TYPE_LABELS[field.type as FieldType]}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={onEdit} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button type="button" onClick={onDuplicate} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button type="button" onClick={onDelete} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Inline Editor */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="p-3">
              <FieldEditor field={field} onChange={onUpdateField} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}
