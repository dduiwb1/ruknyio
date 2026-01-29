'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Wrench, 
  MessageSquare, 
  FileText,
  Globe,
  Check
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
// Icon Map
// ============================================

const iconMap: Record<string, React.ReactNode> = {
  'mail': <Mail className="w-5 h-5" />,
  'wrench': <Wrench className="w-5 h-5" />,
  'message-square': <MessageSquare className="w-5 h-5" />,
};

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  'blue': {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  'orange': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  'purple': {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800',
    icon: 'text-violet-600 dark:text-violet-400',
  },
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
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold text-foreground">اختر قالباً</h2>
        <div className="flex items-center justify-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <div className="flex rounded-full bg-muted p-0.5">
            <button
              onClick={() => handleLanguageChange('ar')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                selectedLanguage === 'ar' 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              عربي
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                selectedLanguage === 'en' 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FORM_TEMPLATES.map((template, index) => {
          const colors = colorMap[template.color] || colorMap.blue;
          const isSelected = selectedTemplateId === template.id;
          
          return (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelectTemplate(template)}
              className={cn(
                "relative p-3 rounded-xl border-2 text-center transition-all",
                colors.bg,
                isSelected 
                  ? "border-primary ring-2 ring-primary/20" 
                  : colors.border + " hover:border-primary/50"
              )}
            >
              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}

              {/* Icon */}
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1", colors.icon)}>
                {iconMap[template.icon]}
              </div>

              {/* Name */}
              <h3 className="text-xs font-medium text-foreground mb-0.5 line-clamp-1">
                {template.name[selectedLanguage]}
              </h3>

              {/* Fields Count */}
              <p className="text-[10px] text-muted-foreground">
                {template.fields.length} حقول
              </p>
            </motion.button>
          );
        })}

        {/* Start from Scratch */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={onStartFromScratch}
          className={cn(
            "relative p-3 rounded-xl border-2 border-dashed text-center transition-all",
            "bg-muted/20 border-muted-foreground/20 hover:border-primary/50",
            selectedTemplateId === null && "border-primary ring-2 ring-primary/20 bg-primary/5"
          )}
        >
          {selectedTemplateId === null && (
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}

          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 text-muted-foreground">
            <FileText className="w-4 h-4" />
          </div>

          <h3 className="text-xs font-medium text-foreground mb-0.5">
            من الصفر
          </h3>

          <p className="text-[10px] text-muted-foreground">
            نموذج فارغ
          </p>
        </motion.button>
      </div>
    </div>
  );
}

export default FormTemplateSelector;
