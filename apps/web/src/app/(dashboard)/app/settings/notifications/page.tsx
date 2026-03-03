'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Mail,
  Smartphone,
  ShoppingBag,
  FileText,
  CalendarDays,
  MessageSquare,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  SettingsSection,
  SettingsRow,
  ToggleSwitch,
} from '@/components/(app)/settings';

interface NotificationChannel {
  key: string;
  label: string;
  icon: typeof Mail;
  description: string;
  enabled: boolean;
}

interface NotificationType {
  key: string;
  label: string;
  icon: typeof ShoppingBag;
  description: string;
  email: boolean;
  push: boolean;
}

export default function NotificationsSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      key: 'email',
      label: 'البريد الإلكتروني',
      icon: Mail,
      description: 'استلام الإشعارات عبر البريد الإلكتروني',
      enabled: true,
    },
    {
      key: 'push',
      label: 'إشعارات المتصفح',
      icon: Bell,
      description: 'إشعارات فورية عبر المتصفح',
      enabled: false,
    },
    {
      key: 'telegram',
      label: 'تيليجرام',
      icon: MessageSquare,
      description: 'إشعارات عبر بوت تيليجرام',
      enabled: false,
    },
    {
      key: 'whatsapp',
      label: 'واتساب',
      icon: Smartphone,
      description: 'إشعارات عبر واتساب',
      enabled: false,
    },
  ]);

  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    {
      key: 'orders',
      label: 'الطلبات الجديدة',
      icon: ShoppingBag,
      description: 'عند استلام طلب جديد',
      email: true,
      push: true,
    },
    {
      key: 'forms',
      label: 'ردود النماذج',
      icon: FileText,
      description: 'عند استلام رد على نموذج',
      email: true,
      push: false,
    },
    {
      key: 'events',
      label: 'تذكيرات الأحداث',
      icon: CalendarDays,
      description: 'تذكير قبل موعد الحدث',
      email: true,
      push: true,
    },
    {
      key: 'promotions',
      label: 'العروض والتحديثات',
      icon: Bell,
      description: 'عروض ومميزات جديدة من ركني',
      email: false,
      push: false,
    },
  ]);

  const toggleChannel = (key: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.key === key ? { ...ch, enabled: !ch.enabled } : ch
      )
    );
  };

  const toggleNotificationType = (
    key: string,
    field: 'email' | 'push'
  ) => {
    setNotificationTypes((prev) =>
      prev.map((nt) =>
        nt.key === key ? { ...nt, [field]: !nt[field] } : nt
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-5">
      {/* Notification Channels */}
      <SettingsSection
        title="قنوات الإشعارات"
        description="اختر الطريقة التي تفضل استلام الإشعارات بها"
      >
        <div className="space-y-3">
          {channels.map((channel) => (
            <SettingsRow key={channel.key}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl',
                    channel.enabled ? 'bg-primary/10' : 'bg-muted/50'
                  )}
                >
                  <channel.icon
                    className={cn(
                      'size-4',
                      channel.enabled
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-foreground">
                    {channel.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {channel.description}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={channel.enabled}
                onChange={() => toggleChannel(channel.key)}
              />
            </SettingsRow>
          ))}
        </div>
      </SettingsSection>

      {/* Notification Types */}
      <SettingsSection
        title="أنواع الإشعارات"
        description="تخصيص الإشعارات حسب النوع والقناة"
      >
        <div className="space-y-3">
          {notificationTypes.map((type) => (
            <div
              key={type.key}
              className="rounded-xl bg-background/50 px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 mt-0.5">
                  <type.icon className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground">
                    {type.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    {type.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <ToggleSwitch
                        checked={type.email}
                        onChange={() =>
                          toggleNotificationType(type.key, 'email')
                        }
                      />
                      <span className="text-[12px] text-muted-foreground">
                        بريد
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <ToggleSwitch
                        checked={type.push}
                        onChange={() =>
                          toggleNotificationType(type.key, 'push')
                        }
                      />
                      <span className="text-[12px] text-muted-foreground">
                        إشعار فوري
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-end"
      >
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="size-4" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </motion.div>
    </div>
  );
}
