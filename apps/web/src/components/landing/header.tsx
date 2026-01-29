"use client";

import Link from "next/link";
import { Button } from '@/components/ui/button';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Menu, ChevronDown, User, FileText, ShoppingBag, Calendar, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks";

const products = [
  {
    name: "الملف الشخصي",
    description: "اصنع ملفك الشخصي التفاعلي",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950",
    href: "/profile"
  },
  {
    name: "الفورما", 
    description: "نماذج ذكية لجمع البيانات",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-950",
    href: "/forms"
  },
  {
    name: "المتجر",
    description: "أطلق متجرك الإلكتروني",
    icon: ShoppingBag,
    color: "text-purple-600", 
    bgColor: "bg-purple-100 dark:bg-purple-950",
    href: "/store"
  },
  {
    name: "الأحداث",
    description: "نظم فعالياتك باحترافية",
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    href: "/events"
  }
];

export function Header() {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  // تأثير الظل عند التمرير
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-white/50 dark:border-gray-700/50 shadow-xl shadow-black/5' 
            : 'bg-transparent'
        }`}
        role="banner"
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
            Rukny
          </span>
          <span className="text-xl font-bold text-primary">.io</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Products Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200">
              المنتجات
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            <div 
              className={`absolute top-full right-0 pt-2 transition-all duration-200 ${
                isProductsOpen 
                  ? 'opacity-100 translate-y-0 pointer-events-auto' 
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-xl shadow-black/10 p-2">
                {products.map((product, index) => {
                  const Icon = product.icon;
                  return (
                    <Link
                      key={index}
                      href={product.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-all duration-200 group"
                    >
                      <div className={`p-2.5 rounded-xl ${product.bgColor} group-hover:scale-105 transition-transform duration-200`}>
                        <Icon className={`h-4 w-4 ${product.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors duration-200">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {product.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <Link 
            href="#developers" 
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200"
          >
            المطورين
          </Link>
          <Link 
            href="#pricing" 
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200"
          >
            الأسعار
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          <AnimatedThemeToggler />
          {isAuthenticated ? (
            <Link href="/">
              <Button className="rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200">
                لوحة التحكم
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" className="rounded-xl text-sm font-medium hover:bg-muted/50">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/login">
                <Button className="rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  ابدأ مجاناً
                </Button>
              </Link>
            </>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-xl hover:bg-muted/50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="relative w-5 h-5">
              <Menu className={`h-5 w-5 absolute transition-all duration-200 ${isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
              <X className={`h-5 w-5 absolute transition-all duration-200 ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
            </div>
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ top: '64px' }}
      >
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div 
          className={`absolute top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-white/50 dark:border-gray-700/50 shadow-xl shadow-black/10 transition-all duration-300 ${
            isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <div className="container px-4 py-6 space-y-6">
            {/* Mobile Products */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">المنتجات</h3>
              <div className="grid grid-cols-2 gap-2">
                {products.map((product, index) => {
                  const Icon = product.icon;
                  return (
                    <Link
                      key={index}
                      href={product.href}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-muted/50 transition-all duration-200 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={`p-3 rounded-xl ${product.bgColor}`}>
                        <Icon className={`h-5 w-5 ${product.color}`} />
                      </div>
                      <span className="text-sm font-medium">{product.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex gap-2">
              <Link 
                href="#developers" 
                className="flex-1 py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                المطورين
              </Link>
              <Link 
                href="#pricing" 
                className="flex-1 py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                الأسعار
              </Link>
            </div>
            
            {/* Mobile CTA */}
            {!isAuthenticated && (
              <div className="pt-4 border-t border-border/50">
                <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl font-medium mb-2">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl font-medium shadow-sm">
                    ابدأ مجاناً
                  </Button>
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="pt-4 border-t border-border/50">
                <Link href="/" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl font-medium shadow-sm">
                    لوحة التحكم
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      </header>
    </>
  );
}
