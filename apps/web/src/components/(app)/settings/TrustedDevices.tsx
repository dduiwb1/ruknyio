'use client';

import { useState, useEffect } from 'react';
import { 
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Trash2,
  Loader2,
  ShieldCheck,
  MapPin,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSecuritySettings, TrustedDevice } from '@/lib/hooks/settings/useSecuritySettings';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export function TrustedDevices() {
  const { getTrustedDevices, removeTrustedDevice } = useSecuritySettings();
  
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoadingDevices(true);
    const data = await getTrustedDevices();
    setDevices(data);
    setLoadingDevices(false);
  };

  const handleRemoveDevice = async (deviceId: string) => {
    setRemovingId(deviceId);
    const success = await removeTrustedDevice(deviceId);
    if (success) {
      setDevices(prev => prev.filter(d => d.id !== deviceId));
    }
    setRemovingId(null);
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">الأجهزة الموثوقة</h3>
          <p className="text-xs text-muted-foreground">{devices.length} جهاز مسجل</p>
        </div>
      </div>

      {/* Devices List */}
      <div className="divide-y divide-border">
        {loadingDevices ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground text-xs mt-3">جاري تحميل الأجهزة...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-xs">لا توجد أجهزة موثوقة</p>
            <p className="text-muted-foreground/70 text-[10px] mt-1">تُضاف تلقائياً عند تسجيل الدخول</p>
          </div>
        ) : (
          devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.deviceType);
            
            return (
              <div
                key={device.id}
                className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <DeviceIcon className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-foreground truncate">
                    {device.deviceName || `${device.browser || 'متصفح'} على ${device.os || 'جهاز'}`}
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground flex-wrap">
                    {device.ipAddress && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {device.ipAddress}
                      </span>
                    )}
                    {device.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {device.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(device.lastUsed), { addSuffix: true, locale: ar })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveDevice(device.id)}
                  disabled={removingId === device.id}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {removingId === device.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
