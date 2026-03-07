'use client';

import { FileText, Plus } from 'lucide-react';

interface EmptyFormsStateProps {
  onCreateForm: () => void;
}

export function EmptyFormsState({ onCreateForm }: EmptyFormsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/20 border border-dashed border-border/50 p-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-violet-500/10 mb-4">
        <FileText className="size-8 text-violet-500" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">لا توجد نماذج بعد</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-xs">
        ابدأ بإنشاء أول نموذج لجمع البيانات والآراء من عملائك
      </p>
      <button
        type="button"
        onClick={onCreateForm}
        className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
      >
        <Plus className="size-4" />
        <span>إنشاء نموذج</span>
      </button>
    </div>
  );
}
