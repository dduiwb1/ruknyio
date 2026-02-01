"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Settings,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsSidebar, settingsSections, type SettingsSection } from "@/components/(app)/settings/SettingsSidebar";

/** وصف قصير لكل قسم/تاب لعرضه في بطاقة المعلومات على الجوال */
const tabDescriptions: Record<string, string> = {
  "2fa": "أضف طبقة حماية إضافية لحسابك بالمصادقة الثنائية.",
  sessions: "اعرض الأجهزة المتصلة بحسابك وألغِ الجلسات غير المعروفة.",
  devices: "الأجهزة التي سجّلت الدخول منها وتمت الموافقة عليها.",
  logs: "تتبع آخر نشاطات الأمان وتسجيل الدخول.",
  "ip-protection": "استلم تنبيهاً عند تسجيل الدخول من موقع جديد.",
  overview: "نظرة عامة على جميع التكاملات والخدمات المتصلة.",
  social: "ربط حسابات التواصل الاجتماعي مع ركني.",
  analytics: "تتبع الأداء والإحصائيات عبر التكاملات.",
  notifications: "إدارة التنبيهات والإشعارات.",
  storage: "إدارة مساحة التخزين والملفات المرفوعة وسلة المهملات.",
  "store-general": "الإعدادات العامة للمتجر والمبيعات.",
  products: "إدارة المنتجات والفئات والجرد.",
  orders: "عرض الطلبات والمبيعات.",
  "forms-general": "الإعدادات العامة للنماذج والإرسال.",
  templates: "إنشاء وإدارة قوالب النماذج.",
  submissions: "عرض وإدارة البيانات المرسلة من النماذج.",
  "events-general": "إعدادات الفعاليات والتذاكر.",
  tickets: "إدارة التذاكر والوصول للفعاليات.",
  calendar: "ربط التقويم وعرض الفعاليات.",
  profile: "تعديل الاسم والصورة ومعلومات الحساب.",
};

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
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const infoSheetDragControls = useDragControls();

  const headerTitle = currentItemLabel || currentSection?.label || "الإعدادات";
  const HeaderIcon = currentSection?.icon ?? Settings;
  const headerIconBg = currentSection?.iconBg ?? "bg-primary/10";
  const headerIconColor = currentSection?.iconColor ?? "text-primary";
  const sheetDescription = (currentTab && tabDescriptions[currentTab]) || "إدارة حسابك، الأمان، التخزين والتكاملات من مكان واحد.";
  const sheetSectionItems = currentSection?.items ?? [];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 m-2 md:ms-0 overflow-hidden gap-3"
      dir="rtl"
    >
      <SettingsSidebar />
      <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden bg-card rounded-2xl border border-border/50 shadow-sm">
        {/* Mobile: هيدر يتغير حسب القسم + بطاقة معلومات للقسم الحالي */}
        <header className="sticky top-0 z-30 mx-3 mt-2 lg:mx-0 lg:mt-0 lg:relative lg:z-auto lg:hidden">
          <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border/60 px-4 py-3.5 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link
                href="/app"
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0"
                aria-label="العودة"
              >
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", headerIconBg)}>
                  <HeaderIcon className={cn("w-5 h-5", headerIconColor)} />
                </div>
                <h1 className="text-base font-semibold text-foreground truncate">{headerTitle}</h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoSheet(!showInfoSheet)}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-xl transition-colors flex-shrink-0",
                showInfoSheet ? "bg-primary/15 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              aria-label="معلومات هذا القسم"
              aria-expanded={showInfoSheet}
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* بطاقة المعلومات — تظهر وصف القسم الحالي وعناصره (للجوال فقط) */}
          <AnimatePresence>
            {showInfoSheet && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
                  onClick={() => setShowInfoSheet(false)}
                  aria-hidden
                />
                <motion.div
                  drag="y"
                  dragControls={infoSheetDragControls}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.25 }}
                  dragMomentum={false}
                  onDragEnd={(_, { offset, velocity }) => {
                    if (offset.y > 50 || velocity.y > 200) setShowInfoSheet(false);
                  }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", damping: 32, stiffness: 320 }}
                  className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl overflow-hidden bg-card shadow-xl border border-border/80 lg:hidden"
                >
                  <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border/50">
                    <button
                      type="button"
                      onClick={() => setShowInfoSheet(false)}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-muted border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors flex-shrink-0"
                      aria-label="إغلاق"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-medium">
                      {headerTitle}
                    </span>
                  </div>
                  <div className="mx-4 my-4 rounded-2xl overflow-hidden bg-muted/30 border border-border/50">
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-foreground leading-relaxed">
                        {sheetDescription}
                      </p>
                      {sheetSectionItems.length > 0 && (
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                          {sheetSectionItems.map((item: SettingsSection['items'][0]) => {
                            const Icon = item.icon;
                            return (
                              <li key={item.href} className="flex items-center gap-2.5">
                                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted", currentSection?.iconBg)}>
                                  <Icon className={cn("w-4 h-4", currentSection?.iconColor)} />
                                </div>
                                <span className="text-foreground/90">{item.label}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div
                    className="py-2.5 flex justify-center cursor-grab active:cursor-grabbing touch-none border-t border-border/50"
                    onPointerDown={(e) => infoSheetDragControls.start(e)}
                    aria-hidden
                  >
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </header>

        {/* Desktop: شريط علوي بسيط */}
        <header className="hidden lg:flex items-center justify-between gap-4 px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Link href="/app" className="p-2 rounded-xl hover:bg-muted/60 transition-colors">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", headerIconBg)}>
                <HeaderIcon className={cn("w-4.5 h-4.5", headerIconColor)} />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">{headerTitle}</h1>
                {currentSection && <p className="text-xs text-muted-foreground">{currentSection.label}</p>}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="relative flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
          {/* Bottom Blur Gradient Effect - matches dashboard */}
          <div className="sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
