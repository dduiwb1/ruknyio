"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Link2,
  Store,
  FileText,
  Calendar,
  User,
  ChevronLeft,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  History,
  Ban,
  Zap,
  Share2,
  BarChart3,
  Bell,
  Cloud,
  Package,
  ShoppingCart,
  FileEdit,
  Layers,
  Inbox,
  Ticket,
  CalendarDays,
  ArrowRight,
  MonitorSmartphone,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsSidebar as AccountSidebar, SettingsSidebarSkeleton as AccountSidebarSkeleton } from "@/components/(app)/settings/SettingsSidebar";

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface SettingsSection {
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

// ═══════════════════════════════════════════════════════════════════════════
// Settings Sections Data
// ═══════════════════════════════════════════════════════════════════════════

const settingsSections: SettingsSection[] = [
  {
    id: "profile",
    label: "الملف الشخصي",
    icon: User,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    items: [
      { href: "/app/settings/profile", label: "المعلومات الشخصية", icon: User },
    ],
  },
  {
    id: "security",
    label: "الأمان والخصوصية",
    icon: Shield,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    items: [
      { href: "/app/settings?tab=2fa", label: "المصادقة الثنائية", icon: ShieldCheck, badge: "موصى به" },
      { href: "/app/settings?tab=sessions", label: "الجلسات النشطة", icon: MonitorSmartphone },
      { href: "/app/settings?tab=devices", label: "الأجهزة الموثوقة", icon: Smartphone },
      { href: "/app/settings?tab=logs", label: "سجل الأمان", icon: History },
    ],
  },
  {
    id: "integrations",
    label: "التكاملات والخدمات",
    icon: Link2,
    iconBg: "bg-info/10",
    iconColor: "text-info",
    items: [
      { href: "/app/settings?tab=notifications", label: "الإشعارات", icon: Bell },
      { href: "/app/settings?tab=storage", label: "التخزين السحابي", icon: Cloud },
    ],
  },
  {
    id: "store",
    label: "إدارة المتجر",
    icon: Store,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    items: [
      { href: "/app/settings?tab=store-general", label: "إعدادات المتجر", icon: Store },
      { href: "/app/settings?tab=products", label: "المنتجات", icon: Package },
      { href: "/app/settings?tab=orders", label: "الطلبات", icon: ShoppingCart },
    ],
  },
  {
    id: "forms",
    label: "إدارة النماذج",
    icon: FileText,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    items: [
      { href: "/app/settings?tab=forms-general", label: "إعدادات النماذج", icon: FileEdit },
      { href: "/app/settings?tab=templates", label: "قوالب النماذج", icon: Layers },
      { href: "/app/settings?tab=submissions", label: "الإرساليات", icon: Inbox },
    ],
  },
  {
    id: "events",
    label: "إدارة الأحداث",
    icon: Calendar,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    items: [
      { href: "/app/settings?tab=events-general", label: "إعدادات الأحداث", icon: Calendar },
      { href: "/app/settings?tab=tickets", label: "التذاكر", icon: Ticket },
      { href: "/app/settings?tab=calendar", label: "التقويم", icon: CalendarDays },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Settings Sidebar Component
// ═══════════════════════════════════════════════════════════════════════════

function SettingsSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Determine which section should be open based on current path or query
  const getActiveSection = () => {
    // Check if we're on a specific settings page
    if (pathname.includes("/settings/profile")) return "profile";
    
    // Default to security for main settings page
    return "security";
  };

  const [openSection, setOpenSection] = useState<string | null>(() => {
    return getActiveSection();
  });

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  // Check if item is active
  const isItemActive = (href: string) => {
    if (href.includes("?tab=")) {
      const tab = href.split("?tab=")[1];
      return pathname === "/app/settings" && typeof window !== "undefined" && 
        new URLSearchParams(window.location.search).get("tab") === tab;
    }
    return pathname === href;
  };

  // Filter sections based on search
  const filteredSections = settingsSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.includes(searchQuery) ||
          section.label.includes(searchQuery)
      ),
    }))
    .filter((section) => section.items.length > 0 || section.label.includes(searchQuery));

  return (
    <aside className="flex flex-col mr-2 w-[240px] h-[calc(100svh-theme(spacing.4))] rounded-xl border border-border/40 bg-card">
      {/* Header */}
      <div className="p-3 ">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/app"
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">الإعدادات</span>
        </div>

        {/* Search */}
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredSections.map((section) => {
          const isOpen = openSection === section.id;
          const SectionIcon = section.icon;

          return (
            <div key={section.id}>
              {/* Section Header */}
              <motion.button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg p-2 text-right transition-colors",
                  isOpen
                    ? "bg-muted/50 text-foreground"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={{ rotate: isOpen ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft className="size-3 text-muted-foreground" />
                </motion.div>
                <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", section.iconBg)}>
                  <SectionIcon className={cn("size-3.5", section.iconColor)} />
                </div>
                <span className="text-xs font-medium flex-1">{section.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground">
                  {section.items.length}
                </span>
              </motion.button>

              {/* Section Items */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="py-1 pr-6 space-y-0.5">
                      {section.items.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item.href);

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
                                "flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              )}
                            >
                              <Icon className="size-3.5 shrink-0" />
                              <span className="text-xs flex-1">{item.label}</span>
                              {item.badge && (
                                <span className={cn(
                                  "px-1.5 py-0.5 text-[9px] font-medium rounded-full",
                                  isActive 
                                    ? "bg-primary-foreground/20 text-primary-foreground" 
                                    : "bg-primary/10 text-primary"
                                )}>
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

      {/* Footer */}
      <div className="p-2 border-t border-border/30">
        <Link href="/app/help" className="block">
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
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Layout
// ═══════════════════════════════════════════════════════════════════════════

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="flex h-[calc(100svh-theme(spacing.4))] flex-1 min-w-0 bg-background gap-2 overflow-hidden m-2 md:ms-0"
      dir="rtl"
    >
      {/* Settings Sidebar - Desktop only */}
      <div className="hidden lg:block">
        <SettingsSidebar />
      </div>

      {/* Main Content Container */}
      <div className="relative flex-1 flex flex-col min-w-0 rounded-xl border border-border/40 bg-card overflow-hidden">
        
        {/* Mobile Header */}
        <header className="flex items-center gap-3 p-3 border-b border-border/30 lg:hidden">
          <Link
            href="/app"
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-primary" />
            </div>
            <h1 className="text-sm font-medium">الإعدادات</h1>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="relative flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>
      </div>
    </div>
  );
}
