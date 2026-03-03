'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Check,
  X,
  Link2,
  Unlink,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  SettingsSection,
  SettingsRow,
  SettingsField,
} from '@/components/(app)/settings';

interface Integration {
  key: string;
  label: string;
  description: string;
  icon: typeof Calendar;
  connected: boolean;
  accountInfo?: string;
  color: string;
}

export default function IntegrationsSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      key: 'google-calendar',
      label: 'تقويم Google',
      description: 'مزامنة أحداثك تلقائياً مع تقويم Google',
      icon: Calendar,
      connected: false,
      color: 'bg-blue-500',
    },
    {
      key: 'telegram',
      label: 'تيليجرام',
      description: 'استلام الإشعارات وإدارة متجرك عبر بوت تيليجرام',
      icon: MessageSquare,
      connected: false,
      color: 'bg-sky-500',
    },
    {
      key: 'whatsapp',
      label: 'واتساب',
      description: 'إرسال إشعارات الطلبات للعملاء عبر واتساب',
      icon: Smartphone,
      connected: false,
      color: 'bg-emerald-500',
    },
  ]);

  const toggleIntegration = (key: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.key === key ? { ...int, connected: !int.connected } : int
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
      {/* Connected Integrations */}
      <SettingsSection
        title="التكاملات المتاحة"
        description="ربط ركني مع تطبيقات وخدمات خارجية"
      >
        <div className="space-y-4">
          {integrations.map((integration) => (
            <motion.div
              key={integration.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-2xl border-2 overflow-hidden transition-all',
                integration.connected
                  ? 'border-primary/20 bg-primary/5'
                  : 'border-transparent bg-background/50'
              )}
            >
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-xl',
                      integration.color
                    )}
                  >
                    <integration.icon className="size-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-foreground">
                        {integration.label}
                      </p>
                      {integration.connected && (
                        <Badge variant="default" className="text-[9px] h-4">
                          مرتبط
                        </Badge>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {integration.description}
                    </p>
                    {integration.connected && integration.accountInfo && (
                      <p className="text-[11px] text-primary mt-1">
                        {integration.accountInfo}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant={integration.connected ? 'destructive' : 'default'}
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => toggleIntegration(integration.key)}
                >
                  {integration.connected ? (
                    <>
                      <Unlink className="size-3.5" />
                      إلغاء الربط
                    </>
                  ) : (
                    <>
                      <Link2 className="size-3.5" />
                      ربط
                    </>
                  )}
                </Button>
              </div>

              {/* Expanded Settings for Connected Integration */}
              {integration.connected && integration.key === 'telegram' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border/30 px-4 py-3"
                >
                  <SettingsField
                    label="معرّف المحادثة (Chat ID)"
                    htmlFor="telegramChatId"
                    description="معرّف محادثة تيليجرام لاستلام الإشعارات"
                  >
                    <Input
                      id="telegramChatId"
                      placeholder="أدخل معرّف المحادثة"
                      dir="ltr"
                    />
                  </SettingsField>
                </motion.div>
              )}

              {integration.connected && integration.key === 'whatsapp' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border/30 px-4 py-3"
                >
                  <SettingsField
                    label="رقم واتساب"
                    htmlFor="whatsappNumber"
                    description="رقم واتساب المرتبط بحساب واتساب بزنس"
                  >
                    <Input
                      id="whatsappNumber"
                      placeholder="964xxx xxx xxxx"
                      dir="ltr"
                    />
                  </SettingsField>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </SettingsSection>

      {/* API & Webhooks (ادارة متقدمة) */}
      <SettingsSection
        title="واجهة برمجة التطبيقات"
        description="إعدادات متقدمة للمطورين"
      >
        <div className="space-y-3">
          <SettingsRow>
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/50">
                <ExternalLink className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-foreground">
                  Webhook URL
                </p>
                <p className="text-[11px] text-muted-foreground">
                  رابط webhook لاستلام الأحداث
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              إعداد
            </Button>
          </SettingsRow>
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
