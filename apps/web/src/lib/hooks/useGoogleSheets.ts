'use client';

import { useState, useCallback } from 'react';

export type GoogleSheetsConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export interface GoogleSheetsStatus {
  connected: boolean;
  spreadsheetId?: string | null;
  spreadsheetUrl?: string | null;
  lastSyncAt?: string | null;
  syncedCount: number;
  isAutoSync: boolean;
}

export interface GoogleSheetsConfig {
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  sheetName?: string;
  isAutoSync: boolean;
  lastSyncAt?: string;
  syncedCount: number;
}

interface GoogleSheetsAuthResponse {
  authUrl?: string;
}

interface GoogleSheetsExportResponse {
  count: number;
  spreadsheetUrl: string;
}

interface GoogleSheetsSpreadsheetResponse {
  spreadsheetId?: string;
  spreadsheetUrl?: string;
}

const DEFAULT_STATUS: GoogleSheetsStatus = {
  connected: false,
  spreadsheetId: null,
  spreadsheetUrl: null,
  lastSyncAt: null,
  syncedCount: 0,
  isAutoSync: false,
};

async function parseJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function useGoogleSheets() {
  const [connectionState, setConnectionState] =
    useState<GoogleSheetsConnectionState>('disconnected');
  const [config, setConfig] = useState<GoogleSheetsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(async (formId: string) => {
    setIsLoading(true);
    setConnectionState('connecting');
    try {
      const res = await fetch(
        `/api/v1/integrations/google-sheets/connect/${formId}`,
        {
          credentials: 'include',
        },
      );
      const data = await parseJson<GoogleSheetsAuthResponse>(res);
      if (!data?.authUrl) {
        setConnectionState('error');
        return null;
      }

      return data;
    } catch {
      setConnectionState('error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async (formId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/v1/integrations/google-sheets/disconnect/${formId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (!res.ok) return false;

      setConnectionState('disconnected');
      setConfig(null);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportSubmissions = useCallback(async (formId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/v1/integrations/google-sheets/export/${formId}`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      const data = await parseJson<GoogleSheetsExportResponse>(res);
      if (!data) return null;
      return data;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sync = useCallback(
    async (formId: string) => {
      await exportSubmissions(formId);
    },
    [exportSubmissions],
  );

  const toggleAutoSync = useCallback(async (formId: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/v1/integrations/google-sheets/auto-sync/${formId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled }),
        },
      );

      const data = await parseJson<{ success?: boolean }>(res);
      return !!data?.success;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewSpreadsheet = useCallback(async (formId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/v1/integrations/google-sheets/new-spreadsheet/${formId}`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      const data = await parseJson<GoogleSheetsSpreadsheetResponse>(res);
      if (!data) return null;
      return data;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reconnect = useCallback(async (formId: string) => {
    setIsLoading(true);
    setConnectionState('connecting');
    try {
      const res = await fetch(
        `/api/v1/integrations/google-sheets/reconnect/${formId}`,
        {
          credentials: 'include',
        },
      );

      const data = await parseJson<GoogleSheetsAuthResponse>(res);
      if (!data?.authUrl) {
        setConnectionState('error');
        return null;
      }

      window.location.href = data.authUrl;
      return data;
    } catch {
      setConnectionState('error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (formId: string) => {
    try {
      const res = await fetch(
        `/api/v1/integrations/google-sheets/status/${formId}`,
        {
          credentials: 'include',
        },
      );

      const data = await parseJson<Partial<GoogleSheetsStatus>>(res);
      if (!data) {
        setConnectionState('disconnected');
        setConfig(null);
        return { ...DEFAULT_STATUS };
      }

      const normalized: GoogleSheetsStatus = {
        connected: !!data.connected,
        spreadsheetId: data.spreadsheetId ?? null,
        spreadsheetUrl: data.spreadsheetUrl ?? null,
        lastSyncAt: data.lastSyncAt ?? null,
        syncedCount: typeof data.syncedCount === 'number' ? data.syncedCount : 0,
        isAutoSync: !!data.isAutoSync,
      };

      setConfig({
        spreadsheetId: normalized.spreadsheetId ?? undefined,
        spreadsheetUrl: normalized.spreadsheetUrl ?? undefined,
        isAutoSync: normalized.isAutoSync,
        lastSyncAt: normalized.lastSyncAt ?? undefined,
        syncedCount: normalized.syncedCount,
      });
      setConnectionState(normalized.connected ? 'connected' : 'disconnected');

      return normalized;
    } catch {
      setConnectionState('error');
      return { ...DEFAULT_STATUS };
    }
  }, []);

  return {
    status: connectionState,
    config,
    isLoading,
    connect,
    disconnect,
    sync,
    getStatus,
    exportSubmissions,
    toggleAutoSync,
    createNewSpreadsheet,
    reconnect,
  };
}
