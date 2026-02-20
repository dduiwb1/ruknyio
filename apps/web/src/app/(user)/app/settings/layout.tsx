"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsSidebar, settingsSections, type SettingsSection } from "@/components/(app)/settings/SettingsSidebar";
import { PhonePreview } from "@/components/(app)/shared/PhonePreview";
import { SettingsBreadcrumb } from "@/components/(app)/settings/SettingsBreadcrumb";

// ═══════════════════════════════════════════════════════════════════════════
// Main Layout
// ═══════════════════════════════════════════════════════════════════════════

/** استخراج القسم والعنصر الحاليين من pathname و tab */
function useCurrentSection(pathname: string, tab: string | null) {
  return useMemo(() => {
    const isProfile = pathname?.includes("/settings/profile");
    const currentTab = tab || (isProfile ? "profile" : null);
    for (const section of settingsSections) {
      for (const item of section.items) {
        if (item.href.includes("?tab=")) {
          const itemTab = item.href.split("?tab=")[1]?.split("&")[0] || "";
          if (itemTab === currentTab) {
            return { section, item: item.label, tab: currentTab };
          }
        }
        if (item.href.includes("/profile") && isProfile) {
          return { section, item: item.label, tab: "profile" };
        }
      }
    }
    return { section: null, item: null, tab: currentTab };
  }, [pathname, tab]);
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get?.("tab") ?? null;
  const { section: currentSection, item: currentItemLabel, tab: currentTab } = useCurrentSection(pathname ?? "", tab);

  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const headerTitle = currentItemLabel || currentSection?.label || "الإعدادات";
  const HeaderIcon = currentSection?.icon ?? Settings;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 gap-4 m-2 md:ms-0"
      dir="rtl"
    >
      <SettingsSidebar />
      <div className="flex-1 min-w-0 bg-card rounded-2xl border border-border/60 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 lg:hidden bg-card border-b border-border/60">
          {/* Top Row - Title & Actions */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* زر رجوع إلى لوحة التحكم */}
              {currentTab && (
                <Link href="/app/settings">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center"
                    aria-label="الرجوع إلى الإعدادات"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </motion.button>
                </Link>
              )}
              
              {/* Icon & Title */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <HeaderIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-semibold text-foreground truncate">{headerTitle}</h1>
                  {currentSection && (
                    <p className="text-xs text-muted-foreground truncate">{currentSection.label}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumb Row */}
          <div className="px-4 pb-3 pt-0.5">
            <SettingsBreadcrumb />
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block border-b border-border/60 bg-card">
          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
                <HeaderIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{headerTitle}</h1>
                {currentSection && (
                  <p className="text-sm text-muted-foreground mt-0.5">{currentSection.label}</p>
                )}
              </div>
            </div>
            
            <SettingsBreadcrumb />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>
      </div>

      {/* Phone Preview Sidebar - Desktop Only */}
      <div className="hidden xl:flex">
        <PhonePreview />
      </div>

      {/* Phone Preview Modal - Mobile */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 lg:hidden"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-card border border-border/60 rounded-3xl p-6 max-w-[360px] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreview(false)}
                className="absolute top-4 left-4 p-2.5 bg-muted hover:bg-muted/80 rounded-xl transition-colors z-10"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5 text-foreground" />
              </motion.button>
              <PhonePreview />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
