'use client';

import { useState, useEffect, Suspense, useCallback, useMemo, startTransition, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

/* =========================================================================
   Loading skeleton
   ========================================================================= */
const SettingsSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {/* Profile skeleton */}
    <div className="rounded-2xl bg-card border border-border/40 p-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 bg-muted rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded-lg w-32" />
          <div className="h-3 bg-muted/50 rounded-lg w-44" />
        </div>
      </div>
    </div>
    {/* Section skeletons */}
    {[1, 2, 3].map(g => (
      <div key={g} className="rounded-2xl border border-border/40 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30">
          <div className="h-3.5 bg-muted rounded w-24" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className={cn(
            "flex items-center gap-3 px-4 py-3.5",
            i < 3 && "border-b border-border/20"
          )}>
            <div className="w-10 h-10 bg-muted/60 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-muted rounded w-24" />
              <div className="h-3 bg-muted/40 rounded w-36" />
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

/* =========================================================================
   Lazy-loaded settings components
   ========================================================================= */
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

/* =========================================================================
   Types & Data
   ========================================================================= */
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
  iconBg: string;
  badge?: string;
  badgeVariant?: 'success' | 'info';
}

const allSettings: SettingItem[] = [
  // Security
  { id: '2fa', label: 'المصادقة الثنائية', description: 'أضف طبقة حماية إضافية', icon: Shield, category: 'security', color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15', badge: 'موصى به', badgeVariant: 'success' },
  { id: 'sessions', label: 'الجلسات النشطة', description: 'إدارة الأجهزة المتصلة', icon: MonitorSmartphone, category: 'security', color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15' },
  { id: 'devices', label: 'الأجهزة الموثوقة', description: 'أجهزة تسجيل الدخول', icon: Smartphone, category: 'security', color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15' },
  { id: 'logs', label: 'سجل الأمان', description: 'تتبع النشاطات الأمنية', icon: ScrollText, category: 'security', color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15' },
  { id: 'ip-protection', label: 'تنبيهات الدخول', description: 'تنبيه عند دخول من موقع جديد', icon: Globe, category: 'security', color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15', badge: 'جديد', badgeVariant: 'info' },
  // Integrations
  { id: 'overview', label: 'نظرة عامة', description: 'جميع التكاملات المتاحة', icon: Zap, category: 'integrations', color: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-500/10 dark:bg-violet-500/15' },
  { id: 'social', label: 'وسائل التواصل', description: 'ربط حسابات التواصل', icon: Share2, category: 'integrations', color: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-500/10 dark:bg-violet-500/15' },
  { id: 'analytics', label: 'التحليلات', description: 'تتبع الأداء والإحصائيات', icon: TrendingUp, category: 'integrations', color: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-500/10 dark:bg-violet-500/15' },
  { id: 'notifications', label: 'الإشعارات', description: 'إدارة التنبيهات', icon: Bell, category: 'integrations', color: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-500/10 dark:bg-violet-500/15' },
  { id: 'storage', label: 'التخزين السحابي', description: 'ربط خدمات التخزين', icon: Cloud, category: 'integrations', color: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-500/10 dark:bg-violet-500/15' },
  // Store
  { id: 'store-general', label: 'إعدادات المتجر', description: 'الإعدادات العامة', icon: Store, category: 'store', color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-500/10 dark:bg-amber-500/15' },
  { id: 'products', label: 'المنتجات', description: 'إدارة المنتجات والفئات', icon: Package, category: 'store', color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-500/10 dark:bg-amber-500/15' },
  { id: 'orders', label: 'الطلبات', description: 'إدارة الطلبات والمبيعات', icon: ScrollText, category: 'store', color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-500/10 dark:bg-amber-500/15' },
  // Forms
  { id: 'forms-general', label: 'إعدادات النماذج', description: 'الإعدادات العامة', icon: FileText, category: 'forms', color: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-500/10 dark:bg-rose-500/15' },
  { id: 'templates', label: 'قوالب النماذج', description: 'إنشاء وإدارة القوالب', icon: FormInput, category: 'forms', color: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-500/10 dark:bg-rose-500/15' },
  { id: 'submissions', label: 'الإرساليات', description: 'عرض البيانات المرسلة', icon: ScrollText, category: 'forms', color: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-500/10 dark:bg-rose-500/15' },
  // Events
  { id: 'events-general', label: 'إعدادات الأحداث', description: 'الإعدادات العامة', icon: Calendar, category: 'events', color: 'text-sky-600 dark:text-sky-400', iconBg: 'bg-sky-500/10 dark:bg-sky-500/15' },
  { id: 'tickets', label: 'التذاكر', description: 'إدارة التذاكر والحجوزات', icon: Ticket, category: 'events', color: 'text-sky-600 dark:text-sky-400', iconBg: 'bg-sky-500/10 dark:bg-sky-500/15' },
  { id: 'calendar', label: 'التقويم', description: 'جدولة الأحداث والمواعيد', icon: Calendar, category: 'events', color: 'text-sky-600 dark:text-sky-400', iconBg: 'bg-sky-500/10 dark:bg-sky-500/15' },
];

const categoryInfo = {
  security: { title: 'الأمان والخصوصية', icon: Shield, accent: 'emerald' as const },
  integrations: { title: 'التكاملات', icon: Link2, accent: 'violet' as const },
  store: { title: 'المتجر', icon: Store, accent: 'amber' as const },
  forms: { title: 'النماذج', icon: FileText, accent: 'rose' as const },
  events: { title: 'الأحداث', icon: Calendar, accent: 'sky' as const },
};

const accentClasses = {
  emerald: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  violet: { dot: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/20' },
  amber: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  rose: { dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
  sky: { dot: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/20' },
};

const categoryOrder: (keyof typeof categoryInfo)[] = ['security', 'integrations', 'store', 'forms', 'events'];

/* =========================================================================
   Mobile List View
   ========================================================================= */
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
    return categoryOrder.map((cat) => ({
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
    <div className="space-y-3 pb-8">
      {/* ── Profile Card ── */}
      {user && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Link href="/app/settings/profile">
            <div className="group relative rounded-2xl border border-border/40 bg-card overflow-hidden transition-shadow duration-200 hover:shadow-md active:shadow-sm">
              {/* Subtle gradient accent at top */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-l from-primary/60 via-primary/30 to-transparent" />
              <div className="flex items-center gap-3.5 px-4 py-4">
                <div className="relative">
                  <Avatar className="h-[52px] w-[52px] shrink-0 ring-[2.5px] ring-primary/10 ring-offset-2 ring-offset-card">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name || user.username || undefined} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary text-base font-bold">
                      {user.name?.charAt(0) || user.username?.charAt(0) || <UserIcon className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online dot */}
                  <span className="absolute -bottom-0.5 -left-0.5 block h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-foreground truncate leading-tight">
                    {user.name || user.username}
                  </p>
                  <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                    {user.email}
                  </p>
                  <p className="mt-1 text-[11px] text-primary font-medium">عرض الملف الشخصي</p>
                </div>
                <ChevronRight className="h-4.5 w-4.5 shrink-0 text-muted-foreground/30 rtl:rotate-180 transition-transform duration-200 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" aria-hidden />
              </div>
            </div>
          </Link>
        </motion.section>
      )}

      {/* ── Category Groups ── */}
      {grouped.map(({ category, info, items }, groupIndex) => {
        const accent = accentClasses[info.accent];
        return (
          <motion.section
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + groupIndex * 0.04, duration: 0.3, ease: 'easeOut' }}
          >
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              {/* Category label */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border/25">
                <span className={cn('block h-2 w-2 rounded-full shrink-0', accent.dot)} />
                <h2 className={cn('text-[13px] font-bold', accent.text)}>
                  {info.title}
                </h2>
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
                      'group w-full flex items-center gap-3 px-4 py-3 text-right min-h-[52px]',
                      'transition-all duration-150 hover:bg-muted/40 active:bg-muted/60 active:scale-[0.995]',
                      idx < items.length - 1 && 'border-b border-border/20'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105 group-active:scale-100',
                        item.iconBg
                      )}
                    >
                      <Icon className={cn('h-[18px] w-[18px]', item.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[14px] font-medium text-foreground">{item.label}</p>
                        {item.badge && (
                          <span className={cn(
                            'shrink-0 inline-flex items-center gap-1 px-1.5 py-px rounded-md text-[10px] font-bold uppercase tracking-wide',
                            item.badgeVariant === 'success'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          )}>
                            <Sparkles className="h-2.5 w-2.5" />
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-px line-clamp-1 text-[12px] text-muted-foreground/80">{item.description}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/25 rtl:rotate-180 transition-transform duration-200 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" aria-hidden />
                  </button>
                );
              })}
            </div>
          </motion.section>
        );
      })}

      {/* ── Logout ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 + grouped.length * 0.04, duration: 0.3, ease: 'easeOut' }}
      >
        <div className="rounded-2xl border border-destructive/15 bg-card overflow-hidden">
          <button
            type="button"
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-4 py-3.5 text-right transition-all duration-150 hover:bg-destructive/5 active:bg-destructive/10 active:scale-[0.995] min-h-[52px]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/8 transition-all duration-200 group-hover:scale-105 group-active:scale-100">
              <LogOut className="h-[18px] w-[18px] text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-destructive">تسجيل الخروج</p>
              <p className="mt-px text-[12px] text-muted-foreground/70">الخروج من حسابك</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-destructive/20 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      </motion.section>
    </div>
  );
};

/* =========================================================================
   Hook: mobile breakpoint (lg = 1024px)
   ========================================================================= */
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

/* =========================================================================
   Settings Content (main controller)
   ========================================================================= */
function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const tabParam = searchParams.get('tab') as SettingTab | null;
  const hasValidTab = tabParam && allSettings.some((s) => s.id === tabParam);

  const activeTab = useMemo<SettingTab>(() => {
    if (hasValidTab) return tabParam!;
    return '2fa';
  }, [tabParam, hasValidTab]);

  const isListMode = isMobile === true && !hasValidTab;
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

  const renderSecurityContent = useCallback(() => {
    switch (activeTab) {
      case '2fa': return <TwoFactorAuth />;
      case 'sessions': return <SessionsManager />;
      case 'devices': return <TrustedDevices />;
      case 'logs': return <SecurityLogs />;
      case 'ip-protection': return <IPProtectionSettings />;
      default: return null;
    }
  }, [activeTab]);

  const renderIntegrationContent = useCallback(() => {
    switch (activeTab) {
      case 'overview': return <IntegrationsOverview />;
      case 'social': return <SocialIntegrations />;
      case 'analytics': return <AnalyticsIntegrations />;
      case 'notifications': return <NotificationIntegrations />;
      case 'storage': return <StorageIntegrations />;
      default: return null;
    }
  }, [activeTab]);

  const renderStoreContent = useCallback(() => (
    <ComingSoonSection icon={Store} title="إعدادات المتجر" description="نعمل على تطوير أدوات متقدمة لإدارة متجرك الإلكتروني — إدارة المنتجات، الطلبات، والمزيد" />
  ), []);

  const renderFormsContent = useCallback(() => (
    <ComingSoonSection icon={FileText} title="إعدادات النماذج" description="نعمل على تطوير أدوات متقدمة لإدارة نماذجك — قوالب جاهزة، تحليلات الردود، والمزيد" />
  ), []);

  const renderEventsContent = useCallback(() => (
    <ComingSoonSection icon={Calendar} title="إعدادات الأحداث" description="نعمل على تطوير أدوات متقدمة لإدارة فعالياتك — التذاكر، الجدولة، والمزيد" />
  ), []);

  const renderContent = useCallback(() => {
    const setting = allSettings.find(s => s.id === activeTab);
    if (!setting) return null;
    if (setting.category === 'security') return renderSecurityContent();
    if (setting.category === 'integrations') return renderIntegrationContent();
    if (setting.category === 'store') return renderStoreContent();
    if (setting.category === 'forms') return renderFormsContent();
    if (setting.category === 'events') return renderEventsContent();
    return null;
  }, [activeTab, renderSecurityContent, renderIntegrationContent, renderStoreContent, renderFormsContent, renderEventsContent]);

  if (isLoading) {
    return (
      <div className="px-4 py-5 sm:px-6">
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:px-6 space-y-4 max-w-2xl mx-auto">
      {/* Mobile: List view */}
      {isListMode && (
        <div className="lg:hidden">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-4 flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">الإعدادات</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">إدارة حسابك وتفضيلاتك</p>
            </div>
          </motion.div>

          <MobileSettingsList settings={allSettings} onSelect={navigateToTab} />
        </div>
      )}

      {/* Detail view */}
      {!isListMode && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="min-w-0 flex-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Suspense fallback={<SettingsSkeleton />}>
              {renderContent()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/* =========================================================================
   Coming Soon placeholder
   ========================================================================= */
function ComingSoonSection({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20">
        {/* Animated icon group */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 180 }}
          className="relative mb-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center">
            <Icon className="w-7 h-7 text-primary/70" />
          </div>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -top-2 -left-2"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shadow-sm">
              <Construction className="w-3.5 h-3.5 text-primary" />
            </div>
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -bottom-1 -right-1"
          >
            <div className="w-5 h-5 rounded-md bg-primary/8 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-primary/60" />
            </div>
          </motion.div>
        </motion.div>

        <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
        <p className="text-[13px] text-muted-foreground max-w-[280px] leading-relaxed mb-6">{description}</p>

        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/8 text-primary text-[13px] font-semibold">
          <Rocket className="w-3.5 h-3.5" />
          قريباً
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Page export
   ========================================================================= */
export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
          <p className="text-[13px] font-medium text-foreground">جاري تحميل الإعدادات</p>
          <p className="text-[11px] text-muted-foreground mt-1">يرجى الانتظار...</p>
        </motion.div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
