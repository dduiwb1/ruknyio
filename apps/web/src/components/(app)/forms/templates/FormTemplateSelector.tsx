'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Wrench, 
  MessageSquare, 
  FileText,
  Globe,
  Check,
  ClipboardList,
  UserPlus,
  ShoppingBag,
  Star,
  HelpCircle,
  FormInput,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  FORM_TEMPLATES, 
  FormTemplate, 
  TemplateLanguage,
  convertTemplateToFields 
} from './templateData';
import type { FormFieldInput } from '../FieldEditor';

// ============================================
// Types
// ============================================

interface FormTemplateSelectorProps {
  selectedTemplateId: string | null;
  selectedLanguage: TemplateLanguage;
  onSelectTemplate: (templateId: string | null, fields: FormFieldInput[]) => void;
  onLanguageChange: (language: TemplateLanguage) => void;
  onStartFromScratch: () => void;
}

// ============================================
// Icon Map - Updated with more icons
// ============================================

const iconMap: Record<string, React.ElementType> = {
  'mail': Mail,
  'wrench': Wrench,
  'message-square': MessageSquare,
  'clipboard-list': ClipboardList,
  'user-plus': UserPlus,
  'shopping-bag': ShoppingBag,
  'star': Star,
  'help-circle': HelpCircle,
  'form-input': FormInput,
  'file-text': FileText,
};

// ============================================
// Component
// ============================================

export function FormTemplateSelector({
  selectedTemplateId,
  selectedLanguage,
  onSelectTemplate,
  onLanguageChange,
  onStartFromScratch,
}: FormTemplateSelectorProps) {
  
  const handleSelectTemplate = (template: FormTemplate) => {
    const fields = convertTemplateToFields(template, selectedLanguage);
    onSelectTemplate(template.id, fields as FormFieldInput[]);
  };

  const handleLanguageChange = (language: TemplateLanguage) => {
    onLanguageChange(language);
    if (selectedTemplateId) {
      const template = FORM_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (template) {
        const fields = convertTemplateToFields(template, language);
        onSelectTemplate(template.id, fields as FormFieldInput[]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <p className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium px-3 py-1 rounded-full inline-block">
          الخطوة 1 من 5
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">اختر قالباً</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          ابدأ بقالب جاهز أو أنشئ نموذجك من الصفر
        </p>
        
        {/* Language Switcher */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <div className="flex rounded-full bg-gray-100 dark:bg-gray-800 p-0.5">
            <button
              type="button"
              onClick={() => handleLanguageChange('ar')}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedLanguage === 'ar' 
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              عربي
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedLanguage === 'en' 
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid - FormCard Style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {FORM_TEMPLATES.map((template, index) => {
          const isSelected = selectedTemplateId === template.id;
          const IconComponent = iconMap[template.icon] || FileText;
          
          return (
            <motion.button
              key={template.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => handleSelectTemplate(template)}
              className={cn(
                "relative bg-white dark:bg-gray-800 rounded-2xl border p-3 text-right transition-all duration-200 group cursor-pointer",
                isSelected 
                  ? "border-gray-900 dark:border-white ring-2 ring-gray-900/10 dark:ring-white/10 shadow-lg" 
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
              )}
            >
              {/* Image/Icon Section - Similar to FormCard */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden mb-3">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center",
                    "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm"
                  )}>
                    <IconComponent className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                  </div>
                </div>

                {/* Selected Badge */}
                {isSelected && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    محدد
                  </span>
                )}

                {/* Fields Count Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400">
                  {template.fields.length} حقول
                </span>
              </div>

              {/* Content Section */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-[14px] leading-tight line-clamp-1 mb-1">
                  {template.name[selectedLanguage]}
                </h3>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {template.description[selectedLanguage]}
                </p>
              </div>
            </motion.button>
          );
        })}

        {/* Start from Scratch - FormCard Style */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ y: -2 }}
          onClick={onStartFromScratch}
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed p-3 text-right transition-all duration-200 group cursor-pointer",
            selectedTemplateId === null 
              ? "border-gray-900 dark:border-white ring-2 ring-gray-900/10 dark:ring-white/10 shadow-lg bg-gray-50 dark:bg-gray-800" 
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md"
          )}
        >
          {/* Image/Icon Section */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden mb-3">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600"
              )}>
                <FileText className="w-7 h-7 text-gray-400" />
              </div>
            </div>

            {/* Selected Badge */}
            {selectedTemplateId === null && (
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center gap-1">
                <Check className="w-3 h-3" />
                محدد
              </span>
            )}
          </div>

          {/* Content Section */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-[14px] leading-tight mb-1">
              ابدأ من الصفر
            </h3>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              أنشئ نموذجك المخصص بدون قالب
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

export default FormTemplateSelector;
