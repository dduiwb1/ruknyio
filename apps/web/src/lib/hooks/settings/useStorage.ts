'use client';

import { useState, useCallback } from 'react';
import { getApiClient } from '@/lib/api/client';

// Types
export interface StorageUsage {
  used: number;
  limit: number;
  available: number;
  percentage: number;
  files: number;
  /** حجم الملفات في سلة المهملات (تُحسب ضمن used حتى الحذف النهائي) */
  trashUsed?: number;
  /** استخدام التخزين حسب النوع (الفئة → الحجم بالبايت) */
  categoryBreakdown?: Record<string, number>;
}

export interface UserFile {
  id: string;
  key: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: FileCategory;
  entityId?: string;
  url: string;
  createdAt: string;
  /** تاريخ الحذف الناعم (سلة المهملات) — يُحذف نهائياً بعد 30 يوم */
  deletedAt?: string | null;
}

export type FileCategory = 
  | 'AVATAR'
  | 'COVER'
  | 'FORM_COVER'
  | 'FORM_BANNER'
  | 'FORM_SUBMISSION'
  | 'EVENT_COVER'
  | 'EVENT_GALLERY'
  | 'PRODUCT_IMAGE'
  | 'BANNER';

export interface UploadResponse {
  key: string;
  url: string;
}

export interface FilesResponse {
  files: UserFile[];
  total: number;
  page: number;
  limit: number;
}

// Helper functions
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 بايت';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatBytesEn = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getCategoryLabel = (category: FileCategory): string => {
  const labels: Record<FileCategory, string> = {
    AVATAR: 'صورة شخصية',
    COVER: 'غلاف',
    FORM_COVER: 'غلاف نموذج',
    FORM_BANNER: 'بنر نموذج',
    FORM_SUBMISSION: 'مرفق رد',
    EVENT_COVER: 'غلاف حدث',
    EVENT_GALLERY: 'معرض حدث',
    PRODUCT_IMAGE: 'صورة منتج',
    BANNER: 'بنر',
  };
  return labels[category] || category;
};

/**
 * Storage Hook
 * 
 * Hook for managing user file storage:
 * - Get storage usage
 * - Upload files (avatar, cover, form, event, product)
 * - List and delete files
 */
export function useStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<StorageUsage | null>(null);

  /**
   * Get storage usage statistics
   */
  const getStorageUsage = useCallback(async (): Promise<StorageUsage | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getApiClient().get<StorageUsage>('/storage/usage');
      setUsage(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في جلب معلومات التخزين';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get list of user files (active by default; use deletedOnly: true for trash)
   */
  const getFiles = useCallback(async (options?: {
    category?: FileCategory;
    entityId?: string;
    page?: number;
    limit?: number;
    deletedOnly?: boolean;
  }): Promise<FilesResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.entityId) params.append('entityId', options.entityId);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.deletedOnly) params.append('deletedOnly', 'true');

      const queryString = params.toString();
      const url = `/storage/files${queryString ? `?${queryString}` : ''}`;
      
      return await getApiClient().get<FilesResponse>(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في جلب الملفات';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Restore a file from trash (undo soft delete)
   */
  const restoreFile = useCallback(async (fileId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await getApiClient().post(`/storage/files/${fileId}/restore`, {});
      getStorageUsage();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في استرداد الملف';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getStorageUsage]);

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(async (file: File): Promise<UploadResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await getApiClient().upload<UploadResponse>('/storage/avatar', formData);
      
      // Refresh usage after upload
      getStorageUsage();
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في رفع الصورة الشخصية';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStorageUsage]);

  /**
   * Upload cover image
   */
  const uploadCover = useCallback(async (file: File): Promise<UploadResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await getApiClient().upload<UploadResponse>('/storage/cover', formData);
      
      // Refresh usage after upload
      getStorageUsage();
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في رفع صورة الغلاف';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStorageUsage]);

  /**
   * Upload form cover
   */
  const uploadFormCover = useCallback(async (formId: string, file: File): Promise<UploadResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await getApiClient().upload<UploadResponse>(`/storage/forms/${formId}/cover`, formData);
      
      getStorageUsage();
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في رفع غلاف النموذج';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStorageUsage]);

  /**
   * Upload event cover
   */
  const uploadEventCover = useCallback(async (eventId: string, file: File): Promise<UploadResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await getApiClient().upload<UploadResponse>(`/storage/events/${eventId}/cover`, formData);
      
      getStorageUsage();
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في رفع غلاف الحدث';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStorageUsage]);

  /**
   * Upload product image
   */
  const uploadProductImage = useCallback(async (productId: string, file: File): Promise<UploadResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await getApiClient().upload<UploadResponse>(`/storage/products/${productId}/image`, formData);
      
      getStorageUsage();
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في رفع صورة المنتج';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStorageUsage]);

  /**
   * Delete a file
   */
  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await getApiClient().delete(`/storage/files/${fileId}`);
      
      // Refresh usage after deletion
      getStorageUsage();
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في حذف الملف';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getStorageUsage]);

  /**
   * Delete all files for an entity
   */
  const deleteEntityFiles = useCallback(async (entityId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await getApiClient().delete(`/storage/entities/${entityId}`);
      
      getStorageUsage();
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في حذف ملفات الكيان';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getStorageUsage]);

  return {
    // State
    isLoading,
    error,
    usage,
    
    // Methods
    getStorageUsage,
    getFiles,
    restoreFile,
    uploadAvatar,
    uploadCover,
    uploadFormCover,
    uploadEventCover,
    uploadProductImage,
    deleteFile,
    deleteEntityFiles,
    
    // Helpers
    formatBytes,
    formatBytesEn,
    getCategoryLabel,
  };
}

export default useStorage;
