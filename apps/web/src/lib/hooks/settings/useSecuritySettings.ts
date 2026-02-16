'use client';

import { useState, useCallback } from 'react';
import { secureFetch } from '@/lib/api/api-client';
import { API_URL, buildApiPath } from '@/lib/config';

// Types
export interface Session {
  id: string;
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  lastActivity: Date;
  createdAt: Date;
  isCurrent: boolean;
}

export interface TrustedDevice {
  id: string;
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  lastUsed: Date;
  createdAt: Date;
}

export interface SecurityLog {
  id: string;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  description?: string;
  ipAddress?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  location?: string;
  createdAt: Date;
}

export interface BlockedIP {
  id: string;
  ipAddress: string;
  reason?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface TwoFASetupResponse {
  qrCode: string;
  secret: string;
}

export function useSecuritySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== 2FA ====================
  
  /**
   * إعداد المصادقة الثنائية - الخطوة 1
   * يُرجع QR Code والمفتاح السري
   */
  const setup2FA = useCallback(async (): Promise<TwoFASetupResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/2fa/setup`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل في إعداد المصادقة الثنائية');
      }

      const data = await response.json();
      return {
        qrCode: data.qrCode,
        secret: data.secret,
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * التحقق وتفعيل المصادقة الثنائية - الخطوة 2
   */
  const verify2FA = useCallback(async (code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'رمز التحقق غير صحيح');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * تعطيل المصادقة الثنائية
   */
  const disable2FA = useCallback(async (code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/2fa/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل في تعطيل المصادقة الثنائية');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * الحصول على حالة المصادقة الثنائية
   */
  const get2FAStatus = useCallback(async (): Promise<{ enabled: boolean; backupCodesRemaining: number } | null> => {
    try {
      const response = await secureFetch(`${API_URL}/auth/2fa/status`);

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (err: any) {
      return null;
    }
  }, []);

  // ==================== Sessions ====================

  const getSessions = useCallback(async (): Promise<Session[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/sessions`);

      if (!response.ok) {
        throw new Error('فشل في جلب الجلسات');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string, isCurrent: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 🔒 منع حذف الجلسة الحالية
      if (isCurrent) {
        throw new Error('لا يمكن حذف الجلسة الحالية. استخدم تسجيل الخروج بدلاً من ذلك.');
      }
      
      const response = await secureFetch(`${API_URL}/user/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل في حذف الجلسة');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteOtherSessions = useCallback(async (): Promise<{ deletedCount: number } | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/sessions`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('فشل في حذف الجلسات');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== Trusted Devices ====================

  const getTrustedDevices = useCallback(async (): Promise<TrustedDevice[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/trusted-devices`);

      if (!response.ok) {
        throw new Error('فشل في جلب الأجهزة الموثوقة');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeTrustedDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/trusted-devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('فشل في إزالة الجهاز');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== Security Logs ====================

  const getSecurityLogs = useCallback(async (options?: {
    page?: number;
    limit?: number;
    action?: string;
  }): Promise<{ logs: SecurityLog[]; total: number; page: number; totalPages: number }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.action) params.append('action', options.action);

      const response = await secureFetch(`${API_URL}/user/security-logs?${params}`);

      if (!response.ok) {
        throw new Error('فشل في جلب سجلات الأمان');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return { logs: [], total: 0, page: 1, totalPages: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSecurityLog = useCallback(async (logId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/security-logs/${logId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('فشل في حذف السجل');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMultipleLogs = useCallback(async (logIds: string[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/security-logs/delete-multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logIds }),
      });

      if (!response.ok) {
        throw new Error('فشل في حذف السجلات');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportSecurityLogs = useCallback(async (format: 'csv' | 'json' | 'pdf'): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/security-logs/export?format=${format}`);

      if (!response.ok) {
        throw new Error('فشل في تصدير السجلات');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-logs-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== IP Blocklist ====================

  const getBlockedIPs = useCallback(async (): Promise<BlockedIP[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/ip-blocklist`);

      if (!response.ok) {
        throw new Error('فشل في جلب قائمة IPs المحظورة');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const blockIP = useCallback(async (ipAddress: string, reason?: string, expiresAt?: Date): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/ip-blocklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress, reason, expiresAt }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل في حظر IP');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unblockIP = useCallback(async (ipId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/ip-blocklist/${ipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('فشل في رفع الحظر');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== User Profile ====================

  const getUserProfile = useCallback(async () => {
    try {
      const response = await secureFetch(`${API_URL}/profiles/me`);

      if (!response.ok) {
        throw new Error('فشل في جلب بيانات المستخدم');
      }

      const data = await response.json();
      // استخراج twoFactorEnabled من user object
      return {
        ...data,
        twoFactorEnabled: data.user?.twoFactorEnabled ?? false,
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  // ==================== IP Alert Settings (Simplified) ====================

  interface IPAlertSettings {
    alertOnNewIP: boolean;
    trustedIpCount: number;
    lastLoginAt?: string;
    currentIP?: string;
  }

  /**
   * جلب إعدادات تنبيهات IP
   */
  const getIPAlertSettings = useCallback(async (): Promise<IPAlertSettings | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/ip-alerts`);

      if (!response.ok) {
        throw new Error('فشل في جلب إعدادات التنبيهات');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * تحديث إعدادات تنبيهات IP
   */
  const updateIPAlertSettings = useCallback(async (settings: {
    alertOnNewIP?: boolean;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/ip-alerts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل في تحديث الإعدادات');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * إضافة IP الحالي للقائمة الموثوقة
   */
  const addCurrentIPToTrusted = useCallback(async (): Promise<{ success: boolean; maskedIP?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/trusted-ips/add-current`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل في إضافة IP الحالي');
      }

      const data = await response.json();
      return { success: true, maskedIP: data.maskedIP };
    } catch (err: any) {
      setError(err.message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * مسح جميع IPs الموثوقة
   */
  const clearTrustedIPs = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await secureFetch(`${API_URL}/user/trusted-ips/clear`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('فشل في مسح القائمة');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    setError,
    // 2FA
    setup2FA,
    verify2FA,
    disable2FA,
    get2FAStatus,
    // Sessions
    getSessions,
    deleteSession,
    deleteOtherSessions,
    // Trusted Devices
    getTrustedDevices,
    removeTrustedDevice,
    // Security Logs
    getSecurityLogs,
    deleteSecurityLog,
    deleteMultipleLogs,
    exportSecurityLogs,
    // IP Blocklist
    getBlockedIPs,
    blockIP,
    unblockIP,
    // User Profile
    getUserProfile,
    // IP Alerts (Simplified)
    getIPAlertSettings,
    updateIPAlertSettings,
    addCurrentIPToTrusted,
    clearTrustedIPs,
  };
}

