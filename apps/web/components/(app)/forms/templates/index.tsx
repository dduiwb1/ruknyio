'use client';

import { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { type FormFieldInput } from '../FieldEditor';
import { FieldType } from '@/lib/hooks/useForms';

// ============================================
// Types
// ============================================

export type TemplateLanguage = 'ar' | 'en';

export interface FormTemplate {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  category: string;
  fields: FormFieldInput[];
  icon?: React.ElementType;
}

// ============================================
// Templates Data
// ============================================

const TEMPLATES: FormTemplate[] = [
  {
    id: 'contact',
    name: {
      ar: 'نموذج اتصال',
      en: 'Contact Form',
    },
    description: {
      ar: 'نموذج بسيط للتواصل مع العملاء',
      en: 'Simple contact form for customers',
    },
    category: 'business',
    fields: [
      {
        id: '1',
        label: 'الاسم الكامل',
        type: FieldType.TEXT,
        required: true,
        order: 0,
        placeholder: 'أدخل اسمك',
      },
      {
        id: '2',
        label: 'البريد الإلكتروني',
        type: FieldType.EMAIL,
        required: true,
        order: 1,
        placeholder: 'example@domain.com',
      },
      {
        id: '3',
        label: 'الرسالة',
        type: FieldType.TEXTAREA,
        required: true,
        order: 2,
        placeholder: 'اكتب رسالتك هنا',
      },
    ],
  },
  {
    id: 'feedback',
    name: {
      ar: 'استطلاع رضا العملاء',
      en: 'Customer Satisfaction Survey',
    },
    description: {
      ar: 'قياس رضا العملاء عن الخدمة',
      en: 'Measure customer satisfaction',
    },
    category: 'survey',
    fields: [
      {
        id: '1',
        label: 'كيف تقيم تجربتك معنا؟',
        type: FieldType.RATING,
        required: true,
        order: 0,
        minValue: 1,
        maxValue: 5,
      },
      {
        id: '2',
        label: 'ما مدى احتمالية توصيتك بنا؟',
        type: FieldType.SCALE,
        required: true,
        order: 1,
        minValue: 0,
        maxValue: 10,
      },
      {
        id: '3',
        label: 'أخبرنا بتجربتك',
        type: FieldType.TEXTAREA,
        required: false,
        order: 2,
        placeholder: 'ملاحظاتك واقتراحاتك',
      },
    ],
  },
  {
    id: 'registration',
    name: {
      ar: 'نموذج تسجيل',
      en: 'Registration Form',
    },
    description: {
      ar: 'نموذج تسجيل شامل للفعاليات والمؤتمرات',
      en: 'Complete registration form for events',
    },
    category: 'registration',
    fields: [
      {
        id: '1',
        label: 'الاسم الكامل',
        type: FieldType.TEXT,
        required: true,
        order: 0,
      },
      {
        id: '2',
        label: 'البريد الإلكتروني',
        type: FieldType.EMAIL,
        required: true,
        order: 1,
      },
      {
        id: '3',
        label: 'رقم الهاتف',
        type: FieldType.PHONE,
        required: true,
        order: 2,
      },
      {
        id: '4',
        label: 'المدينة',
        type: FieldType.TEXT,
        required: false,
        order: 3,
      },
    ],
  },
];

// ============================================
// Helper Functions
// ============================================

export function getTemplateById(id: string): FormTemplate | undefined {
  return TEMPLATES.find(t => t.id === id);
}

export function getAllTemplates(): FormTemplate[] {
  return TEMPLATES;
}

// ============================================
// Template Selector Component
// ============================================

interface FormTemplateSelectorProps {
  selectedTemplateId: string | null;
  selectedLanguage: TemplateLanguage;
  onSelectTemplate: (templateId: string | null, fields: FormFieldInput[]) => void;
  onStartFromScratch: () => void;
  onLanguageChange: (language: TemplateLanguage) => void;
}

export function FormTemplateSelector({
  selectedTemplateId,
  selectedLanguage,
  onSelectTemplate,
  onStartFromScratch,
  onLanguageChange,
}: FormTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = TEMPLATES.filter(template => {
    const name = template.name[selectedLanguage].toLowerCase();
    const description = template.description[selectedLanguage].toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || description.includes(query);
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Language Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">اختر قالب</h3>
        <div className="flex gap-2 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => onLanguageChange('ar')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedLanguage === 'ar'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            عربي
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedLanguage === 'en'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="ابحث عن قالب..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-violet-500"
      />

      {/* Start from Scratch */}
      <button
        type="button"
        onClick={onStartFromScratch}
        className={`w-full rounded-xl border-2 p-4 text-right transition-all ${
          selectedTemplateId === null
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-border bg-card hover:border-violet-500/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-500/10">
            <Sparkles className="w-6 h-6 text-violet-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-0.5">
              {selectedLanguage === 'ar' ? 'ابدأ من الصفر' : 'Start from Scratch'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {selectedLanguage === 'ar'
                ? 'أنشئ نموذجك الخاص من البداية'
                : 'Create your own form from scratch'}
            </p>
          </div>
        </div>
      </button>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(template.id, template.fields)}
            className={`rounded-xl border-2 p-4 text-right transition-all ${
              selectedTemplateId === template.id
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-border bg-card hover:border-violet-500/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1 text-right">
                  {template.name[selectedLanguage]}
                </h4>
                <p className="text-sm text-muted-foreground text-right">
                  {template.description[selectedLanguage]}
                </p>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {template.fields.length} {selectedLanguage === 'ar' ? 'حقول' : 'fields'}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {selectedLanguage === 'ar' ? 'لا توجد قوالب مطابقة' : 'No matching templates'}
          </p>
        </div>
      )}
    </div>
  );
}
