'use client';

import { TrendingUp, BarChart3, PieChart, Activity, Target } from 'lucide-react';

export function AnalyticsIntegrations() {
  const tools = [
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'تتبع زوار متجرك وسلوكهم',
      icon: BarChart3,
    },
    {
      id: 'meta-pixel',
      name: 'Meta Pixel',
      description: 'تتبع التحويلات من Facebook وInstagram',
      icon: Activity,
    },
    {
      id: 'conversion-tracking',
      name: 'تتبع التحويلات',
      description: 'قس المبيعات والأداء',
      icon: Target,
    },
    {
      id: 'custom-events',
      name: 'الأحداث المخصصة',
      description: 'تتبع أحداث مخصصة في متجرك',
      icon: PieChart,
    }
  ];

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">تكاملات التحليلات</h3>
            <p className="text-sm text-muted-foreground">
              اربط أدوات التحليل لفهم أفضل لسلوك العملاء وتحسين الأداء
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="bg-card rounded-2xl p-4 border border-border hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-muted rounded-lg">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="px-2 py-0.5 text-xs font-medium bg-warning/10 text-warning-filled rounded-full">
                  قريباً
                </span>
              </div>
              <h4 className="font-medium text-foreground mb-1">{tool.name}</h4>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
