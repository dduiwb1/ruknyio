'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { buildApiPath } from '@/lib/config';

interface SocialLink {
  id?: string;
  platform: string;
  username?: string;
  url: string;
  title?: string;
  displayOrder?: number;
  status?: 'active' | 'hidden';
  groupId?: string;
  layout?: 'classic' | 'featured';
  thumbnail?: string;
}

interface UseSocialLinksResult {
  addLink: (link: Omit<SocialLink, 'id'>) => Promise<SocialLink | null>;
  updateLink: (id: string, data: Partial<SocialLink>) => Promise<SocialLink | null>;
  deleteLink: (id: string) => Promise<boolean>;
  reorderLinks: (linkIds: string[]) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook لإدارة الروابط الاجتماعية
 */
export function useSocialLinks(): UseSocialLinksResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const addLink = useCallback(async (link: Omit<SocialLink, 'id'>): Promise<SocialLink | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiPath('social-links'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(link),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'فشل في إضافة الرابط');
      }

      const createdLink = await response.json();
      return createdLink;
    } catch (err: any) {
      const errorMessage = err.message || 'حدث خطأ أثناء إضافة الرابط';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLink = useCallback(async (id: string, data: Partial<SocialLink>): Promise<SocialLink | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiPath(`social-links/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'فشل في تحديث الرابط');
      }

      const updatedLink = await response.json();
      return updatedLink;
    } catch (err: any) {
      const errorMessage = err.message || 'حدث خطأ أثناء تحديث الرابط';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLink = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiPath(`social-links/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'فشل في حذف الرابط');
      }

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'حدث خطأ أثناء حذف الرابط';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderLinks = useCallback(async (linkIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiPath('social-links/reorder'), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ linkIds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'فشل في إعادة ترتيب الروابط');
      }

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'حدث خطأ أثناء إعادة ترتيب الروابط';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
    loading,
    error,
  };
}

export default useSocialLinks;
