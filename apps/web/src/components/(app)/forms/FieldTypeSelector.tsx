'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Type, AlignLeft, Hash, Mail, Phone, Calendar, Clock, List, CircleDot, CheckSquare, Paperclip, Star, SlidersHorizontal, ToggleLeft, Grid3X3, PenTool } from 'lucide-react';
import { FieldType, FIELD_TYPE_LABELS } from '@/lib/hooks/useForms';
import { cn } from '@/lib/utils';

interface FieldTypeSelectorProps {
  onSelect: (type: FieldType) => void;
  onClose: () => void;
}

interface FieldTypeGroup {
  title: string;
  types: {
    type: FieldType;
    icon: React.ElementType;
    description: string;
  }[];
}

const FIELD_GROUPS: FieldTypeGroup[] = [
  {
    title: 'حقول نصية',
    types: [
      { type: FieldType.TEXT, icon: Type, description: 'نص قصير في سطر واحد' },
      { type: FieldType.TEXTAREA, icon: AlignLeft, description: 'نص طويل متعدد الأسطر' },
      { type: FieldType.EMAIL, icon: Mail, description: 'بريد إلكتروني مع التحقق' },
      { type: FieldType.PHONE, icon: Phone, description: 'رقم هاتف' },
    ],
  },
  {
    title: 'أرقام وتواريخ',
    types: [
      { type: FieldType.NUMBER, icon: Hash, description: 'إدخال رقمي' },
      { type: FieldType.DATE, icon: Calendar, description: 'اختيار تاريخ' },
      { type: FieldType.TIME, icon: Clock, description: 'اختيار وقت' },
      { type: FieldType.DATETIME, icon: Calendar, description: 'تاريخ ووقت معاً' },
    ],
  },
  {
    title: 'اختيارات',
    types: [
      { type: FieldType.SELECT, icon: List, description: 'قائمة منسدلة' },
      { type: FieldType.RADIO, icon: CircleDot, description: 'اختيار واحد من متعدد' },
      { type: FieldType.CHECKBOX, icon: CheckSquare, description: 'اختيار متعدد' },
      { type: FieldType.TOGGLE, icon: ToggleLeft, description: 'نعم/لا' },
    ],
  },
  {
    title: 'متقدمة',
    types: [
      { type: FieldType.FILE, icon: Paperclip, description: 'رفع ملف' },
      { type: FieldType.RATING, icon: Star, description: 'تقييم بالنجوم' },
      { type: FieldType.SCALE, icon: SlidersHorizontal, description: 'مقياس رقمي' },
      { type: FieldType.MATRIX, icon: Grid3X3, description: 'جدول اختيارات' },
      { type: FieldType.SIGNATURE, icon: PenTool, description: 'توقيع يدوي' },
    ],
  },
];

export function FieldTypeSelector({ onSelect, onClose }: FieldTypeSelectorProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">إضافة حقل جديد</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {FIELD_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-medium text-gray-500 mb-3">{group.title}</h4>
              <div className="grid grid-cols-2 gap-2">
                {group.types.map(({ type, icon: Icon, description }) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(type)}
                    className="flex items-start gap-3 p-3 text-right bg-gray-50 hover:bg-gray-100 rounded-xl border border-transparent hover:border-amber-500/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{FIELD_TYPE_LABELS[type]}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
