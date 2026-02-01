'use client';

import { useState, useEffect, Suspense, useCallback, useMemo, startTransition, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Shield,
  Link2,
  MonitorSmartphone,
  ScrollText,
  Ban,
  Smartphone,
  Share2,
  TrendingUp,
  Bell,
  Cloud,
  Zap,
  Loader2,
  Store,
  FileText,
  Calendar,
  Package,
  FormInput,
  Ticket,
  ChevronLeft,
  Sparkles,
  Settings2,
  Globe,
} from 'lucide-react';

// Loading skeleton component
const SettingsSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-11 h-11 bg-muted rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded-lg w-32" />
          <div className="h-3 bg-muted/50 rounded-lg w-48" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-24" />
              <div className="h-2 bg-muted rounded w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Lazy load all settings components
const TwoFactorAuth = lazy(() => import('@/components/(app)/settings/TwoFactorAuth').then(m => ({ default: m.TwoFactorAuth })));
const SessionsManager = lazy(() => import('@/components/(app)/settings/SessionsManager').then(m => ({ default: m.SessionsManager })));
const TrustedDevices = lazy(() => import('@/components/(app)/settings/TrustedDevices').then(m => ({ default: m.TrustedDevices })));
const SecurityLogs = lazy(() => import('@/components/(app)/settings/SecurityLogs').then(m => ({ default: m.SecurityLogs })));
const IPProtectionSettings = lazy(() => import('@/components/(app)/settings/IPProtectionSettings').then(m => ({ default: m.IPProtectionSettings })));
const IntegrationsOverview = lazy(() => import('@/components/(app)/settings/IntegrationsOverview').then(m => ({ default: m.IntegrationsOverview })));
const SocialIntegrations = lazy(() => import('@/components/(app)/settings/SocialIntegrations').then(m => ({ default: m.SocialIntegrations })));
const AnalyticsIntegrations = lazy(() => import('@/components/(app)/settings/AnalyticsIntegrations').then(m => ({ default: m.AnalyticsIntegrations })));
const NotificationIntegrations = lazy(() => import('@/components/(app)/settings/NotificationIntegrations').then(m => ({ default: m.NotificationIntegrations })));
const StorageIntegrations = lazy(() => import('@/components/(app)/settings/StorageIntegrations').then(m => ({ default: m.StorageIntegrations })));
// Types
type SettingTab = 
  | '2fa' | 'sessions' | 'devices' | 'logs' | 'blocklist' | 'ip-protection'
  | 'overview' | 'social' | 'analytics' | 'notifications' | 'storage'
  | 'store-general' | 'products' | 'orders'
  | 'forms-general' | 'templates' | 'submissions'
  | 'events-general' | 'tickets' | 'calendar';

interface SettingItem {
  id: SettingTab;
  label: string;
  description: string;
  icon: React.ElementType;
  category: 'security' | 'integrations' | 'store' | 'forms' | 'events';
  color: string;
  /** Solid bg for list card circle (Tailwind class) */
  iconBgSolid: string;
  badge?: string;
}

