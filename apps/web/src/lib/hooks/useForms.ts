'use client';

import { useState, useCallback } from 'react';

// ==================== ENUMS ====================

export enum FormType {
  CONTACT = 'CONTACT',
  SURVEY = 'SURVEY',
  REGISTRATION = 'REGISTRATION',
  ORDER = 'ORDER',
  FEEDBACK = 'FEEDBACK',
  QUIZ = 'QUIZ',
  APPLICATION = 'APPLICATION',
  OTHER = 'OTHER',
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
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
  SCALE = 'SCALE',
  TOGGLE = 'TOGGLE',
  MATRIX = 'MATRIX',
  SIGNATURE = 'SIGNATURE',
  RANKING = 'RANKING',
  HEADING = 'HEADING',
  PARAGRAPH = 'PARAGRAPH',
  DIVIDER = 'DIVIDER',
  TITLE = 'TITLE',
  LABEL = 'LABEL',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  EMBED = 'EMBED',
  CONDITIONAL_LOGIC = 'CONDITIONAL_LOGIC',
  CALCULATED = 'CALCULATED',
  HIDDEN = 'HIDDEN',
  RECAPTCHA = 'RECAPTCHA',
}

// ==================== INTERFACES ====================

export interface FormField {
  id: string;
  formId: string;
  label: string;
  description?: string;
  type: FieldType;
  order: number;
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: any;
  validationRules?: any;
  conditionalLogic?: any;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  stepId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormStep {
  id: string;
  formId: string;
  title: string;
  description?: string;
  order: number;
  fields?: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  userId?: string;
  data: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  isCompleted: boolean;
  completedAt?: string;
  timeToComplete?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface Form {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description?: string;
  type: FormType;
  status: FormStatus;
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
  shuffleQuestions: boolean;
  maxSubmissions?: number;
  submissionLimit?: number;
  opensAt?: string;
  closesAt?: string;
  notifyOnSubmission: boolean;
  notificationEmail?: string;
  autoResponseEnabled: boolean;
  autoResponseMessage?: string;
  linkedEventId?: string;
  linkedStoreId?: string;
  linkedEvent?: { id: string; title: string };
  linkedStore?: { id: string; name: string };
  theme?: any;
  coverImage?: string;
  bannerImages?: string[];
  bannerDisplayMode?: string;
  viewCount: number;
  submissionCount: number;
  isMultiStep: boolean;
  webhookEnabled: boolean;
  webhookUrl?: string;
  webhookEvents?: string[];
  webhookSecret?: string;
  closeAfterDate: boolean;
  oneResponsePerUser: boolean;
  createdAt: string;
  updatedAt: string;
  fields?: FormField[];
  steps?: FormStep[];
  submissions?: FormSubmission[];
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count?: {
    submissions: number;
    fields: number;
  };
}

export interface FormsStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalSubmissions: number;
  totalViews: number;
}

export interface FormsFilters {
  status?: FormStatus;
  type?: FormType;
  search?: string;
  linkedEventId?: string;
  linkedStoreId?: string;
}

export type FormsSortOption = 'newest' | 'oldest' | 'name' | 'submissions' | 'views';

function normalizeFormsListResponse(payload: unknown): Form[] {
  if (Array.isArray(payload)) {
    return payload as Form[];
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.forms)) {
      return obj.forms as Form[];
    }

    if (Array.isArray(obj.data)) {
      return obj.data as Form[];
    }

    if (
      obj.data &&
      typeof obj.data === 'object' &&
      Array.isArray((obj.data as Record<string, unknown>).forms)
    ) {
      return (obj.data as Record<string, unknown>).forms as Form[];
    }
  }

  return [];
}

// ==================== LABELS ====================

export const FORM_TYPE_LABELS: Record<FormType, string> = {
  [FormType.CONTACT]: 'تواصل',
  [FormType.SURVEY]: 'استبيان',
  [FormType.REGISTRATION]: 'تسجيل',
  [FormType.ORDER]: 'طلب',
  [FormType.FEEDBACK]: 'تقييم',
  [FormType.QUIZ]: 'اختبار',
  [FormType.APPLICATION]: 'تقديم',
  [FormType.OTHER]: 'أخرى',
};

