'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react';

interface DeleteFormModalProps {
  isOpen: boolean;
  formTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteFormModal({ 
  isOpen, 
  formTitle, 
  isDeleting,
  onConfirm, 
  onCancel 
}: DeleteFormModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative">
              {/* Close Button */}
              <button
                onClick={onCancel}
                className="absolute top-3 left-3 p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="p-6 pt-8 text-center">
                {/* Icon */}
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-destructive" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  حذف النموذج
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-1">
                  هل أنت متأكد من حذف
                </p>
                <p className="text-sm font-medium text-foreground mb-3">
                  "{formTitle}"
                </p>
                <p className="text-xs text-muted-foreground">
                  سيتم حذف جميع الحقول والإجابات المرتبطة بهذا النموذج
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 flex items-center gap-3 border-t border-border">
                <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحذف</span>
                    </>
                  ) : (
                    <span>حذف النموذج</span>
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
