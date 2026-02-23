'use client';

import { useState, useEffect, Suspense, useCallback, useMemo, startTransition, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield,
  Link2,
  MonitorSmartphone,
  ScrollText,
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
  ChevronRight,
  Globe,
  Smartphone,
  LogOut,
  Rocket,
  Construction,
  User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

// Loading skeleton component
const SettingsSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2].map(g => (
      <div key={g} className="rounded-3xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/30 bg-muted/20">
          <div className="w-9 h-9 bg-muted rounded-xl" />
          <div className="space-y-1.5">
            <div className="h-3.5 bg-muted rounded-lg w-28" />
            <div className="h-2.5 bg-muted/40 rounded-lg w-40" />
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className={cn(
            "flex items-center gap-3.5 px-5 py-4",
            i < 3 && "border-b border-border/30"
          )}>
            <div className="w-11 h-11 bg-muted/60 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-muted rounded-lg w-28" />
              <div className="h-3 bg-muted/40 rounded-lg w-40" />
            </div>
            <div className="w-4 h-4 bg-muted/30 rounded" />
          </div>
        ))}
      </div>
    ))}
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
  | '2fa' | 'sessions' | 'devices' | 'logs' | 'ip-protection'
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
    color: 'text-emerald-600 dark:text-emerald-400',
    iconBgSolid: 'bg-emerald-500/12',
    badge: 'موصى به'
  },
  {
    id: 'sessions',
    label: 'الجلسات النشطة',
    description: 'إدارة الأجهزة المتصلة بحسابك',
    icon: MonitorSmartphone,
    category: 'security',
    color: 'text-emerald-600 dark:text-emerald-400',
    iconBgSolid: 'bg-emerald-500/12'
  },
  {
    id: 'devices',
    label: 'الأجهزة الموثوقة',
    description: 'الأجهزة التي سجلت الدخول منها',
    icon: Smartphone,
    category: 'security',
    color: 'text-emerald-600 dark:text-emerald-400',
    iconBgSolid: 'bg-emerald-500/12'
  },
  {
    id: 'logs',
    label: 'سجل الأمان',
    description: 'تتبع النشاطات والتغييرات الأمنية',
    icon: ScrollText,
    category: 'security',
    color: 'text-emerald-600 dark:text-emerald-400',
    iconBgSolid: 'bg-emerald-500/12'
  },
  {
    id: 'ip-protection',
    label: 'تنبيهات الدخول',
    description: 'استلام تنبيه عند تسجيل الدخول من موقع جديد',
    icon: Globe,
    category: 'security',
    color: 'text-emerald-600 dark:text-emerald-400',
    iconBgSolid: 'bg-emerald-500/12',
    badge: 'جديد'
  },
  // Integration Settings
  {
    id: 'overview',
    label: 'نظرة عامة',
    description: 'جميع التكاملات المتاحة',
    icon: Zap,
    category: 'integrations',
    color: 'text-violet-600 dark:text-violet-400',
    iconBgSolid: 'bg-violet-500/12'
  },
  {
    id: 'social',
    label: 'وسائل التواصل',
    description: 'ربط حسابات التواصل الاجتماعي',
    icon: Share2,
    category: 'integrations',
    color: 'text-violet-600 dark:text-violet-400',
    iconBgSolid: 'bg-violet-500/12'
  },
  {
    id: 'analytics',
    label: 'التحليلات',
    description: 'تتبع الأداء والإحصائيات',
    icon: TrendingUp,
    category: 'integrations',
    color: 'text-violet-600 dark:text-violet-400',
    iconBgSolid: 'bg-violet-500/12'
  },
  {
    id: 'notifications',
    label: 'الإشعارات',
    description: 'إدارة التنبيهات والإشعارات',
    icon: Bell,
    category: 'integrations',
    color: 'text-violet-600 dark:text-violet-400',
    iconBgSolid: 'bg-violet-500/12'
  },
  {
    id: 'storage',
    label: 'التخزين السحابي',
    description: 'ربط خدمات التخزين الخارجية',
    icon: Cloud,
    category: 'integrations',
    color: 'text-violet-600 dark:text-violet-400',
    iconBgSolid: 'bg-violet-500/12'
  },
  // Store Settings
  {
    id: 'store-general',
    label: 'إعدادات المتجر',
    description: 'الإعدادات العامة للمتجر',
    icon: Store,
    category: 'store',
    color: 'text-amber-600 dark:text-amber-400',
    iconBgSolid: 'bg-amber-500/12'
  },
  {
    id: 'products',
    label: 'المنتجات',
    description: 'إدارة المنتجات والفئات',
    icon: Package,
    category: 'store',
    color: 'text-amber-600 dark:text-amber-400',
    iconBgSolid: 'bg-amber-500/12'
  },
  {
    id: 'orders',
    label: 'الطلبات',
    description: 'إدارة الطلبات والمبيعات',
    icon: ScrollText,
    category: 'store',
    color: 'text-amber-600 dark:text-amber-400',
    iconBgSolid: 'bg-amber-500/12'
  },
  // Forms Settings
  {
    id: 'forms-general',
    label: 'إعدادات النماذج',
    description: 'الإعدادات العامة للنماذج',
    icon: FileText,
    category: 'forms',
    color: 'text-rose-600 dark:text-rose-400',
    iconBgSolid: 'bg-rose-500/12'
  },
  {
    id: 'templates',
    label: 'قوالب النماذج',
    description: 'إنشاء وإدارة قوالب النماذج',
    icon: FormInput,
    category: 'forms',
    color: 'text-rose-600 dark:text-rose-400',
    iconBgSolid: 'bg-rose-500/12'
  },
  {
    id: 'submissions',
    label: 'الإرساليات',
    description: 'عرض وإدارة البيانات المرسلة',
    icon: ScrollText,
    category: 'forms',
    color: 'text-rose-600 dark:text-rose-400',
    iconBgSolid: 'bg-rose-500/12'
  },
  // Events Settings
  {
    id: 'events-general',
    label: 'إعدادات الأحداث',
    description: 'الإعدادات العامة للأحداث',
    icon: Calendar,
    category: 'events',
    color: 'text-sky-600 dark:text-sky-400',
    iconBgSolid: 'bg-sky-500/12'
  },
  {
    id: 'tickets',
    label: 'التذاكر',
    description: 'إدارة التذاكر والحجوزات',
    icon: Ticket,
    category: 'events',
    color: 'text-sky-600 dark:text-sky-400',
    iconBgSolid: 'bg-sky-500/12'
  },
  {
    id: 'calendar',
    label: 'التقويم',
    description: 'جدولة الأحداث والمواعيد',
    icon: Calendar,
    category: 'events',
    color: 'text-sky-600 dark:text-sky-400',
    iconBgSolid: 'bg-sky-500/12'
  }
];