export const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  [FormStatus.DRAFT]: 'مسودة',
  [FormStatus.PUBLISHED]: 'منشور',
  [FormStatus.ARCHIVED]: 'مؤرشف',
  [FormStatus.CLOSED]: 'مغلق',
};

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  [FieldType.TEXT]: 'نص قصير',
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
  [FieldType.RADIO]: 'اختيار واحد',
  [FieldType.CHECKBOX]: 'مربع اختيار',
  [FieldType.FILE]: 'رفع ملف',
  [FieldType.RATING]: 'تقييم نجوم',
  [FieldType.SCALE]: 'مقياس',
  [FieldType.TOGGLE]: 'تبديل',
  [FieldType.MATRIX]: 'مصفوفة',
  [FieldType.SIGNATURE]: 'توقيع',
  [FieldType.RANKING]: 'ترتيب',
  [FieldType.HEADING]: 'عنوان',
  [FieldType.PARAGRAPH]: 'فقرة',
  [FieldType.DIVIDER]: 'فاصل',
  [FieldType.TITLE]: 'عنوان رئيسي',
  [FieldType.LABEL]: 'تسمية',
  [FieldType.IMAGE]: 'صورة',
  [FieldType.VIDEO]: 'فيديو',
  [FieldType.AUDIO]: 'صوت',
  [FieldType.EMBED]: 'تضمين',
  [FieldType.CONDITIONAL_LOGIC]: 'منطق شرطي',
  [FieldType.CALCULATED]: 'حقل محسوب',
  [FieldType.HIDDEN]: 'حقل مخفي',
  [FieldType.RECAPTCHA]: 'التحقق',
};

