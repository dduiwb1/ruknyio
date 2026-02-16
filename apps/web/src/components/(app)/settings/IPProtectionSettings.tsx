'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Shield,
  ShieldCheck,
  Clock,
  Loader2,
  AlertCircle,
  ChevronDown,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { secureFetch } from '@/lib/api/api-client';
import { API_URL } from '@/lib/config';

interface IPAlertSettings {
  alertOnNewIP: boolean;
  trustedIpCount: number;
  lastLoginAt?: string;
  currentIP?: string;
}

interface IPProtectionSettingsProps {
  onSettingsChange?: () => void;
}

/**
 * 🔔 إعدادات حماية IP
 */
export function IPProtectionSettings({ onSettingsChange }: IPProtectionSettingsProps) {
  const [settings, setSettings] = useState<IPAlertSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await secureFetch(`${API_URL}/user/ip-alerts`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        setSettings({
          alertOnNewIP: true,
          trustedIpCount: 0,
          currentIP: undefined,
          lastLoginAt: undefined,
        });
      }
    } catch (err) {
      // Error loading IP alert settings
      setSettings({
        alertOnNewIP: true,
        trustedIpCount: 0,
        currentIP: undefined,
        lastLoginAt: undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggleAlert = async (value: boolean) => {
    if (!settings) return;
    setUpdating('alertOnNewIP');
    setError(null);

    try {
      const response = await secureFetch(`${API_URL}/user/ip-alerts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertOnNewIP: value }),
      });

      if (response.ok) {
        setSettings(prev => prev ? { ...prev, alertOnNewIP: value } : null);
        onSettingsChange?.();
      } else {
        setError('فشل في تحديث الإعدادات');
      }
    } catch {
      setError('حدث خطأ أثناء تحديث الإعدادات');
    } finally {
      setUpdating(null);
    }
  };

  const handleAddCurrentIP = async () => {
    setUpdating('addIP');
    setError(null);

    try {
      const response = await secureFetch(`${API_URL}/user/trusted-ips/add-current`, {
        method: 'POST',
      });

      if (response.ok) {
        setSettings(prev => prev ? { 
          ...prev, 
          trustedIpCount: prev.trustedIpCount + 1 
        } : null);
        onSettingsChange?.();
      } else {
        setError('فشل في إضافة الموقع');
      }
    } catch {
      setError('حدث خطأ');
    } finally {
      setUpdating(null);
    }
  };

  const handleClearTrustedIPs = async () => {
    setUpdating('clearIPs');
    setError(null);

    try {
      const response = await secureFetch(`${API_URL}/user/trusted-ips/clear`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSettings(prev => prev ? { ...prev, trustedIpCount: 0 } : null);
        onSettingsChange?.();
      } else {
        setError('فشل في مسح القائمة');
      }
    } catch {
      setError('حدث خطأ');
    } finally {
      setUpdating(null);
    }
  };

  if (loading || !settings) {
    return <IPProtectionSettingsSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-4xl overflow-hidden"
      >
        {/* Toggle Section */}
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
              settings.alertOnNewIP
                ? "bg-warning/15"
                : "bg-muted"
            )}>
              {settings.alertOnNewIP ? (
                <Bell className="w-5 h-5 text-warning" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">
                تنبيهات الأمان
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                إشعار عند تسجيل الدخول من موقع جديد
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => handleToggleAlert(!settings.alertOnNewIP)}
              disabled={updating === 'alertOnNewIP'}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0",
                settings.alertOnNewIP 
                  ? "bg-warning" 
                  : "bg-muted",
                updating === 'alertOnNewIP' && "opacity-60"
              )}
              dir="ltr"
            >
              <motion.div
                animate={{ x: settings.alertOnNewIP ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center"
              >
                {updating === 'alertOnNewIP' && (
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                )}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-5 flex items-center justify-between border-t border-border hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm text-muted-foreground">
            كيف تعمل هذه الميزة؟
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            showDetails && "rotate-180"
          )} />
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                <div className="flex gap-3 text-sm">
                  <div className="w-6 h-6 rounded-lg bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5 text-success" />
                  </div>
                  <p className="text-muted-foreground">
                    عناوين IP مشفرة بالكامل ولا يمكن استرجاعها
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-6 h-6 rounded-lg bg-warning/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-3.5 h-3.5 text-warning" />
                  </div>
                  <p className="text-muted-foreground">
                    ستتلقى بريداً عند تسجيل الدخول من موقع غير مألوف
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-6 h-6 rounded-lg bg-info/15 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-info" />
                  </div>
                  <p className="text-muted-foreground">
                    أضف مواقعك المعتادة لتجنب التنبيهات المتكررة
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Trusted Locations Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-4xl p-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">
              المواقع الموثوقة
            </h4>
            <p className="text-sm text-muted-foreground">
              {settings.trustedIpCount === 0 
                ? 'لم تُضف أي مواقع بعد' 
                : `${settings.trustedIpCount} موقع مُسجل`}
            </p>
          </div>
          
          {/* Counter Badge */}
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">
              {settings.trustedIpCount}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {/* Add Location Button */}
          <button
            onClick={handleAddCurrentIP}
            disabled={updating === 'addIP'}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-4",
              "bg-success/10 hover:bg-success/20",
              "text-success text-sm font-medium",
              "rounded-xl transition-colors duration-200",
              updating === 'addIP' && "opacity-60 cursor-not-allowed"
            )}
          >
            {updating === 'addIP' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>إضافة موقعي الحالي</span>
          </button>

          {/* Clear Button */}
          {settings.trustedIpCount > 0 && (
            <button
              onClick={handleClearTrustedIPs}
              disabled={updating === 'clearIPs'}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 px-4",
                "text-muted-foreground text-sm",
                "hover:bg-muted hover:text-destructive",
                "rounded-xl transition-colors duration-200",
                updating === 'clearIPs' && "opacity-60 cursor-not-allowed"
              )}
            >
              {updating === 'clearIPs' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>إزالة جميع المواقع</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Last Login */}
      {settings.lastLoginAt && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl"
        >
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            آخر تسجيل دخول:{' '}
            <span className="text-foreground">
              {new Date(settings.lastLoginAt).toLocaleDateString('ar-SA', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </span>
        </motion.div>
      )}

      {/* Privacy Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-start gap-2.5 px-1"
      >
        <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
         بيانات تسجيل الدخول محمية بتشفير قوي ولا نحتفظ بالمعلومات الحساسة بصيغتها الأصلية 
        </p>
      </motion.div>
    </div>
  );
}

export function IPProtectionSettingsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Main Card Skeleton */}
      <div className="bg-card border border-border rounded-4xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="w-12 h-7 bg-muted rounded-full animate-pulse" />
        </div>
      </div>

      {/* Trusted Locations Skeleton */}
      <div className="bg-card border border-border rounded-4xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 bg-muted rounded-lg animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="h-12 bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