// Category info for headers - unified subtle primary-based colors
const categoryInfo = {
  security: {
    title: 'الأمان والخصوصية',
    description: 'حافظ على أمان حسابك وبياناتك الشخصية',
    icon: Shield,
    iconBg: 'bg-emerald-500/12',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-500/5',
    accentBorder: 'border-emerald-500/20',
    textColor: 'text-foreground'
  },
  integrations: {
    title: 'التكاملات',
    description: 'اربط تطبيقاتك وخدماتك المفضلة',
    icon: Link2,
    iconBg: 'bg-violet-500/12',
    iconColor: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-500/5',
    accentBorder: 'border-violet-500/20',
    textColor: 'text-foreground'
  },
  store: {
    title: 'المتجر',
    description: 'أدر متجرك ومنتجاتك بسهولة',
    icon: Store,
    iconBg: 'bg-amber-500/12',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-500/5',
    accentBorder: 'border-amber-500/20',
    textColor: 'text-foreground'
  },
  forms: {
    title: 'النماذج',
    description: 'أنشئ وأدر نماذجك الإلكترونية',
    icon: FileText,
    iconBg: 'bg-rose-500/12',
    iconColor: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-500/5',
    accentBorder: 'border-rose-500/20',
    textColor: 'text-foreground'
  },
  events: {
    title: 'الأحداث',
    description: 'نظم فعالياتك وتذاكرك',
    icon: Calendar,
    iconBg: 'bg-sky-500/12',
    iconColor: 'text-sky-600 dark:text-sky-400',
    accentBg: 'bg-sky-500/5',
    accentBorder: 'border-sky-500/20',
    textColor: 'text-foreground'
  }
};

/** Group settings by category for organized display */
const categories: SettingItem['category'][] = ['security', 'integrations', 'store', 'forms', 'events'];

