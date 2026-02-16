'use client';

/**
 * 📢 صفحة الإشعارات - Notifications Page
 * صفحة منفصلة لعرض جميع الإشعارات والنشاطات
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
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
  Filter,
  Search,
  Check,
  CheckCheck,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildApiPath } from '@/lib/config';
import { secureFetch } from '@/lib/api/api-client';
import Link from 'next/link';

// ============ Types ============

interface Notification {
  id: string;
  type: string;
  title: string;
  description?: string;
  time: string;
  createdAt: string;
  read: boolean;
  href?: string;
  avatar?: string;
}

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

const getNotificationIcon = (type: string) => {
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
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' });
}

function groupByDate(items: (Notification | Activity)[]): Record<string, (Notification | Activity)[]> {
  const groups: Record<string, (Notification | Activity)[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  items.forEach(item => {
    const itemDate = new Date(item.createdAt);
    itemDate.setHours(0, 0, 0, 0);

    let group: string;
    if (itemDate.getTime() === today.getTime()) {
      group = 'اليوم';
    } else if (itemDate.getTime() === yesterday.getTime()) {
      group = 'أمس';
    } else if (itemDate >= weekAgo) {
      group = 'هذا الأسبوع';
    } else {
      group = 'سابقاً';
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });

  return groups;
}

// ============ Main Component ============

export default function NotificationsPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const initializedRef = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch notifications/activities
  useEffect(() => {
    if (!isAuthenticated) return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await secureFetch(buildApiPath('/dashboard/activity?limit=50'));
        
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
        // Error fetching notifications
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return activity.title.toLowerCase().includes(query) || 
             activity.description.toLowerCase().includes(query);
    }
    return true;
  });

  // Group activities by date
  const groupedActivities = groupByDate(filteredActivities);
  const groupOrder = ['اليوم', 'أمس', 'هذا الأسبوع', 'سابقاً'];

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 flex-col bg-background dark:bg-zinc-950 m-2 md:ms-0 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 overflow-hidden transition-all duration-300 ease-in-out"
      dir="rtl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/[0.05] via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">الإشعارات والنشاطات</h1>
                <p className="text-sm text-muted-foreground">
                  {activities.length} إشعار
                </p>
              </div>
            </div>
            
            <Link 
              href="/app"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>العودة</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="البحث في الإشعارات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-10 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  filter === 'all'
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                الكل
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  filter === 'unread'
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                غير مقروء
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4 sm:p-6 space-y-6">
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                لا توجد إشعارات
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchQuery 
                  ? 'لم يتم العثور على نتائج مطابقة لبحثك'
                  : 'ستظهر الإشعارات هنا عندما يكون لديك نشاط جديد'
                }
              </p>
            </motion.div>
          ) : (
            // Grouped notifications
            <div className="space-y-6">
              {groupOrder.map(group => {
                const items = groupedActivities[group];
                if (!items || items.length === 0) return null;

                return (
                  <div key={group}>
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {group}
                      <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                        {items.length}
                      </span>
                    </h2>
                    
                    <div className="space-y-2">
                      <AnimatePresence>
                        {items.map((item, index) => {
                          const iconConfig = getNotificationIcon(item.type);
                          const Icon = iconConfig.icon;
                          
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.03 }}
                              className="group"
                            >
                              <Link
                                href={(item as Activity).href || '#'}
                                className={cn(
                                  "flex items-start gap-3 p-4 rounded-xl bg-card border border-border",
                                  "hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm",
                                  "transition-all duration-200 cursor-pointer"
                                )}
                              >
                                {/* Icon */}
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                  iconConfig.bg
                                )}>
                                  <Icon className={cn("w-5 h-5", iconConfig.color)} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                    {item.title}
                                  </p>
                                  {(item as Activity).description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                      {(item as Activity).description}
                                    </p>
                                  )}
                                </div>

                                {/* Time */}
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {item.time}
                                </span>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