// All settings organized by category
const allSettings: SettingItem[] = [
  // Security Settings
  {
    id: '2fa',
    label: 'المصادقة الثنائية',
    description: 'أضف طبقة حماية إضافية لحسابك',
    icon: Shield,
    category: 'security',
    color: 'from-primary to-primary-hover',
    iconBgSolid: 'bg-primary',
    badge: 'موصى به'
  },
  {
    id: 'sessions',
    label: 'الجلسات النشطة',
    description: 'إدارة الأجهزة المتصلة بحسابك',
    icon: MonitorSmartphone,
    category: 'security',
    color: 'from-primary to-primary-hover',
    iconBgSolid: 'bg-primary'
  },
  {
    id: 'devices',
    label: 'الأجهزة الموثوقة',
    description: 'الأجهزة التي سجلت الدخول منها',
    icon: Smartphone,
    category: 'security',
    color: 'from-primary to-primary-hover',
    iconBgSolid: 'bg-primary'
  },
  {
    id: 'logs',
    label: 'سجل الأمان',
    description: 'تتبع النشاطات والتغييرات الأمنية',
    icon: ScrollText,
    category: 'security',
    color: 'from-primary to-primary-hover',
    iconBgSolid: 'bg-primary'
  },
  {
    id: 'ip-protection',
    label: 'تنبيهات الدخول',
    description: 'استلام تنبيه عند تسجيل الدخول من موقع جديد',
    icon: Globe,
    category: 'security',
    color: 'from-warning to-warning-filled',
    iconBgSolid: 'bg-success',
    badge: 'جديد'
  },
  // Integration Settings
  {
    id: 'overview',
    label: 'نظرة عامة',
    description: 'جميع التكاملات المتاحة',
    icon: Zap,
    category: 'integrations',
    color: 'from-info to-info-filled',
    iconBgSolid: 'bg-info'
  },
  {
    id: 'social',
    label: 'وسائل التواصل',
    description: 'ربط حسابات التواصل الاجتماعي',
    icon: Share2,
    category: 'integrations',
    color: 'from-destructive to-destructive-filled',
    iconBgSolid: 'bg-destructive'
  },
  {
    id: 'analytics',
    label: 'التحليلات',
    description: 'تتبع الأداء والإحصائيات',
    icon: TrendingUp,
    category: 'integrations',
    color: 'from-primary to-primary-hover',
    iconBgSolid: 'bg-primary'
  },
  {
    id: 'notifications',
    label: 'الإشعارات',
    description: 'إدارة التنبيهات والإشعارات',
    icon: Bell,
    category: 'integrations',
    color: 'from-info to-info-filled',
    iconBgSolid: 'bg-info'
  },
  {
    id: 'storage',
    label: 'التخزين السحابي',
    description: 'ربط خدمات التخزين الخارجية',
    icon: Cloud,
    category: 'integrations',
    color: 'from-warning to-warning-filled',
    iconBgSolid: 'bg-warning'
  },
  // Store Settings
  {
    id: 'store-general',
    label: 'إعدادات المتجر',
    description: 'الإعدادات العامة للمتجر',
    icon: Store,
    category: 'store',
    color: 'from-info to-info-filled',
    iconBgSolid: 'bg-info'
  },
  {
    id: 'products',
    label: 'المنتجات',
    description: 'إدارة المنتجات والفئات',
    icon: Package,
    category: 'store',
    color: 'from-info to-info-filled',
    iconBgSolid: 'bg-info'
  },
  {
    id: 'orders',
    label: 'الطلبات',
    description: 'إدارة الطلبات والمبيعات',
    icon: ScrollText,
    category: 'store',
    color: 'from-info to-info-filled',
    iconBgSolid: 'bg-info'
  },
  // Forms Settings
  {
    id: 'forms-general',
    label: 'إعدادات النماذج',
    description: 'الإعدادات العامة للنماذج',
    icon: FileText,
    category: 'forms',
    color: 'from-destructive to-destructive-filled',
    iconBgSolid: 'bg-destructive'
  },
  {
    id: 'templates',
    label: 'قوالب النماذج',
    description: 'إنشاء وإدارة قوالب النماذج',
    icon: FormInput,
    category: 'forms',
    color: 'from-destructive to-destructive-filled',
    iconBgSolid: 'bg-destructive'
  },
  {
    id: 'submissions',
    label: 'الإرساليات',
    description: 'عرض وإدارة البيانات المرسلة',
    icon: ScrollText,
    category: 'forms',
    color: 'from-destructive to-destructive-filled',
    iconBgSolid: 'bg-destructive'
  },
  // Events Settings
  {
    id: 'events-general',
    label: 'إعدادات الأحداث',
    description: 'الإعدادات العامة للأحداث',
    icon: Calendar,
    category: 'events',
    color: 'from-warning to-warning-filled',
    iconBgSolid: 'bg-warning'
  },
  {
    id: 'tickets',
    label: 'التذاكر',
    description: 'إدارة التذاكر والحجوزات',
    icon: Ticket,
    category: 'events',
    color: 'from-warning to-warning-filled',
    iconBgSolid: 'bg-warning'
  },
  {
    id: 'calendar',
    label: 'التقويم',
    description: 'جدولة الأحداث والمواعيد',
    icon: Calendar,
    category: 'events',
    color: 'from-warning to-warning-filled',
    iconBgSolid: 'bg-warning'
  }
];

