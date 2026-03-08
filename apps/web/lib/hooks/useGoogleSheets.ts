/**
 * Google Sheets Integration Hook - Stub for missing implementation
 * TODO: Implement Google Sheets API integration
 */

export enum GoogleSheetsStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  SYNCING = 'SYNCING',
  ERROR = 'ERROR',
}

export interface GoogleSheetsConfig {
  spreadsheetId?: string;
  sheetName?: string;
  enabled: boolean;
}

export function useGoogleSheets() {
  // Stub hook - implement actual Google Sheets integration
  return {
    status: GoogleSheetsStatus.IDLE,
    isConnected: false,
    error: null as string | null,
    connect: async () => {},
    disconnect: async () => {},
    sync: async () => {},
    config: null as GoogleSheetsConfig | null,
    updateConfig: async (config: GoogleSheetsConfig) => {},
  };
}
