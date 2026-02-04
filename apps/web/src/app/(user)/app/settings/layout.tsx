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
  Smartphone,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsSidebar, settingsSections, type SettingsSection } from "@/components/(app)/settings/SettingsSidebar";
import { PhonePreview } from "@/components/(app)/shared/PhonePreview";
import { SettingsBreadcrumb } from "@/components/(app)/settings/SettingsBreadcrumb";

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
  const [showPreview, setShowPreview] = useState(false);
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
      className="relative flex h-[calc(100%-0.75rem)] flex-1 min-w-0 m-1.5 md:m-2 md:ms-0 gap-3 md:gap-4"
      dir="rtl"
    >
      <SettingsSidebar />
      <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* Mobile: Clean Simple Header */}
        <header className="sticky top-0 z-30 lg:hidden bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link
                href="/app"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="عودة"
              >
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <HeaderIcon className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 truncate">{headerTitle}</h1>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoSheet(!showInfoSheet)}
              className={cn(
                "p-2.5 rounded-xl transition-colors flex-shrink-0",
                showInfoSheet 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-gray-100 text-gray-500"
              )}
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 pb-3">
            <SettingsBreadcrumb />
          </div>
        </header>

        {/* Mobile Info Sheet */}
        <AnimatePresence>
          {showInfoSheet && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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
                className="absolute top-full left-0 right-0 mt-3 mx-2 z-50 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-xl lg:hidden"
              >
                <div className="flex items-center gap-4 px-5 pt-5 pb-4 border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowInfoSheet(false)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 flex-shrink-0"
                    aria-label="إغلاق"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-medium">
                    {headerTitle}
                  </div>
                </div>
                <div className="mx-5 my-5 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-gray-700 leading-relaxed line-height-6">
                      {sheetDescription}
                    </p>
                    {sheetSectionItems.length > 0 && (
                      <ul className="space-y-3 text-sm">
                        {sheetSectionItems.map((item: SettingsSection['items'][0]) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.href} className="flex items-center gap-3.5">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-gray-800 font-medium">{item.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
                <div
                  className="py-4 flex justify-center cursor-grab active:cursor-grabbing touch-none border-t border-gray-100 bg-gray-50"
                  onPointerDown={(e) => infoSheetDragControls.start(e)}
                  aria-hidden
                >
                  <div className="w-12 h-1.5 rounded-full bg-gray-300" />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop: Clean Professional Header */}
        <header className="hidden lg:block border-b border-gray-200 bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HeaderIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{headerTitle}</h1>
                    {currentSection && (
                      <p className="text-sm text-gray-600">{currentSection.label}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <SettingsBreadcrumb />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="relative flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
          {/* Bottom Blur Gradient Effect - matches dashboard */}
          <div className="sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Phone Preview Sidebar - Desktop (Separated) */}
      <div className="hidden lg:flex">
        <PhonePreview />
      </div>

      {/* Phone Preview Modal - Mobile مع Glass Effect */}
      {showPreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 lg:hidden"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white border border-gray-200 rounded-3xl p-6 max-w-[360px] w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 left-4 p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 z-10"
              aria-label="إغلاق المعاينة"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <PhonePreview />
          </motion.div>
        </div>
      )}
    </div>
  );
}