/** Mobile list view: cards like reference (Security & sign-in, etc.) */
const MobileSettingsList = ({
  settings,
  onSelect,
}: {
  settings: SettingItem[];
  onSelect: (id: SettingTab) => void;
}) => (
  <div className="space-y-3 pb-6">
    {settings.map((item) => {
      const Icon = item.icon;
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className="w-full flex items-center gap-4 rounded-4xl border border-border bg-card p-4 text-right transition-colors hover:bg-muted/30 active:scale-[0.99]"
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.iconBgSolid} text-white`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-foreground">{item.label}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
          <ChevronLeft className="h-5 w-5 shrink-0 rotate-180 text-muted-foreground" aria-hidden />
        </button>
      );
    })}
  </div>
);

// Category info for headers - using brand colors
const categoryInfo = {
  security: {
    title: 'الأمان والخصوصية',
    description: 'حافظ على أمان حسابك وبياناتك الشخصية',
    icon: Shield,
    iconBg: 'bg-primary',
    iconColor: 'text-white',
    lightBg: 'bg-primary/10',
    textColor: 'text-primary'
  },
  integrations: {
    title: 'التكاملات',
    description: 'اربط تطبيقاتك وخدماتك المفضلة',
    icon: Link2,
    iconBg: 'bg-info',
    iconColor: 'text-white',
    lightBg: 'bg-info/10',
    textColor: 'text-info'
  },
  store: {
    title: 'المتجر',
    description: 'أدر متجرك ومنتجاتك بسهولة',
    icon: Store,
    iconBg: 'bg-warning',
    iconColor: 'text-white',
    lightBg: 'bg-warning/10',
    textColor: 'text-warning-filled'
  },
  forms: {
    title: 'النماذج',
    description: 'أنشئ وأدر نماذجك الإلكترونية',
    icon: FileText,
    iconBg: 'bg-destructive',
    iconColor: 'text-white',
    lightBg: 'bg-destructive/10',
    textColor: 'text-destructive'
  },
  events: {
    title: 'الأحداث',
    description: 'نظم فعالياتك وتذاكرك',
    icon: Calendar,
    iconBg: 'bg-success',
    iconColor: 'text-white',
    lightBg: 'bg-success/10',
    textColor: 'text-success'
  }
};

// Hook: mobile breakpoint (lg = 1024px)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const m = window.matchMedia('(max-width: 1023px)');
    setIsMobile(m.matches);
    const f = () => setIsMobile(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return isMobile;
}

// Settings content wrapper
function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const tabParam = searchParams.get('tab') as SettingTab | null;
  const hasValidTab = tabParam && allSettings.some((s) => s.id === tabParam);

  // URL is the source of truth. Mobile: no tab = list mode; desktop: default 2fa.
  const activeTab = useMemo<SettingTab>(() => {
    if (hasValidTab) return tabParam!;
    return '2fa';
  }, [tabParam, hasValidTab]);

  const isListMode = isMobile === true && !hasValidTab;

  // Show loading while determining screen size
  const isLoading = isMobile === null;

  const navigateToTab = useCallback(
    (nextTab: SettingTab) => {
      startTransition(() => {
        router.replace(`/app/settings?tab=${nextTab}`);
      });
    },
    [router]
  );

  const navigateBack = useCallback(() => {
    startTransition(() => {
      router.replace('/app/settings');
    });
  }, [router]);

  // Get current category info
  const currentSetting = allSettings.find(s => s.id === activeTab);
  const currentCategoryInfo = currentSetting ? categoryInfo[currentSetting.category] : null;

  // Render security content - TwoFactorAuth handles its own 2FA status
  const renderSecurityContent = useCallback(() => {
    switch (activeTab) {
      case '2fa':
        return <TwoFactorAuth />;
      case 'sessions':
        return <SessionsManager />;
      case 'devices':
        return <TrustedDevices />;
      case 'logs':
        return <SecurityLogs />;
      case 'ip-protection':
        return <IPProtectionSettings />;
      default:
        return null;
    }
  }, [activeTab]);

  const renderIntegrationContent = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        return <IntegrationsOverview />;
      case 'social':
        return <SocialIntegrations />;
      case 'analytics':
        return <AnalyticsIntegrations />;
      case 'notifications':
        return <NotificationIntegrations />;
      case 'storage':
        return <StorageIntegrations />;
      default:
        return null;
    }
  }, [activeTab]);

  const renderStoreContent = useCallback(() => {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-info/20 to-info/5 flex items-center justify-center">
            <Store className="w-12 h-12 text-info" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">إعدادات المتجر</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">نعمل على تطوير أدوات متقدمة لإدارة متجرك</p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-info/10 text-info rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            قريباً
          </div>
        </div>
      </div>
    );
  }, []);

  const renderFormsContent = useCallback(() => {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center">
            <FileText className="w-12 h-12 text-destructive" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">إعدادات النماذج</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">نعمل على تطوير أدوات متقدمة لإدارة نماذجك</p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-destructive/10 text-destructive rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            قريباً
          </div>
        </div>
      </div>
    );
  }, []);

  const renderEventsContent = useCallback(() => {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-warning/30 to-warning/10 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-warning-filled" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">إعدادات الأحداث</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">نعمل على تطوير أدوات متقدمة لإدارة فعالياتك</p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-warning/20 text-warning-filled rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            قريباً
          </div>
        </div>
      </div>
    );
  }, []);

  const renderContent = useCallback(() => {
    const setting = allSettings.find(s => s.id === activeTab);
    if (!setting) return null;

    if (setting.category === 'security') {
      return renderSecurityContent();
    } else if (setting.category === 'integrations') {
      return renderIntegrationContent();
    } else if (setting.category === 'store') {
      return renderStoreContent();
    } else if (setting.category === 'forms') {
      return renderFormsContent();
    } else if (setting.category === 'events') {
      return renderEventsContent();
    }
    return null;
  }, [activeTab, renderSecurityContent, renderIntegrationContent, renderStoreContent, renderFormsContent, renderEventsContent]);

  // Show skeleton while determining screen size
  if (isLoading) {
    return (
      <div className="min-h-full">
        <main className="pb-8">
          <div className="mx-auto max-w-[1080px] px-4 pt-4 sm:px-6 lg:px-8">
            <SettingsSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <main className="pb-8">
        <div className="mx-auto max-w-[1080px] px-4 pt-4 sm:px-6 lg:px-8">
          {/* Mobile: List view (like reference image) when no tab */}
          {isListMode && (
            <div className="lg:hidden animate-in fade-in duration-200">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground">الإعدادات</h1>
                <p className="mt-1 text-sm text-muted-foreground">إدارة حسابك وتفضيلاتك</p>
              </div>
              <MobileSettingsList settings={allSettings} onSelect={navigateToTab} />
            </div>
          )}

          {/* Mobile: Detail view (back + content) when tab set */}
          {isMobile === true && !isListMode && (
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={navigateBack}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                aria-label="رجوع"
              >
                <ChevronLeft className="h-5 w-5 rotate-180" />
              </button>
              {currentCategoryInfo && currentSetting && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-foreground">{currentSetting.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{currentCategoryInfo.title}</p>
                </div>
              )}
            </div>
          )}

          {/* Desktop Header */}
          {isMobile === false && currentCategoryInfo && currentSetting && (
            <div className="mb-6 hidden lg:block animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${currentCategoryInfo.iconBg} shadow-lg`}
                >
                  <currentCategoryInfo.icon className={`h-6 w-6 ${currentCategoryInfo.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{currentCategoryInfo.title}</span>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    <span className="text-base font-bold text-foreground">{currentSetting.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentSetting.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content (detail view): hide on mobile list mode */}
          {!isListMode && (
            <div key={activeTab} className="min-w-0 flex-1 animate-in fade-in duration-150">
              <Suspense fallback={<SettingsSkeleton />}>
                {renderContent()}
              </Suspense>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Main export with Suspense wrapper
export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary/20">
              <Settings2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-info" />
            </div>
          </div>
          <p className="text-base font-bold text-foreground mb-1 mt-4">جاري تحميل الإعدادات</p>
          <p className="text-sm text-muted-foreground">يرجى الانتظار...</p>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
