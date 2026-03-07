'use client';

import { toast as sonnerToast } from 'sonner';

/**
 * Toast API wrapper that the forms pages use.
 * Wraps sonner for consistent toast calls.
 */
export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  warning: (message: string) => sonnerToast.warning(message),
  info: (message: string) => sonnerToast.info(message),
  loading: (message: string) => sonnerToast.loading(message),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};

export const toastMessages = {
  saveSuccess: () => sonnerToast.success('تم الحفظ بنجاح'),
  createSuccess: (item?: string) => sonnerToast.success(`تم إنشاء ${item || 'العنصر'} بنجاح`),
  updateSuccess: (item?: string) => sonnerToast.success(`تم تحديث ${item || 'العنصر'} بنجاح`),
  deleteSuccess: (item?: string) => sonnerToast.success(`تم حذف ${item || 'العنصر'} بنجاح`),
  genericError: () => sonnerToast.error('حدث خطأ غير متوقع'),
  networkError: () => sonnerToast.error('خطأ في الاتصال بالشبكة'),
  formSubmitted: () => sonnerToast.success('تم إرسال النموذج بنجاح'),
  uploadSuccess: () => sonnerToast.success('تم رفع الملف بنجاح'),
  uploadError: () => sonnerToast.error('فشل رفع الملف'),
  fileTooLarge: () => sonnerToast.error('حجم الملف كبير جداً'),
};
