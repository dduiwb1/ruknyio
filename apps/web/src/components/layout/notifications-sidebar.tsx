'use client';

/**
 * 📢 Notifications Sidebar Component
 * شريط جانبي للإشعارات - تصميم بسيط ومتناسق
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Clock, 
  User, 
  Package, 
  ShoppingBag, 
  FileText, 
  CalendarDays,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Store,
  Eye,
  ChevronDown,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildApiPath } from '@/lib/config';
import { secureFetch } from '@/lib/api/api-client';
import Link from 'next/link';

// ============ Types ============

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  href?: string;
  avatar?: string;
  createdAt: string;
}

// ============ Icon Mapping ============

const getActivityIcon = (type: string) => {
  const iconMap: Record<string, { icon: any; color: string; bg: string }> = {
    order: { icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    order_received: { icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    product: { icon: Package, color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    product_created: { icon: Package, color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    product_updated: { icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    store: { icon: Store, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    store_created: { icon: Store, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    user: { icon: User, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
    profile_created: { icon: User, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
    profile_updated: { icon: User, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
    event: { icon: CalendarDays, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    event_created: { icon: CalendarDays, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    event_updated: { icon: CalendarDays, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    event_registration: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    form: { icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    form_created: { icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    form_updated: { icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    form_submission: { icon: MessageSquare, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' },
    message: { icon: MessageSquare, color: 'text-sky-600', bg: 'bg-sky-100 dark:bg-sky-900/30' },
    review: { icon: Eye, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    alert: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  };
  return iconMap[type] || iconMap.alert;
};

// ============ Utility Functions ============

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} د`;
  if (diffHours < 24) return `منذ ${diffHours} س`;
  if (diffDays < 7) return `منذ ${diffDays} ي`;
  return date.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' });
}

// ============ Main Component ============

interface NotificationsSidebarProps {
  className?: string;
}

export function NotificationsSidebar({ className }: NotificationsSidebarProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<'notifications' | 'activities' | null>('notifications');
  const [searchQuery, setSearchQuery] = useState('');
  const fetchedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchActivities = async () => {
      try {
        const response = await secureFetch(buildApiPath('/dashboard/activity?limit=20'));
        
        // If 401, stop the interval - secureFetch will handle redirect
        if (response.status === 401) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          const formattedActivities: Activity[] = data.map((activity: any) => ({
            id: activity.id,
            type: activity.type,
            title: activity.title,
            description: activity.description || '',
            time: timeAgo(activity.createdAt),
            href: activity.href,
            avatar: activity.avatar,
            createdAt: activity.createdAt,
          }));
          setActivities(formattedActivities);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    intervalRef.current = setInterval(() => {
      fetchedRef.current = false;
      fetchActivities();
    }, 5 * 60 * 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (searchQuery) {
      return activity.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const notifications = filteredActivities.slice(0, 5);
  const olderActivities = filteredActivities.slice(5, 15);

  const toggleSection = (section: 'notifications' | 'activities') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <aside 
      className={cn(
        "flex flex-col m-2 ms-0 w-[240px] h-[calc(100svh-theme(spacing.4))] rounded-xl border border-border bg-card",
        className
      )}
      dir="rtl"
    >
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث في الإشعارات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-3 pr-8 rounded-lg bg-muted/50 border-0 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Notifications Section */}
        <div className="rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('notifications')}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg p-2 text-right transition-all h-9 text-sm",
              expandedSection === 'notifications'
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>الإشعارات الجديدة</span>
            </div>
            <div className="flex items-center gap-1.5">
              {notifications.length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-primary text-primary-foreground font-medium min-w-[16px] text-center">
                  {notifications.length}
                </span>
              )}
              <motion.div
                animate={{ rotate: expandedSection === 'notifications' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expandedSection === 'notifications' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="py-1 pr-2 space-y-0.5">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 animate-pulse">
                        <div className="w-7 h-7 rounded-lg bg-muted" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-muted rounded w-3/4" />
                          <div className="h-2 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      لا توجد إشعارات جديدة
                    </div>
                  ) : (
                    notifications.map((item) => {
                      const iconConfig = getActivityIcon(item.type);
                      const Icon = iconConfig.icon;
                      
                      return (
                        <Link
                          key={item.id}
                          href={item.href || '#'}
                          className="flex items-center gap-2 p-2 rounded-lg transition-all group hover:bg-accent"
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                            iconConfig.bg
                          )}>
                            <Icon className={cn("w-3.5 h-3.5", iconConfig.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {item.time}
                            </p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Activities Section */}
        <div className="rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('activities')}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg p-2 text-right transition-all h-9 text-sm",
              expandedSection === 'activities'
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>النشاطات السابقة</span>
            </div>
            <div className="flex items-center gap-1.5">
              {olderActivities.length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-muted text-muted-foreground font-medium">
                  {olderActivities.length}
                </span>
              )}
              <motion.div
                animate={{ rotate: expandedSection === 'activities' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expandedSection === 'activities' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="py-1 pr-2 space-y-0.5">
                  {olderActivities.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      لا توجد نشاطات سابقة
                    </div>
                  ) : (
                    olderActivities.map((item) => {
                      const iconConfig = getActivityIcon(item.type);
                      const Icon = iconConfig.icon;
                      
                      return (
                        <Link
                          key={item.id}
                          href={item.href || '#'}
                          className="flex items-center gap-2 p-2 rounded-lg transition-all group hover:bg-accent"
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                            iconConfig.bg
                          )}>
                            <Icon className={cn("w-3.5 h-3.5", iconConfig.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {item.time}
                            </p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Link
          href="/app/notifications"
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <span>عرض جميع الإشعارات</span>
        </Link>
      </div>
    </aside>
  );
}

export function NotificationsSidebarSkeleton({ className }: { className?: string }) {
  return (
    <aside 
      className={cn(
        "flex flex-col m-2 ms-0 w-[240px] h-[calc(100svh-theme(spacing.4))] rounded-xl border border-border bg-card animate-pulse",
        className
      )}
      dir="rtl"
    >
      <div className="p-3 border-b border-border">
        <div className="h-9 bg-muted rounded-lg" />
      </div>
      <div className="flex-1 p-2.5 space-y-1">
        <div className="h-9 bg-muted rounded-lg" />
        <div className="space-y-1 py-1 pr-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 p-2">
              <div className="w-7 h-7 bg-muted rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-9 bg-muted rounded-lg" />
      </div>
      <div className="p-3 border-t border-border">
        <div className="h-8 bg-muted rounded-lg" />
      </div>
    </aside>
  );
}
