"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ShoppingBag,
  Users,
  Package,
  AlertCircle,
  CalendarDays,
  FileText,
  MessageSquare,
  Star,
  TrendingUp,
  LucideIcon,
  ChevronDown,
  Filter,
  Plus,
  Edit,
  Store,
  UserCircle,
  Bell,
  CheckCircle,
  Activity,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Activity {
  id?: string;
  type:
    | "order"
    | "user"
    | "product"
    | "alert"
    | "event"
    | "form"
    | "review"
    | "message"
    | "form_created"
    | "form_updated"
    | "form_submission"
    | "event_created"
    | "event_updated"
    | "event_registration"
    | "product_created"
    | "product_updated"
    | "store_created"
    | "order_received"
    | "profile_created"
    | "profile_updated";
  title: string;
  description: string;
  time: string;
  href?: string;
  avatar?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const activityIcons: Record<
  string,
  { icon: LucideIcon; colorBg: string; colorText: string }
> = {
  // Orders
  order: {
    icon: ShoppingBag,
    colorBg: "bg-info/10",
    colorText: "text-info",
  },
  order_received: {
    icon: ShoppingBag,
    colorBg: "bg-info/10",
    colorText: "text-info",
  },
  // Users & Profile
  user: {
    icon: Users,
    colorBg: "bg-success/10",
    colorText: "text-success",
  },
  profile_created: {
    icon: UserCircle,
    colorBg: "bg-success/10",
    colorText: "text-success",
  },
  profile_updated: {
    icon: Edit,
    colorBg: "bg-success/10",
    colorText: "text-success",
  },
  // Products
  product: {
    icon: Package,
    colorBg: "bg-violet-500/10",
    colorText: "text-violet-600 dark:text-violet-400",
  },
  product_created: {
    icon: Plus,
    colorBg: "bg-violet-500/10",
    colorText: "text-violet-600 dark:text-violet-400",
  },
  product_updated: {
    icon: Edit,
    colorBg: "bg-violet-500/10",
    colorText: "text-violet-600 dark:text-violet-400",
  },
  // Store
  store_created: {
    icon: Store,
    colorBg: "bg-warning/10",
    colorText: "text-warning",
  },
  // Alerts
  alert: {
    icon: AlertCircle,
    colorBg: "bg-warning/10",
    colorText: "text-warning",
  },
  // Events
  event: {
    icon: CalendarDays,
    colorBg: "bg-destructive/10",
    colorText: "text-destructive",
  },
  event_created: {
    icon: Plus,
    colorBg: "bg-destructive/10",
    colorText: "text-destructive",
  },
  event_updated: {
    icon: Edit,
    colorBg: "bg-destructive/10",
    colorText: "text-destructive",
  },
  event_registration: {
    icon: CheckCircle,
    colorBg: "bg-success/10",
    colorText: "text-success",
  },
  // Forms
  form: {
    icon: FileText,
    colorBg: "bg-primary/10",
    colorText: "text-primary",
  },
  form_created: {
    icon: Plus,
    colorBg: "bg-primary/10",
    colorText: "text-primary",
  },
  form_updated: {
    icon: Edit,
    colorBg: "bg-primary/10",
    colorText: "text-primary",
  },
  form_submission: {
    icon: Bell,
    colorBg: "bg-info/10",
    colorText: "text-info",
  },
  // Reviews & Messages
  review: {
    icon: Star,
    colorBg: "bg-warning/10",
    colorText: "text-warning",
  },
  message: {
    icon: MessageSquare,
    colorBg: "bg-primary/10",
    colorText: "text-primary",
  },
};

const filterOptions = [
  { value: "all", label: "الكل", icon: Activity },
  { value: "forms", label: "النماذج", icon: FileText },
  { value: "events", label: "الفعاليات", icon: CalendarDays },
  { value: "products", label: "المنتجات", icon: Package },
  { value: "orders", label: "الطلبات", icon: ShoppingBag },
  { value: "profile", label: "الملف الشخصي", icon: UserCircle },
];

// Helper to check if activity matches filter
function matchesFilter(activity: Activity, filter: string): boolean {
  if (filter === "all") return true;
  const filterMap: Record<string, string[]> = {
    forms: ["form", "form_created", "form_updated", "form_submission"],
    events: ["event", "event_created", "event_updated", "event_registration"],
    products: ["product", "product_created", "product_updated"],
    orders: ["order", "order_received", "store_created"],
    profile: ["user", "profile_created", "profile_updated"],
  };
  return filterMap[filter]?.includes(activity.type) || false;
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((a) => matchesFilter(a, filter));

  const displayedActivities = showAll 
    ? filteredActivities 
    : filteredActivities.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className={cn(
        "rounded-4xl overflow-hidden flex flex-col h-full",
        "bg-card border border-border/50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">النشاطات الأخيرة</h2>
          {filteredActivities.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary">
              {filteredActivities.length}
            </span>
          )}
        </div>
        
        {/* Filter Dropdown */}
        <div className="relative group">
          <button className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
            "bg-muted/40 hover:bg-muted/60 border border-border/30",
            "text-muted-foreground hover:text-foreground"
          )}>
            <Filter className="w-3.5 h-3.5" />
            <span>{filterOptions.find(f => f.value === filter)?.label}</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
          </button>
          <div className={cn(
            "absolute left-0 top-full mt-2 w-40 p-1.5 z-50",
            "rounded-xl bg-card border border-border/50",
            "shadow-lg",
            "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
          )}>
            {filterOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-xs text-right transition-all duration-200 flex items-center gap-2",
                    filter === option.value
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <OptionIcon className="w-3.5 h-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="flex-1 overflow-y-auto p-3 relative">
        <AnimatePresence mode="popLayout">
          {displayedActivities.length > 0 ? (
            <div className="space-y-1">
              {displayedActivities.map((activity, index) => {
                const iconConfig = activityIcons[activity.type] || activityIcons.alert;
                const Icon = iconConfig.icon;
                
                const content = (
                  <>
                    <div
                      className={cn(
                        "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                        "transition-all duration-200 group-hover:scale-105",
                        iconConfig.colorBg
                      )}
                    >
                      <Icon className={cn("w-5 h-5", iconConfig.colorText)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {activity.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-0.5 rounded-md">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {activity.description}
                      </p>
                    </div>
                  </>
                );
                
                return (
                  <motion.div
                    key={activity.id || `${activity.type}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.04, type: 'spring', stiffness: 300 }}
                  >
                    {activity.href ? (
                      <Link
                        href={activity.href}
                        className={cn(
                          "flex gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group",
                          "hover:bg-muted/40 border border-transparent hover:border-border/30"
                        )}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className={cn(
                        "flex gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group",
                        "hover:bg-muted/40 border border-transparent hover:border-border/30"
                      )}>
                        {content}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-12 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted/40 flex items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">لا توجد نشاطات</p>
              <p className="text-xs text-muted-foreground/70 mt-1">ستظهر النشاطات هنا عند حدوثها</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Bottom Fade Shadow */}
        {displayedActivities.length > 3 && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
        )}
      </div>

      {/* Show More Button */}
      {filteredActivities.length > 5 && (
        <div className="px-4 py-3 border-t border-border/50">
          <motion.button
            onClick={() => setShowAll(!showAll)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "w-full py-2.5 text-xs font-semibold rounded-lg transition-all duration-200",
              "flex items-center justify-center gap-1.5",
              "bg-primary/10 hover:bg-primary/15 text-primary",
              "border border-primary/20 hover:border-primary/30"
            )}
          >
            {showAll ? "عرض أقل" : `عرض الكل (${filteredActivities.length})`}
            <motion.div animate={{ rotate: showAll ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export function RecentActivitiesSkeleton() {
  return (
    <div className={cn(
      "rounded-xl overflow-hidden flex flex-col h-full",
      "bg-card border border-border/50"
    )}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
          <div className="w-24 h-4 rounded bg-muted animate-pulse" />
        </div>
        <div className="w-20 h-7 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="flex-1 p-3 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-24 h-4 rounded bg-muted animate-pulse" />
                <div className="w-12 h-4 rounded-md bg-muted animate-pulse" />
              </div>
              <div className="w-3/4 h-3 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
