'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteFormModalProps {
  isOpen: boolean;
  formTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteFormModal({ isOpen, formTitle, isDeleting, onConfirm, onCancel }: DeleteFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-card border border-border/50 p-6 shadow-xl" dir="rtl">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="size-7 text-destructive" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-center text-base font-bold text-foreground mb-2">حذف النموذج</h3>
              <p className="text-center text-sm text-muted-foreground mb-1">
                هل أنت متأكد من حذف
              </p>
              <p className="text-center text-sm font-semibold text-foreground mb-4">
                &ldquo;{formTitle}&rdquo;؟
              </p>
              <p className="text-center text-xs text-destructive/80 mb-6">
                سيتم حذف جميع البيانات والإجابات المرتبطة بهذا النموذج نهائياً.
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    'حذف'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