export const FORM_TYPE_CONFIG: Record<FormType, { icon: string; color: string; bg: string }> = {
  [FormType.CONTACT]: { icon: '📧', color: 'text-blue-600', bg: 'bg-blue-100' },
  [FormType.SURVEY]: { icon: '📊', color: 'text-purple-600', bg: 'bg-purple-100' },
  [FormType.REGISTRATION]: { icon: '📝', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  [FormType.ORDER]: { icon: '🛒', color: 'text-orange-600', bg: 'bg-orange-100' },
  [FormType.FEEDBACK]: { icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-100' },
  [FormType.QUIZ]: { icon: '🧠', color: 'text-pink-600', bg: 'bg-pink-100' },
  [FormType.APPLICATION]: { icon: '📋', color: 'text-indigo-600', bg: 'bg-indigo-100' },
  [FormType.OTHER]: { icon: '📄', color: 'text-gray-600', bg: 'bg-gray-100' },
};

export const FORM_STATUS_CONFIG: Record<FormStatus, { color: string; bg: string }> = {
  [FormStatus.DRAFT]: { color: 'text-muted-foreground', bg: 'bg-muted' },
  [FormStatus.PUBLISHED]: { color: 'text-emerald-700', bg: 'bg-emerald-100' },
  [FormStatus.ARCHIVED]: { color: 'text-amber-700', bg: 'bg-amber-100' },
  [FormStatus.CLOSED]: { color: 'text-destructive', bg: 'bg-destructive/10' },
};

// ==================== HELPERS ====================

export function filterForms(forms: Form[] | unknown, filters: FormsFilters): Form[] {
  const safeForms = Array.isArray(forms) ? (forms as Form[]) : [];
  return safeForms.filter((form) => {
    if (filters.status && form.status !== filters.status) return false;
    if (filters.type && form.type !== filters.type) return false;
    if (filters.linkedEventId && form.linkedEventId !== filters.linkedEventId) return false;
    if (filters.linkedStoreId && form.linkedStoreId !== filters.linkedStoreId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!form.title.toLowerCase().includes(q) && !form.description?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function sortForms(forms: Form[] | unknown, sortBy: FormsSortOption): Form[] {
  const sorted = Array.isArray(forms) ? ([...forms] as Form[]) : [];
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'name':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    case 'submissions':
      return sorted.sort((a, b) => (b.submissionCount || 0) - (a.submissionCount || 0));
    case 'views':
      return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    default:
      return sorted;
  }
}

export function calculateFormsStats(forms: Form[] | unknown): FormsStats {
  const safeForms = Array.isArray(forms) ? (forms as Form[]) : [];
  return {
    total: safeForms.length,
    published: safeForms.filter((f) => f.status === FormStatus.PUBLISHED).length,
    draft: safeForms.filter((f) => f.status === FormStatus.DRAFT).length,
    archived: safeForms.filter((f) => f.status === FormStatus.ARCHIVED).length,
    totalSubmissions: safeForms.reduce((sum, f) => sum + (f.submissionCount || 0), 0),
    totalViews: safeForms.reduce((sum, f) => sum + (f.viewCount || 0), 0),
  };
}

// ==================== API HELPERS ====================

const API_BASE = '/api/v1/forms';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    });
    if (res.status === 204) return null;
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (err) {
    throw err;
  }
}

// ==================== HOOK ====================

export function useForms() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMyForms = useCallback(async (filters?: FormsFilters): Promise<Form[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.type) params.set('type', filters.type);
      if (filters?.linkedEventId) params.set('linkedEventId', filters.linkedEventId);
      if (filters?.linkedStoreId) params.set('linkedStoreId', filters.linkedStoreId);
      const qs = params.toString();
      const data = await apiFetch<unknown>(`${qs ? `?${qs}` : ''}`);
      return normalizeFormsListResponse(data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل النماذج');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFormById = useCallback(async (id: string): Promise<Form | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiFetch<Form>(`/${id}`);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFormBySlug = useCallback(async (slug: string): Promise<Form | null> => {
    try {
      return await apiFetch<Form>(`/public/${slug}`);
    } catch {
      return null;
    }
  }, []);

  const createForm = useCallback(async (formData: Partial<Form>): Promise<Form | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiFetch<Form>('', { method: 'POST', body: JSON.stringify(formData) });
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateForm = useCallback(async (id: string, data: Partial<Form>): Promise<Form | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiFetch<Form>(`/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFormStatus = useCallback(async (id: string, status: FormStatus): Promise<Form | null> => {
    try {
      return await apiFetch<Form>(`/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    } catch {
      return null;
    }
  }, []);

  const deleteForm = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiFetch(`/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  }, []);

  const duplicateForm = useCallback(async (id: string): Promise<Form | null> => {
    try {
      return await apiFetch<Form>(`/${id}/duplicate`, { method: 'POST' });
    } catch {
      return null;
    }
  }, []);

  const getFormSubmissions = useCallback(
    async (formId: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.set('page', String(page));
      if (limit) params.set('limit', String(limit));
      const qs = params.toString();
      try {
        return await apiFetch<{ data: FormSubmission[]; total: number; page: number; limit: number }>(
          `/${formId}/submissions${qs ? `?${qs}` : ''}`,
        );
      } catch {
        return null;
      }
    },
    [],
  );

  const submitForm = useCallback(async (slug: string, data: Record<string, any>) => {
    try {
      return await apiFetch(`/public/${slug}/submit`, {
        method: 'POST',
        body: JSON.stringify({ data }),
      });
    } catch {
      return null;
    }
  }, []);

  const exportSubmissions = useCallback(async (formId: string, format: string = 'csv') => {
    try {
      const res = await fetch(`${API_BASE}/${formId}/export?format=${format}`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      return await res.blob();
    } catch {
      return null;
    }
  }, []);

  const getFormAnalytics = useCallback(async (formId: string) => {
    try {
      return await apiFetch(`/${formId}/analytics`);
    } catch {
      return null;
    }
  }, []);

  const getFormSteps = useCallback(async (formId: string): Promise<FormStep[] | null> => {
    try {
      return await apiFetch<FormStep[]>(`/${formId}/steps`);
    } catch {
      return null;
    }
  }, []);

  const updateFormSteps = useCallback(async (formId: string, steps: any[]) => {
    try {
      return await apiFetch(`/${formId}/steps`, {
        method: 'PUT',
        body: JSON.stringify({ steps }),
      });
    } catch {
      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    getMyForms,
    getFormById,
    getFormBySlug,
    createForm,
    updateForm,
    updateFormStatus,
    deleteForm,
    duplicateForm,
    getFormSubmissions,
    submitForm,
    exportSubmissions,
    getFormAnalytics,
    getFormSteps,
    updateFormSteps,
    filterForms,
    sortForms,
    calculateFormsStats: calculateFormsStats,
  };
}
