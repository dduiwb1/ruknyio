'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Home, 
  Settings, 
  Shield, 
  MonitorSmartphone, 
  Smartphone, 
  ScrollText, 
  Globe, 
  Link2, 
  Share2, 
  TrendingUp, 
  Bell, 
  Cloud, 
  Store, 
  Package, 
  Zap, 
  FileText, 
  FormInput, 
  Calendar, 
  Ticket 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// خريطة الأقسام والعناوين
const sectionMap: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  'profile': { label: 'الملف الشخصي', icon: Settings },
  '2fa': { label: 'المصادقة الثنائية', icon: Shield },
  'sessions': { label: 'الجلسات', icon: MonitorSmartphone },
  'devices': { label: 'الأجهزة', icon: Smartphone },
  'logs': { label: 'سجل الأمان', icon: ScrollText },
  'ip-protection': { label: 'حماية الآيبي', icon: Globe },
  'overview': { label: 'التكاملات', icon: Link2 },
  'social': { label: 'التواصل الاجتماعي', icon: Share2 },
  'analytics': { label: 'التحليلات', icon: TrendingUp },
  'notifications': { label: 'الإشعارات', icon: Bell },
  'storage': { label: 'التخزين', icon: Cloud },
  'store-general': { label: 'إعدادات المتجر', icon: Store },
  'products': { label: 'المنتجات', icon: Package },
  'orders': { label: 'الطلبات', icon: Zap },
  'forms-general': { label: 'إعدادات النماذج', icon: FileText },
  'templates': { label: 'القوالب', icon: FormInput },
  'submissions': { label: 'الإرسالات', icon: ScrollText },
  'events-general': { label: 'إعدادات الفعاليات', icon: Calendar },
  'tickets': { label: 'التذاكر', icon: Ticket },
  'calendar': { label: 'التقويم', icon: Calendar },
};

function generateBreadcrumbItems(pathname: string, searchParams: URLSearchParams): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'الرئيسية', href: '/app', icon: Home }
  ];

  // إضافة صفحة الإعدادات
  items.push({ label: 'الإعدادات', href: '/app/settings', icon: Settings });

  // التحقق من المسار الحالي
  if (pathname.includes('/settings/profile')) {
    items.push({ label: 'الملف الشخصي', icon: Settings });
  } else {
    const tab = searchParams.get('tab');
    if (tab && sectionMap[tab]) {
      const section = sectionMap[tab];
      items.push({ label: section.label, icon: section.icon });
    }
  }

  return items;
}

export function SettingsBreadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const breadcrumbItems = items || generateBreadcrumbItems(pathname, searchParams);

  return (
    <nav 
      aria-label="مسار التنقل"
      className={cn(
        "flex items-center gap-1 text-[13px]",
        className
      )}
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;

        return (
          <Fragment key={index}>
            {index > 0 && (
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/40 mx-0.5" />
            )}
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors",
              isLast 
                ? "bg-muted/50 text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}>
              {Icon && (
                <Icon className={cn(
                  "w-3.5 h-3.5",
                  isLast ? "text-foreground" : "text-muted-foreground/70"
                )} />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors font-medium text-[13px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(
                  "font-medium text-[13px]",
                  isLast ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              )}
            </div>
          </Fragment>
        );
      })}
    </nav>
  );
}