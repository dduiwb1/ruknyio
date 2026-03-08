"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronLeft,
  Star,
  LayoutGrid,
  FileText,
  Store,
  BarChart3,
  Zap,
  User,
  Bell,
  Shield,
  Crown,
  Sparkles,
  ShoppingBag,
  Calendar,
  Package,
  Tag,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useAuth } from "@/providers";
import { cn } from "@/lib/utils";
import { buildApiPath } from "@/lib/config";
import { secureFetch } from "@/lib/api/api-client";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  items: NavItem[];
}

const dropdownTransition = { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const };

const collapseVariants = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  visible: {
    height: "auto",
    opacity: 1,
  },
};

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout: handleLogout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("pages");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationFetchedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await secureFetch(buildApiPath("/notifications/unread-count"));
        if (res.ok) {
          const data = await res.json();
          setNotificationCount(data.unreadCount ?? 0);
        }
      } catch {
        /* ignore */
      }
    };
    if (user && !notificationFetchedRef.current) {
      notificationFetchedRef.current = true;
      fetchNotificationCount();
      const t = setInterval(fetchNotificationCount, 5 * 60 * 1000);
      return () => clearInterval(t);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user?.avatar) setAvatarLoadFailed(false);
  }, [user?.avatar]);

  const toggleSection = (sectionId: string) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const getPlanInfo = () => {
    const r = user?.role?.toUpperCase();
    switch (r) {
      case "ADMIN":
      case "SUPER_ADMIN":
        return { label: "مشرف", icon: Shield, className: "text-primary" };
      case "PREMIUM":
        return { label: "مميز", icon: Crown, className: "text-warning" };
      case "PRO":
        return { label: "احترافي", icon: Sparkles, className: "text-info" };
      default:
        return { label: "الباقة مجاني", icon: Star, className: "text-muted-foreground" };
    }
  };
  const planInfo = getPlanInfo();
  const PlanIcon = planInfo.icon;

  const navSections: NavSection[] = [
    {
      id: "main",
      label: "الرئيسية",
      icon: LayoutGrid,
      iconBg: "bg-primary",
      iconColor: "text-white",
      items: [
        { href: "/app", label: "لوحة التحكم", icon: LayoutGrid },
        { href: "/app/analytics", label: "الإحصائيات", icon: BarChart3 },
      ],
    },
    {
      id: "profile",
      label: "الملف الشخصي",
      icon: User,
      iconBg: "bg-success",
      iconColor: "text-white",
      items: [
        { href: "/app/profile", label: "صفحتي", icon: User },
        { href: "/app/settings", label: "الإعدادات", icon: Settings },
        { href: "/app/notifications", label: "الإشعارات", icon: Bell },
      ],
    },
    {
      id: "store",
      label: "المتجر",
      icon: Store,
      iconBg: "bg-warning",
      iconColor: "text-white",
      items: [
        { href: "/app/store", label: "نظرة عامة", icon: Store },
        { href: "/app/store/products", label: "المنتجات", icon: Package },
        { href: "/app/store/orders", label: "الطلبات", icon: ShoppingBag },
        { href: "/app/store/categories", label: "التصنيفات", icon: Tag },
      ],
    },
    {
      id: "forms",
      label: "النماذج",
      icon: FileText,
      iconBg: "bg-destructive",
      iconColor: "text-white",
      items: [
        { href: "/app/forms", label: "جميع النماذج", icon: FileText },
        { href: "/app/forms/responses", label: "الردود", icon: MessageSquare },
        { href: "/app/forms/create?new=true", label: "إنشاء نموذج", icon: Plus },
      ],
    },
    {
      id: "events",
      label: "الفعاليات",
      icon: Calendar,
      iconBg: "bg-info",
      iconColor: "text-white",
      items: [
        { href: "/app/events", label: "جميع الفعاليات", icon: Calendar },
        { href: "/app/events/create", label: "إنشاء فعالية", icon: Plus },
      ],
    },
  ];

  const isItemActive = (item: NavItem): boolean => {
    if (pathname === item.href) return true;
    return !!item.children?.some((c) => pathname === c.href);
  };

  return (
    <aside
      className={cn(
        "flex h-[calc(100svh-theme(spacing.4))] w-[260px] flex-col rounded-2xl border border-border/50 bg-card m-2",
        className
      )}
      dir="rtl"
    >
      {/* Profile header */}
      <div className="relative p-4" ref={profileRef}>
        <button
          type="button"
          onClick={() => setIsProfileOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-right transition-colors hover:bg-muted/50"
        >
          {mounted && user?.avatar && !avatarLoadFailed ? (
            <img
              src={user.avatar}
              alt={user?.name ?? "المستخدم"}
              className="size-9 shrink-0 rounded-full object-cover"
              onError={() => setAvatarLoadFailed(true)}
            />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {mounted ? (user?.name?.charAt(0)?.toUpperCase() ?? "R") : "R"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">
              {mounted ? (user?.name ?? user?.username ?? "المستخدم") : "المستخدم"}
            </p>
          </div>
          <ChevronDown
            className={cn("size-4 shrink-0 text-muted-foreground/70 transition-transform", isProfileOpen && "rotate-180")}
            aria-hidden
          />
        </button>

        {isProfileOpen && (
          <div className="absolute left-2 right-2 top-full z-50 mt-2 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-sm p-2.5">
            {/* Menu Items */}
            <div className="space-y-1">
              <Link
                href="/app/profile"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/50"
              >
                <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                  <User className="size-4 text-success" />
                </div>
                <span>الملف الشخصي</span>
              </Link>
              <Link
                href="/app/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/50"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings className="size-4 text-primary" />
                </div>
                <span>الإعدادات</span>
              </Link>
              <Link
                href="/app/notifications"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-info/10 flex items-center justify-center">
                    <Bell className="size-4 text-info" />
                  </div>
                  <span>الإشعارات</span>
                </div>
                {notificationCount > 0 && (
                  <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="h-px bg-border/50 mx-1 my-2" />

            {/* Logout */}
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                <LogOut className="size-4" />
              </div>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navSections.map((section) => {
          const isExpanded = expandedSection === section.id;
          const SectionIcon = section.icon;

          return (
            <div key={section.id} className="rounded-2xl overflow-hidden">
              {/* Section Header */}
              <motion.button
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 overflow-hidden rounded-xl p-2.5 text-right outline-none ring-primary/50 transition-all h-10 text-sm",
                  "focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
                  "[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
                  isExpanded
                    ? "bg-muted/60 text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2.5 flex-1">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <ChevronLeft className="size-3.5 text-muted-foreground/70" />
                  </motion.div>
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", section.iconBg)}>
                    <SectionIcon className={cn("size-4", section.iconColor)} />
                  </div>
                  <span className="text-sm">{section.label}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground font-medium">
                  {section.items.length}
                </span>
              </motion.button>

              {/* Section Items */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    variants={collapseVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="overflow-hidden"
                  >
                    <div className="py-1.5 pr-5 space-y-1">
                      {section.items.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item);

                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <Link
                              href={item.href}
                              className={cn(
                                "flex w-full items-center gap-2.5 overflow-hidden rounded-xl p-2 text-right outline-none ring-primary/50 transition-all h-9 text-sm",
                                "focus-visible:ring-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
                                isActive
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {Icon && <Icon className="size-4 shrink-0" />}
                              <span className="truncate flex-1">{item.label}</span>
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
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/50">
        {(!user?.role || ["USER", "BASIC"].includes(user.role.toUpperCase())) ? (
          <Link href="/app/upgrade" className="block">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 hover:from-warning/15 hover:to-warning/10 transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-warning flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-warning-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">ترقية حسابك</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    احصل على مزايا إضافية
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/app/help" className="block">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:from-primary/15 hover:to-primary/10 transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">تحتاج مساعدة؟</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    تواصل معنا عبر الدعم الفني
                  </p>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}

export function SidebarSkeleton({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex h-[calc(100svh-theme(spacing.4))] w-[260px] flex-col rounded-2xl border border-border/50 bg-card m-2 animate-pulse",
        className
      )}
      dir="rtl"
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-muted" />
          <div className="min-w-0 flex-1">
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
          <div className="size-4 rounded bg-muted" />
        </div>
      </div>
      <nav className="flex-1 space-y-2 px-3 py-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="h-10 rounded-xl bg-muted" />
        ))}
      </nav>
      <div className="p-3 border-t border-border/50">
        <div className="h-[72px] rounded-xl bg-muted" />
      </div>
    </aside>
  );
}
