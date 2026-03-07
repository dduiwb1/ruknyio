'use client';

import { useState, useCallback } from 'react';

export type GoogleSheetsStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface GoogleSheetsConfig {
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  sheetName?: string;
  isAutoSync: boolean;
  lastSyncAt?: string;
  syncedCount: number;
}

export function useGoogleSheets() {
  const [status, setStatus] = useState<GoogleSheetsStatus>('disconnected');
  const [config, setConfig] = useState<GoogleSheetsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(async (formId: string) => {
    setIsLoading(true);
    setStatus('connecting');
    try {
      const res = await fetch(`/api/v1/integrations/google-sheets/${formId}/auth`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async (formId: string) => {
    try {
      await fetch(`/api/v1/integrations/google-sheets/${formId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setStatus('disconnected');
      setConfig(null);
    } catch {
      // ignore
    }
  }, []);

  const sync = useCallback(async (formId: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/v1/integrations/google-sheets/${formId}/sync`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (formId: string) => {
    try {
      const res = await fetch(`/api/v1/integrations/google-sheets/${formId}/status`, {
        credentials: 'include',
      });
      if (!res.ok) {
        setStatus('disconnected');
        return;
      }
      const data = await res.json();
      setConfig(data);
      setStatus(data.isActive ? 'connected' : 'disconnected');
    } catch {
      setStatus('disconnected');
    }
  }, []);

  return { status, config, isLoading, connect, disconnect, sync, getStatus };
}
