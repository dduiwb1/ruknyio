'use client';

import { motion } from 'framer-motion';
import { FileText, Plus, ClipboardList, MessageSquareText, UserPlus, Star, ShoppingBag, HelpCircle } from 'lucide-react';

interface EmptyFormsStateProps {
  onCreateForm: () => void;
}

const FORM_SUGGESTIONS = [
  { icon: MessageSquareText, label: 'استبيان رضا العملاء', color: 'text-violet-500', bg: 'bg-violet-500' },
  { icon: UserPlus, label: 'نموذج تسجيل', color: 'text-emerald-500', bg: 'bg-emerald-500' },
  { icon: Star, label: 'نموذج تقييم', color: 'text-amber-500', bg: 'bg-amber-500' },
  { icon: ClipboardList, label: 'نموذج طلب', color: 'text-sky-500', bg: 'bg-sky-500' },
  { icon: ShoppingBag, label: 'طلب شراء', color: 'text-orange-500', bg: 'bg-orange-500' },
  { icon: HelpCircle, label: 'اختبار', color: 'text-pink-500', bg: 'bg-pink-500' },
];

export function EmptyFormsState({ onCreateForm }: EmptyFormsStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl  bg-card p-8 sm:p-12 text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-2xl bg-violet-500 flex items-center justify-center"
      >
        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg sm:text-xl font-bold text-foreground mb-2"
      >
        ابدأ بإنشاء نموذجك الأول
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto"
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
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>إنشاء نموذج جديد</span>
      </motion.button>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-border/50"
      >
        <p className="text-xs text-muted-foreground mb-4">أفكار للبدء</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {FORM_SUGGESTIONS.map((suggestion, index) => (
            <motion.button
              key={suggestion.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={onCreateForm}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-xs text-foreground transition-colors border border-border/50"
            >
              <span className={`w-5 h-5 rounded-md ${suggestion.bg} flex items-center justify-center`}>
                <suggestion.icon className="w-3 h-3 text-white" />
              </span>
              <span>{suggestion.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
