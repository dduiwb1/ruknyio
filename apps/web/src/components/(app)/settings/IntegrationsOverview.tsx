'use client';

import { Link2, Share2, TrendingUp, Bell, Cloud, CheckCircle, Clock } from 'lucide-react';

export function IntegrationsOverview() {
  const categories = [
    {
      id: 'social',
      name: 'وسائل التواصل الاجتماعي',
      description: 'Facebook, Instagram, Twitter, WhatsApp',
      icon: Share2,
      bgColor: 'bg-rose-500/10',
      iconColor: 'text-rose-500',
      barColor: 'bg-rose-500',
      count: 4,
      connected: 0
    },
    {
      id: 'analytics',
      name: 'التحليلات والإحصائيات',
      description: 'Google Analytics, Meta Pixel',
      icon: TrendingUp,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      barColor: 'bg-primary',
      count: 3,
      connected: 0
    },
    {
      id: 'notifications',
      name: 'الإشعارات والرسائل',
      description: 'Email, SMS, Webhooks, Slack',
      icon: Bell,
      bgColor: 'bg-sky-500/10',
      iconColor: 'text-sky-500',
      barColor: 'bg-sky-500',
      count: 4,
      connected: 0
    },
    {
      id: 'storage',
      name: 'التخزين السحابي',
      description: 'Google Drive, Dropbox',
      icon: Cloud,
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      barColor: 'bg-amber-500',
      count: 2,
      connected: 0
    }
  ];

  const totalIntegrations = categories.reduce((sum, cat) => sum + cat.count, 0);
  const connectedIntegrations = categories.reduce((sum, cat) => sum + cat.connected, 0);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-primary rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/15 rounded-lg">
              <Link2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold">{totalIntegrations}</div>
          <div className="text-xs text-white/70">تكامل متاح</div>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{connectedIntegrations}</div>
          <div className="text-xs text-muted-foreground">تكامل نشط</div>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{totalIntegrations - connectedIntegrations}</div>
          <div className="text-xs text-muted-foreground">قيد الإعداد</div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                  <Icon className={`w-5 h-5 ${category.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{category.count}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${category.barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${(category.connected / category.count) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {category.connected}/{category.count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
