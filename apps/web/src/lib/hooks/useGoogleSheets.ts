'use client';

import { useState, useCallback } from 'react';
import { buildApiPath } from '@/lib/config';
import { secureFetch } from '@/lib/api/api-client';

export interface GoogleSheetsStatus {
  connected: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  sheetName?: string;
  lastSyncAt?: string;
  isAutoSync?: boolean;
}

export interface UseGoogleSheetsReturn {
  status: GoogleSheetsStatus | null;
  isLoading: boolean;
  error: string | null;
  connect: (formId: string) => Promise<{ spreadsheetUrl?: string } | null>;
  getStatus: (formId: string) => Promise<GoogleSheetsStatus | null>;
  exportSubmissions: (formId: string) => Promise<{ spreadsheetUrl?: string } | null>;
  toggleAutoSync: (formId: string, enabled: boolean) => Promise<boolean>;
  createNewSpreadsheet: (formId: string) => Promise<{ spreadsheetUrl?: string } | null>;
  disconnect: (formId: string) => Promise<boolean>;
  reconnect: (formId: string) => Promise<boolean>;
}

export function useGoogleSheets(): UseGoogleSheetsReturn {
  const [status, setStatus] = useState<GoogleSheetsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (formId: string): Promise<{ spreadsheetUrl?: string } | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(buildApiPath(`/forms/${formId}/google-sheets/connect`), {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus({
          connected: true,
          spreadsheetUrl: data?.spreadsheetUrl,
          spreadsheetId: data?.spreadsheetId,
          sheetName: data?.sheetName,
          isAutoSync: data?.isAutoSync || false,
        });
        return data;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'فشل في الاتصال بـ Google Sheets');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (formId: string): Promise<GoogleSheetsStatus | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(buildApiPath(`/forms/${formId}/google-sheets/status`));
      
      if (response.ok) {
        const data = await response.json();
        const statusData: GoogleSheetsStatus = {
          connected: data?.connected || false,
          spreadsheetId: data?.spreadsheetId,
          spreadsheetUrl: data?.spreadsheetUrl,
          sheetName: data?.sheetName,
          lastSyncAt: data?.lastSyncAt,
          isAutoSync: data?.isAutoSync || false,
        };
        setStatus(statusData);
        return statusData;
      }
      
      setStatus({ connected: false });
      return { connected: false };
    } catch (err: any) {
      setError(err.message || 'فشل في جلب حالة Google Sheets');
      setStatus({ connected: false });
      return { connected: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportSubmissions = useCallback(async (formId: string): Promise<{ spreadsheetUrl?: string } | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(buildApiPath(`/forms/${formId}/google-sheets/export`), {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'فشل في التصدير');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleAutoSync = useCallback(async (formId: string, enabled: boolean): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(buildApiPath(`/forms/${formId}/google-sheets/auto-sync`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      
      if (response.ok) {
        setStatus(prev => prev ? { ...prev, isAutoSync: enabled } : null);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'فشل في تحديث الإعدادات');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewSpreadsheet = useCallback(async (formId: string): Promise<{ spreadsheetUrl?: string } | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(buildApiPath(`/forms/${formId}/google-sheets/create`), {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(prev => prev ? { ...prev, connected: true, spreadsheetUrl: data.spreadsheetUrl } : { connected: true, spreadsheetUrl: data.spreadsheetUrl });
        return data;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'فشل في إنشاء الجدول');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async (formId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(buildApiPath(`/forms/${formId}/google-sheets/disconnect`), {
        method: 'POST',
      });
      
      if (response.ok) {
        setStatus({ connected: false });
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'فشل في قطع الاتصال');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reconnect = useCallback(async (formId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(buildApiPath(`/forms/${formId}/google-sheets/reconnect`), {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus({
          connected: true,
          spreadsheetUrl: data?.spreadsheetUrl,
          isAutoSync: data?.isAutoSync,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'فشل في إعادة الاتصال');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    status,
    isLoading,
    error,
    connect,
    getStatus,
    exportSubmissions,
    toggleAutoSync,
    createNewSpreadsheet,
    disconnect,
    reconnect,
  };
}

export default useGoogleSheets;
