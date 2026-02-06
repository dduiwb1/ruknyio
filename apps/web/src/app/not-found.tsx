"use client";

import Link from "next/link";
import { Construction, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RuknyLogo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className="text-2xl font-bold"
        style={{ fontFamily: "var(--font-courgette), cursive" }}
      >
        Rukny
      </span>
    </div>
  );
};

export default function NotFound() {
  return (
    <div dir="rtl" className="min-h-screen bg-background flex flex-col">
      {/* Simple Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <RuknyLogo />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Construction className="size-12 text-primary" />
            </div>
          </div>

          {/* 404 Text */}
          <h1 className="text-8xl font-bold text-primary/20 mb-4">404</h1>

          {/* Message */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            جاري العمل على إكمال المنصة
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            هذه الصفحة قيد التطوير وستكون متاحة قريباً
          </p>

          {/* Progress Animation */}
          <div className="mb-8">
            <div className="h-2 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
              <div className="h-full bg-primary rounded-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">قريباً...</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="size-4 ml-2" />
                العودة للرئيسية
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">
                تواصل معنا
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 border-t">
        <div className="container px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ركني. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
