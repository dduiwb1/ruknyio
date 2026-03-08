'use client';

import { motion } from 'framer-motion';
import { FileText, Plus, ClipboardList, MessageSquareText, UserPlus, Star, Sparkles } from 'lucide-react';

interface EmptyFormsStateProps {
  onCreateForm: () => void;
}

const FORM_SUGGESTIONS = [
  { icon: MessageSquareText, label: 'استبيان رضا العملاء', color: 'text-purple-500', bg: 'bg-purple-100' },
  { icon: UserPlus, label: 'نموذج تسجيل', color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { icon: Star, label: 'نموذج تقييم', color: 'text-amber-500', bg: 'bg-amber-100' },
  { icon: ClipboardList, label: 'نموذج طلب', color: 'text-blue-500', bg: 'bg-blue-100' },
];

export function EmptyFormsState({ onCreateForm }: EmptyFormsStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-muted/30 p-8 sm:p-12 text-center relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center relative"
      >
        <FileText className="w-12 h-12 sm:w-14 sm:h-14 text-blue-500" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-3xl border-2 border-dashed border-blue-200"
        />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl sm:text-2xl font-bold text-foreground mb-2"
      >
        ابدأ بإنشاء نموذجك الأول
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto"
      >
        أنشئ نماذج احترافية واجمع البيانات من المستخدمين بسهولة
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreateForm}
        className="inline-flex items-center gap-2.5 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all shadow-lg shadow-foreground/20"
      >
        <Plus className="w-5 h-5" />
        <span>إنشاء نموذج جديد</span>
        <Sparkles className="w-4 h-4 text-amber-300" />
      </motion.button>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 pt-8 border-t border-border"
      >
        <p className="text-xs text-muted-foreground mb-4">أفكار للبدء</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {FORM_SUGGESTIONS.map((suggestion, index) => (
            <motion.button
              key={suggestion.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={onCreateForm}
              className="inline-flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-full text-xs text-muted-foreground transition-all border border-border"
            >
              <span className={`w-5 h-5 rounded-full ${suggestion.bg} flex items-center justify-center`}>
                <suggestion.icon className={`w-3 h-3 ${suggestion.color}`} />
              </span>
              <span>{suggestion.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
