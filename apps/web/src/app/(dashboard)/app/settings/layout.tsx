'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Store,
  Bell,
  Palette,
  Puzzle,
  ChevronLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePhonePreview } from '@/components/(app)/shared/phone-preview-context';

interface SettingsNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;      // Icon color
  bgColor: string;    // Icon background
}

const settingsNavItems: SettingsNavItem[] = [
  {
    href: '/app/settings/profile',
    label: 'المعلومات الشخصية',
    icon: User,
    description: 'الاسم والصورة والنبذة والعنوان',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950/50',
  },
  {
    href: '/app/settings/account',
    label: 'الأمان وتسجيل الدخول',
    icon: Shield,
    description: 'كلمة المرور والمصادقة الثنائية',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/50',
  },
  {
    href: '/app/settings/store',
    label: 'المتجر',
    icon: Store,
    description: 'إعدادات المتجر والتجارة والدفع',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-950/50',
  },
  {
    href: '/app/settings/notifications',
    label: 'الإشعارات',
    icon: Bell,
    description: 'تفضيلات الإشعارات والتنبيهات',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100 dark:bg-rose-950/50',
  },
  {
    href: '/app/settings/appearance',
    label: 'المظهر',
    icon: Palette,
    description: 'الثيم والألوان وتخطيط الصفحة',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100 dark:bg-violet-950/50',
  },
  {
    href: '/app/settings/integrations',
    label: 'التطبيقات والخدمات',
    icon: Puzzle,
    description: 'ربط التطبيقات والخدمات الخارجية',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100 dark:bg-teal-950/50',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { collapsed } = usePhonePreview();

  const isActive = (href: string) => {
    if (href === '/app/settings/profile') {
      return pathname === '/app/settings' || pathname === '/app/settings/profile';
    }
    return pathname.startsWith(href);
  };

  const activeItem = settingsNavItems.find((item) => isActive(item.href));
  const isMainSettingsPage = pathname === '/app/settings';

  return (
    <div className={cn(
      'flex gap-5 mt-8 min-h-[calc(100vh-5rem)] transition-all duration-300',
      collapsed && 'max-w-6xl'
    )}>
      {/* Settings Sidebar - Desktop */}
      <nav className={cn(
        'hidden mt-2 lg:flex shrink-0 flex-col sticky top-16 self-start transition-all duration-300',
        collapsed ? 'w-[220px]' : 'w-[200px]'
      )}>
        <div className="mb-4">
          <h1 className="text-base font-bold text-foreground">الإعدادات</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            إدارة حسابك وتفضيلاتك
          </p>
        </div>

        <div className="space-y-0.5">
          {settingsNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-colors',
                  active
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'size-4 shrink-0',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <div className="flex flex-col min-w-0">
                  <span>{item.label}</span>
                  <span className="text-[11px] text-muted-foreground font-normal truncate">
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile: Sub-page header with back button */}
      <div className="flex-1 min-w-0 pt-0 lg:pt-0">
        {/* Mobile: Settings Home - Card Navigation */}
        {isMainSettingsPage && (
          <div className="lg:hidden">
            <div className="mb-5">
              <h1 className="text-xl font-bold text-foreground">الإعدادات</h1>
              <p className="text-sm text-muted-foreground mt-1">
                إدارة حسابك وتفضيلاتك
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-3 mb-6"
            >
              {settingsNavItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-4 rounded-2xl bg-muted/30 hover:bg-muted/50 p-4 transition-all duration-200 active:scale-[0.98] group"
                  >
                    <div className={cn(
                      'flex items-center justify-center size-11 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-105',
                      item.bgColor
                    )}>
                      <item.icon className={cn('size-5', item.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold text-foreground leading-tight">
                        {item.label}
                      </h3>
                      <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <ChevronLeft className="size-4 text-muted-foreground shrink-0 rotate-180 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Sub-page mobile padding for fixed header */}
        {!isMainSettingsPage && (
          <div className="lg:hidden pt-14" />
        )}

        {/* Content Header - Desktop only (mobile has its own headers) */}
        <div className="hidden lg:block mb-5">
          <h2 className="text-lg font-bold text-foreground">
            {activeItem?.label || 'الإعدادات'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {activeItem?.description || 'إدارة حسابك وتفضيلاتك'}
          </p>
        </div>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={cn(isMainSettingsPage && 'hidden lg:block')}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
