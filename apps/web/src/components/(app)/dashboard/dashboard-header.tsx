"use client";

/**
 * 📊 Dashboard Header Component
 * رأس لوحة التحكم - تصميم بسيط ومتناسق
 */

import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  Package,
  FileText,
  Tag,
  Megaphone,
  Plus,
  Check,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  storeName?: string;
  hasStore?: boolean;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  onRefresh?: () => void;
}

const dateOptions = [
  { value: "7", label: "آخر 7 أيام" },
  { value: "30", label: "آخر 30 يوم" },
  { value: "90", label: "آخر 90 يوم" },
  { value: "365", label: "آخر سنة" },
];

const quickAddOptions = [
  { icon: Package, label: "منتج جديد", href: "/app/store/products/new", color: "bg-emerald-500" },
  { icon: FileText, label: "نموذج جديد", href: "/app/forms/create?new=true", color: "bg-sky-500" },
  { icon: Tag, label: "كوبون جديد", href: "/app/coupons/new", color: "bg-amber-500" },
  { icon: Megaphone, label: "فعالية جديدة", href: "/app/events/create", color: "bg-violet-500" },
];

export function DashboardHeader({
  dateRange,
  onDateRangeChange,
}: DashboardHeaderProps) {
  const [showDate, setShowDate] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (dateRef.current && !dateRef.current.contains(t)) setShowDate(false);
      if (quickAddRef.current && !quickAddRef.current.contains(t)) setShowQuickAdd(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = dateOptions.find((o) => o.value === dateRange)?.label ?? "آخر 7 أيام";

  return (
    <header className="flex items-center justify-between gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LayoutDashboard className="h-4 w-4" />
          <span>لوحة التحكم</span>
        </div>
        <ChevronLeft className="h-4 w-4 text-muted-foreground/50 rotate-180" aria-hidden />
        <span className="font-medium text-foreground">الرئيسية</span>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Date Filter */}
        <div className="relative" ref={dateRef}>
          <button
            type="button"
            onClick={() => { setShowDate((v) => !v); setShowQuickAdd(false); }}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors",
              "border-border/50 bg-background hover:bg-muted/50",
              showDate && "border-primary/50"
            )}
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="hidden sm:inline">{selectedDate}</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showDate && "rotate-180")} />
          </button>

          {showDate && (
            <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-border/50 bg-card p-1 shadow-lg">
              {dateOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onDateRangeChange(opt.value); setShowDate(false); }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                    dateRange === opt.value ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  )}
                >
                  {opt.label}
                  {dateRange === opt.value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add */}
        <div className="relative" ref={quickAddRef}>
          <button
            type="button"
            onClick={() => { setShowQuickAdd((v) => !v); setShowDate(false); }}
            className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">إضافة</span>
          </button>

          {showQuickAdd && (
            <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-border/50 bg-card p-1 shadow-lg">
              {quickAddOptions.map((opt) => (
                <Link
                  key={opt.href}
                  href={opt.href}
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                >
                  <div className={cn("p-1.5 rounded-md", opt.color)}>
                    <opt.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span>{opt.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-14 rounded bg-muted animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-9 sm:w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-9 sm:w-20 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  );
}