'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  ShieldCheck,
  Smartphone,
  History,
  Link2,
  Bell,
  Cloud,
  Store,
  Package,
  ShoppingCart,
  FileText,
  FileEdit,
  Layers,
  Inbox,
  Calendar,
  Ticket,
  CalendarDays,
  ChevronLeft,
  Search,
  Settings,
  ArrowRight,
  HelpCircle,
  Menu,
  X,
  Globe,
  MonitorSmartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// Types & Data (shared with layout via export)
// ═══════════════════════════════════════════════════════════════════════════

export interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    label: 'الملف الشخصي',
    icon: User,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    items: [{ href: '/app/settings/profile', label: 'المعلومات الشخصية', icon: User }],
  },
  {
    id: 'security',
    label: 'الأمان والخصوصية',
    icon: Shield,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    items: [
      { href: '/app/settings?tab=2fa', label: 'المصادقة الثنائية', icon: ShieldCheck, badge: 'موصى به' },
      { href: '/app/settings?tab=sessions', label: 'الجلسات النشطة', icon: MonitorSmartphone },
      { href: '/app/settings?tab=devices', label: 'الأجهزة الموثوقة', icon: Smartphone },
      { href: '/app/settings?tab=logs', label: 'سجل الأمان', icon: History },
      { href: '/app/settings?tab=ip-protection', label: 'تنبيهات الدخول', icon: Globe, badge: 'جديد' },
    ],
  },
  {
    id: 'integrations',
    label: 'التكاملات والخدمات',
    icon: Link2,
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    items: [
      { href: '/app/settings?tab=notifications', label: 'الإشعارات', icon: Bell },
      { href: '/app/settings?tab=storage', label: 'التخزين السحابي', icon: Cloud },
    ],
  },
  {
    id: 'store',
    label: 'إدارة المتجر',
    icon: Store,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    items: [
      { href: '/app/settings?tab=store-general', label: 'إعدادات المتجر', icon: Store },
      { href: '/app/settings?tab=products', label: 'المنتجات', icon: Package },
      { href: '/app/settings?tab=orders', label: 'الطلبات', icon: ShoppingCart },
    ],
  },
  {
    id: 'forms',
    label: 'إدارة النماذج',
    icon: FileText,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    items: [
      { href: '/app/settings?tab=forms-general', label: 'إعدادات النماذج', icon: FileEdit },
      { href: '/app/settings?tab=templates', label: 'قوالب النماذج', icon: Layers },
      { href: '/app/settings?tab=submissions', label: 'الإرساليات', icon: Inbox },
    ],
  },
  {
    id: 'events',
    label: 'إدارة الأحداث',
    icon: Calendar,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    items: [
      { href: '/app/settings?tab=events-general', label: 'إعدادات الأحداث', icon: Calendar },
      { href: '/app/settings?tab=tickets', label: 'التذاكر', icon: Ticket },
      { href: '/app/settings?tab=calendar', label: 'التقويم', icon: CalendarDays },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Sidebar content (used in both desktop sidebar and mobile drawer)
// ═══════════════════════════════════════════════════════════════════════════

function SettingsSidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const getActiveSection = () => {
    if (pathname?.includes('/settings/profile')) return 'profile';
    const tab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
    if (tab) {
      const section = settingsSections.find((s) => s.items.some((i) => i.href.includes(`tab=${tab}`)));
      return section?.id ?? 'security';
    }
    return 'security';
  };

  const [openSection, setOpenSection] = useState<string | null>(getActiveSection);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  const isItemActive = (href: string) => {
    if (href.includes('?tab=')) {
      const tab = href.split('?tab=')[1]?.split('&')[0];
      return pathname === '/app/settings' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === tab;
    }
    return pathname === href;
  };

  const filteredSections = settingsSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.label.includes(searchQuery) || section.label.includes(searchQuery)),
    }))
    .filter((section) => section.items.length > 0 || section.label.includes(searchQuery));

  return (
    <>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Link href="/app" className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors" onClick={onItemClick}>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">الإعدادات</span>
        </div>
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 rounded-lg bg-muted/50 border-0 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredSections.map((section) => {
          const isOpen = openSection === section.id;
          const SectionIcon = section.icon;
          return (
            <div key={section.id}>
              <motion.button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg p-2 text-right transition-colors',
                  isOpen ? 'bg-muted/50 text-foreground' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                )}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div animate={{ rotate: isOpen ? -90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronLeft className="size-3 text-muted-foreground" />
                </motion.div>
                <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', section.iconBg)}>
                  <SectionIcon className={cn('size-3.5', section.iconColor)} />
                </div>
                <span className="text-xs font-medium flex-1">{section.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground">{section.items.length}</span>
              </motion.button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="py-1 pr-6 space-y-0.5">
                      {section.items.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item.href);
                        return (
                          <motion.div key={item.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                            <Link
                              href={item.href}
                              onClick={onItemClick}
                              className={cn(
                                'flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors',
                                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                              )}
                            >
                              <Icon className="size-3.5 shrink-0" />
                              <span className="text-xs flex-1">{item.label}</span>
                              {item.badge && (
                                <span
                                  className={cn(
                                    'px-1.5 py-0.5 text-[9px] font-medium rounded-full',
                                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Search className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <p className="text-xs">لا توجد نتائج</p>
          </div>
        )}
      </nav>

      <div className="p-2 border-t border-border/30">
        <Link href="/app/help" onClick={onItemClick}>
          <div className="p-2.5 rounded-lg bg-info/5 border border-info/10 hover:bg-info/10 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-3 h-3 text-info" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-foreground">تحتاج مساعدة؟</p>
                <p className="text-[10px] text-muted-foreground">الدعم الفني</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Desktop sidebar
// ═══════════════════════════════════════════════════════════════════════════

export function SettingsSidebarDesktop() {
  return (
    <aside className="hidden lg:flex flex-col shrink-0 w-[240px] mr-2 h-[calc(100svh-theme(spacing.4))] rounded-xl border border-border/40 bg-card">
      <SettingsSidebarContent />
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Mobile slider (drawer) + toggle button
// ═══════════════════════════════════════════════════════════════════════════

export function SettingsSidebarSlider() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="فتح قائمة الإعدادات"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] max-w-[85vw] flex flex-col rounded-l-2xl border-l border-t border-b border-border bg-card shadow-xl lg:hidden"
              dir="rtl"
            >
              <div className="flex items-center justify-between p-3 border-b border-border/40">
                <span className="text-sm font-semibold text-foreground">قائمة الإعدادات</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <SettingsSidebarContent onItemClick={() => setOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Combined: desktop sidebar + mobile slider
// ═══════════════════════════════════════════════════════════════════════════

export function SettingsSidebar() {
  return (
    <>
      <SettingsSidebarDesktop />
      <SettingsSidebarSlider />
    </>
  );
}
