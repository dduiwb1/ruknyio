/**
 * Forms Hook - Stub for missing implementation
 * TODO: Implement full forms management logic
 */

export enum FormType {
  CONTACT = 'CONTACT',
  SURVEY = 'SURVEY',
  REGISTRATION = 'REGISTRATION',
  ORDER = 'ORDER',
  FEEDBACK = 'FEEDBACK',
  QUIZ = 'QUIZ',
  APPLICATION = 'APPLICATION',
  BOOKING = 'BOOKING',
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
}

export enum FieldType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  URL = 'URL',
  DATE = 'DATE',
  TIME = 'TIME',
  DATETIME = 'DATETIME',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  FILE = 'FILE',
  RATING = 'RATING',
  RANGE = 'RANGE',
}

export const FORM_TYPE_LABELS: Record<FormType, string> = {
  [FormType.CONTACT]: 'نموذج تواصل',
  [FormType.SURVEY]: 'استبيان',
  [FormType.REGISTRATION]: 'تسجيل',
  [FormType.ORDER]: 'طلب',
  [FormType.FEEDBACK]: 'ملاحظات',
  [FormType.QUIZ]: 'اختبار',
  [FormType.APPLICATION]: 'طلب توظيف',
  [FormType.BOOKING]: 'حجز',
};

export const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  [FormStatus.DRAFT]: 'مسودة',
  [FormStatus.ACTIVE]: 'نشط',
  [FormStatus.PAUSED]: 'متوقف',
  [FormStatus.CLOSED]: 'مغلق',
};

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  [FieldType.TEXT]: 'نص',
  [FieldType.TEXTAREA]: 'نص طويل',
  [FieldType.NUMBER]: 'رقم',
  [FieldType.EMAIL]: 'بريد إلكتروني',
  [FieldType.PHONE]: 'هاتف',
  [FieldType.URL]: 'رابط',
  [FieldType.DATE]: 'تاريخ',
  [FieldType.TIME]: 'وقت',
  [FieldType.DATETIME]: 'تاريخ ووقت',
  [FieldType.SELECT]: 'قائمة منسدلة',
  [FieldType.MULTISELECT]: 'اختيار متعدد',
  [FieldType.RADIO]: 'خيار واحد',
  [FieldType.CHECKBOX]: 'مربعات اختيار',
  [FieldType.FILE]: 'ملف',
  [FieldType.RATING]: 'تقييم',
  [FieldType.RANGE]: 'مدى',
};

export const FORM_STATUS_CONFIG = {
  [FormStatus.DRAFT]: { color: 'gray', icon: 'FileEdit' },
  [FormStatus.ACTIVE]: { color: 'green', icon: 'CheckCircle' },
  [FormStatus.PAUSED]: { color: 'yellow', icon: 'Pause' },
  [FormStatus.CLOSED]: { color: 'red', icon: 'XCircle' },
};

export const FORM_TYPE_CONFIG = {
  [FormType.CONTACT]: { color: 'blue', icon: 'Mail' },
  [FormType.SURVEY]: { color: 'purple', icon: 'BarChart3' },
  [FormType.REGISTRATION]: { color: 'green', icon: 'UserPlus' },
  [FormType.ORDER]: { color: 'orange', icon: 'ShoppingCart' },
  [FormType.FEEDBACK]: { color: 'pink', icon: 'MessageSquare' },
  [FormType.QUIZ]: { color: 'indigo', icon: 'HelpCircle' },
  [FormType.APPLICATION]: { color: 'cyan', icon: 'Briefcase' },
  [FormType.BOOKING]: { color: 'teal', icon: 'Calendar' },
};

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: Record<string, unknown>;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedAt: string;
  ipAddress?: string;
}

export interface Form {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: FormType;
  status: FormStatus;
  fields: FormField[];
  submissions?: FormSubmission[];
  submissionsCount?: number;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormsFilters {
  search: string;
  status?: FormStatus;
  type?: FormType;
}

export type FormsSortOption = 'newest' | 'oldest' | 'most-submissions' | 'alphabetical';

export interface FormsStats {
  totalForms: number;
  activeForms: number;
  totalSubmissions: number;
  totalViews: number;
}

export function filterForms(forms: Form[], filters: FormsFilters): Form[] {
  return forms.filter(form => {
    if (filters.search && !form.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && form.status !== filters.status) {
      return false;
    }
    if (filters.type && form.type !== filters.type) {
      return false;
    }
    return true;
  });
}

export function sortForms(forms: Form[], sortBy: FormsSortOption): Form[] {
  const sorted = [...forms];
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'most-submissions':
      return sorted.sort((a, b) => (b.submissionsCount || 0) - (a.submissionsCount || 0));
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    default:
      return sorted;
  }
}

export function calculateFormsStats(forms: Form[]): FormsStats {
  return {
    totalForms: forms.length,
    activeForms: forms.filter(f => f.status === FormStatus.ACTIVE).length,
    totalSubmissions: forms.reduce((sum, f) => sum + (f.submissionsCount || 0), 0),
    totalViews: forms.reduce((sum, f) => sum + (f.viewsCount || 0), 0),
  };
}

export function useForms() {
  // Stub hook - implement actual API calls
  return {
    forms: [] as Form[],
    isLoading: false,
    error: null as string | null,
    createForm: async (data: Partial<Form>) => ({ id: 'stub' }),
    updateForm: async (id: string, data: Partial<Form>) => {},
    deleteForm: async (id: string) => {},
    getForm: async (id: string) => null as Form | null,
  };
}
