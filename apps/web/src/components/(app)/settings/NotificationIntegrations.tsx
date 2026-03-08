'use client';

import { Bell } from 'lucide-react';

export function NotificationIntegrations() {
  const integrations = [
    {
      id: 'email',
      name: 'إشعارات البريد الإلكتروني',
      description: 'إرسال تنبيهات وإشعارات عبر البريد الإلكتروني',
      icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
      bgColor: 'bg-red-500/10',
      iconColor: 'text-red-500',
      status: 'قريباً'     
    },
    {
      id: 'sms',
      name: 'الرسائل النصية SMS',
      description: 'إرسال رسائل نصية قصيرة للعملاء',
      icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      bgColor: 'bg-sky-500/10',
      iconColor: 'text-sky-500',
      status: 'قريباً'
    },
    {
      id: 'webhook',
      name: 'Webhooks',
      description: 'إرسال البيانات لتطبيقات خارجية',
      icon: 'M18 16.98h-5.99c-1.1 0-1.95.68-2.95 1.76C8.07 19.83 6.51 21 5 21c-2.21 0-4-1.79-4-4 0-1.51.81-2.83 2.02-3.55-.01-.15-.02-.3-.02-.45 0-2.76 2.24-5 5-5 .71 0 1.39.15 2 .42V5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v10c0 1.1-.9 1.98-2 1.98z',
      bgColor: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
      status: 'قريباً'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'تلقي الإشعارات في Slack',
      icon: 'M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z M14 20.5c0-.83.67-1.5 1.5-1.5H17v-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5h-3c-.83 0-1.5-.67-1.5-1.5z M10 9.5C10 10.33 9.33 11 8.5 11h-5C2.67 11 2 10.33 2 9.5S2.67 8 3.5 8h5c.83 0 1.5.67 1.5 1.5z M10 3.5C10 4.33 9.33 5 8.5 5H7v1.5C7 7.33 6.33 8 5.5 8S4 7.33 4 6.5v-3C4 2.67 4.67 2 5.5 2h3c.83 0 1.5.67 1.5 1.5z',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      status: 'قريباً'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Info Card */}
      <div className="bg-sky-500/5 rounded-2xl p-4 border border-sky-500/10">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sky-500/10 rounded-lg shrink-0">
            <Bell className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">تكاملات الإشعارات</h3>
            <p className="text-xs text-muted-foreground">
              قم بإعداد قنوات الإشعارات المختلفة للبقاء على اتصال مع عملائك وفريقك
            </p>
          </div>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg ${integration.bgColor}`}>
                <svg className={`w-4 h-4 ${integration.iconColor}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d={integration.icon} />
                </svg>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-600 rounded-full">
                {integration.status}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-0.5">{integration.name}</h4>
            <p className="text-xs text-muted-foreground">{integration.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