/** Mobile list view: grouped by category inside shared containers */
const MobileSettingsList = ({
  settings,
  onSelect,
}: {
  settings: SettingItem[];
  onSelect: (id: SettingTab) => void;
}) => {
  const { logout, user } = useAuth();
  const router = useRouter();
  
  const grouped = useMemo(() => {
    return categories.map((cat) => ({
      category: cat,
      info: categoryInfo[cat],
      items: settings.filter((s) => s.category === cat),
    })).filter((g) => g.items.length > 0);
  }, [settings]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Profile Card */}
      {user && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Link href="/app/settings/profile">
            <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
              <div className="flex items-center gap-4 px-5 py-5 group transition-colors duration-150 hover:bg-muted/30 active:bg-muted/50">
                <Avatar className="h-14 w-14 shrink-0 ring-2 ring-primary/15">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name || user.username || undefined} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                    {user.name?.charAt(0) || user.username?.charAt(0) || <UserIcon className="w-6 h-6" />}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-foreground truncate">
                    {user.name || user.username}
                  </p>
                  <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/40 rtl:rotate-180" aria-hidden />
              </div>
            </div>
          </Link>
        </motion.section>
      )}

      {grouped.map(({ category, info, items }, groupIndex) => {
        const CatIcon = info.icon;
        return (
          <motion.section
            key={category}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.04, duration: 0.25 }}
          >
            {/* Unified card: header + items */}
            <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
              {/* Category header inside card */}
              <div className={cn(
                'flex items-center gap-3 px-5 py-3.5 border-b border-border/30',
                info.accentBg
              )}>
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  info.iconBg
                )}>
                  <CatIcon className={cn('h-4.5 w-4.5', info.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[14px] font-bold text-foreground">{info.title}</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{info.description}</p>
                </div>
              </div>

              {/* Items */}
              {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3.5 px-5 py-4 text-right',
                      'transition-colors duration-150 hover:bg-muted/30 active:bg-muted/50',
                      idx < items.length - 1 && 'border-b border-border/30'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105',
                        item.iconBgSolid
                      )}
                    >
                      <Icon className={cn('h-5 w-5', item.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[14px] font-medium text-foreground">{item.label}</p>
                        {item.badge && (
                          <span className={cn(
                            'shrink-0 inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold',
                            item.badge === 'موصى به' 
                              ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-sky-500/12 text-sky-600 dark:text-sky-400'
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 rtl:rotate-180" aria-hidden />
                  </button>
                );
              })}
            </div>
          </motion.section>
        );
      })}
      
      {/* Logout Button */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: grouped.length * 0.04, duration: 0.25 }}
      >
        <div className="rounded-3xl border border-destructive/20 bg-card overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-5 py-4 text-right group transition-colors duration-150 hover:bg-destructive/5 active:bg-destructive/10"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 transition-transform duration-150 group-hover:scale-105">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-destructive">تسجيل الخروج</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">الخروج من حسابك الحالي</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-destructive/30 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      </motion.section>
    </div>
  );
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
      <ComingSoonSection
        icon={Store}
        title="إعدادات المتجر"
        description="نعمل على تطوير أدوات متقدمة لإدارة متجرك الإلكتروني — إدارة المنتجات، الطلبات، والمزيد"
        accentColor="warning"
      />
    );
  }, []);

  const renderFormsContent = useCallback(() => {
    return (
      <ComingSoonSection
        icon={FileText}
        title="إعدادات النماذج"
        description="نعمل على تطوير أدوات متقدمة لإدارة نماذجك — قوالب جاهزة، تحليلات الردود، والمزيد"
        accentColor="destructive"
      />
    );
  }, []);

  const renderEventsContent = useCallback(() => {
    return (
      <ComingSoonSection
        icon={Calendar}
        title="إعدادات الأحداث"
        description="نعمل على تطوير أدوات متقدمة لإدارة فعالياتك — التذاكر، الجدولة، والمزيد"
        accentColor="success"
      />
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
      <div className="p-4 sm:p-6">
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Mobile: List view when no tab */}
      {isListMode && (
        <div className="lg:hidden animate-in fade-in duration-200">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-foreground">الإعدادات</h1>
            <p className="mt-1 text-sm text-muted-foreground">إدارة حسابك وتفضيلاتك</p>
          </div>
          <MobileSettingsList settings={allSettings} onSelect={navigateToTab} />
        </div>
      )}

      {/* Content (detail view): hide on mobile list mode */}
      {!isListMode && (
        <motion.div 
          key={activeTab} 
          className="min-w-0 flex-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={<SettingsSkeleton />}>
            {renderContent()}
          </Suspense>
        </motion.div>
      )}
    </div>
  );
}

/** Reusable "Coming Soon" placeholder for unreleased sections */
function ComingSoonSection({
  icon: Icon,
  title,
  description,
  accentColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accentColor: 'warning' | 'destructive' | 'success' | 'info' | 'primary';
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center px-6 py-14 sm:py-18">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="relative mb-5"
        >
          <div className="w-16 h-16 rounded-xl bg-primary/8 flex items-center justify-center">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="absolute -top-1.5 -left-1.5"
          >
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Construction className="w-3 h-3 text-primary" />
            </div>
          </motion.div>
        </motion.div>

        <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
        <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed mb-5">{description}</p>

        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/8 text-primary text-xs font-semibold">
          <Rocket className="w-3 h-3" />
          قريباً
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
          <p className="text-[13px] font-medium text-foreground">جاري تحميل الإعدادات</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">يرجى الانتظار...</p>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
