"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsSidebar, settingsSections, type SettingsSection } from "@/components/(app)/settings/SettingsSidebar";
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

  const headerTitle = currentItemLabel || currentSection?.label || "الإعدادات";
  const HeaderIcon = currentSection?.icon ?? Settings;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 gap-3 my-2 mx-2 md:ms-0"
      dir="rtl"
    >
      <SettingsSidebar />
      <div className="flex-1 min-w-0 bg-card rounded-2xl border border-border/40 overflow-hidden flex flex-col">
        {/* Mobile Header - only show when a tab/section is selected */}
        <header className={cn(
          "sticky top-0 z-40 lg:hidden bg-card/95 backdrop-blur-md border-b border-border/40",
          !currentTab && "hidden"
        )}>
          <div className="flex items-center gap-2.5 px-4 py-3">
            {/* زر رجوع */}
            {currentTab && (
              <Link href="/app/settings">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors flex items-center justify-center"
                  aria-label="الرجوع إلى الإعدادات"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </motion.button>
              </Link>
            )}
            
            {/* Icon & Title */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                "bg-primary/10"
              )}>
                <HeaderIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-[13px] font-semibold text-foreground truncate">{headerTitle}</h1>
                {currentSection && currentItemLabel && (
                  <p className="text-[11px] text-muted-foreground truncate">{currentSection.label}</p>
                )}
              </div>
            </div>
          </div>

          {/* Breadcrumb Row */}
          <div className="px-4 pb-2">
            <SettingsBreadcrumb />
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block border-b border-border/40 bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                <HeaderIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">{headerTitle}</h1>
                {currentSection && currentItemLabel && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{currentSection.label}</p>
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
    </div>
  );
}
