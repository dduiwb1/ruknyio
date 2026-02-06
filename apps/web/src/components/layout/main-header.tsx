'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Menu, X, Store, Calendar, Sparkles, LayoutGrid, BarChart3, FileText, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    { name: 'الأسعار', href: '/pricing' },
    { name: 'المطورين', href: '/developers' },
    { name: 'التحديثات', href: '/updates' },
];

const productItems = [
    { name: 'المتاجر الإلكترونية', href: '/products/stores', icon: Store, description: 'أنشئ متجرك وابدأ البيع فوراً' },
    { name: 'إدارة الفعاليات', href: '/products/events', icon: Calendar, description: 'نظّم فعالياتك واستقبل الحجوزات' },
    { name: 'النماذج الذكية', href: '/products/forms', icon: FileText, description: 'أنشئ نماذج واستبيانات متقدمة' },
    { name: 'الملف الشخصي', href: '/products/profile', icon: User, description: 'صفحة شخصية احترافية لعملك' },
    { name: 'التحليلات', href: '/products/analytics', icon: BarChart3, description: 'راقب أداء أعمالك بالتفصيل بشكل متقدم' },
    { name: 'الذكاء الاصطناعي', href: '/products/ai', icon: Bot, description: 'أدوات ذكية لتطوير أعمالك' },
];

const RuknyLogo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-courgette), cursive' }}>Rukny</span>
        </div>
    );
};

export function MainHeader() {
    const [menuState, setMenuState] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [productMenuOpen, setProductMenuOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setProductMenuOpen(false);
            }
        };
        if (productMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [productMenuOpen]);

    return (
        <header dir="rtl" className="relative">
            <nav className="fixed z-50 w-full px-3 sm:px-4 pt-3 sm:pt-4">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ 
                        y: 0, 
                        opacity: 1,
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        'mx-auto transition-all duration-500 ease-out border',
                        isScrolled 
                            ? 'max-w-4xl bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-border/30 rounded-2xl' 
                            : 'max-w-7xl bg-white/60 backdrop-blur-md border-border/20 rounded-4xl'
                    )}
                >
                    <div className={cn(
                        'mx-auto transition-all duration-500 ease-out',
                        isScrolled ? 'px-3 sm:px-4' : 'px-4 sm:px-6'
                    )}>
                        <div className={cn(
                            'flex items-center justify-between transition-all duration-500',
                            isScrolled ? 'h-12 sm:h-12' : 'h-14 sm:h-16'
                        )}>
                            {/* Logo */}
                            <Link
                                href="/"
                                aria-label="الصفحة الرئيسية"
                                className="flex items-center gap-2 shrink-0">
                                <RuknyLogo />
                            </Link>

                            {/* Desktop Navigation - Center */}
                            <div className="hidden lg:flex items-center gap-1">
                                {/* Products Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setProductMenuOpen(!productMenuOpen)}
                                        onMouseEnter={() => setProductMenuOpen(true)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-200',
                                            'text-foreground/80 hover:text-foreground',
                                            productMenuOpen && 'text-foreground'
                                        )}
                                    >
                                        <span>المنتجات</span>
                                        <ChevronDown className={cn(
                                            'size-4 transition-transform duration-300',
                                            productMenuOpen && 'rotate-180'
                                        )} />
                                    </button>
                                </div>

                                {/* Other Menu Items */}
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Desktop CTA Buttons */}
                            <div className="hidden lg:flex items-center gap-4 shrink-0">
                                <Button
                                    asChild
                                    size="sm"
                                    className="rounded-lg px-5 h-9"
                                >
                                    <Link href="/app">
                                        <LayoutGrid className="size-4 ml-2" />
                                        لوحة التحكم
                                    </Link>
                                </Button>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'إغلاق القائمة' : 'فتح القائمة'}
                                className="flex lg:hidden items-center justify-center size-9 sm:size-10 rounded-lg hover:bg-muted/80 active:bg-muted transition-colors"
                            >
                                <AnimatePresence mode="wait">
                                    {menuState ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <X className="size-5" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <Menu className="size-5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                    {productMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                                "fixed inset-x-0 z-40 hidden lg:block px-4",
                                isScrolled ? "top-[4.5rem]" : "top-[5.25rem]"
                            )}
                            onMouseEnter={() => setProductMenuOpen(true)}
                            onMouseLeave={() => setProductMenuOpen(false)}
                        >
                            <div className={cn(
                                "mx-auto bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/5 transition-all duration-300",
                                isScrolled ? "max-w-4xl rounded-2xl" : "max-w-7xl rounded-xl"
                            )}>
                                <div className="px-6 py-8">
                                    <div className="grid grid-cols-12 gap-8">
                                        {/* Products Grid */}
                                        <div className="col-span-9">
                                            <div className="grid grid-cols-3 gap-3">
                                                {productItems.map((item, index) => (
                                                    <motion.div
                                                        key={item.name}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.03 }}
                                                    >
                                                        <Link
                                                            href={item.href}
                                                            className="flex items-start gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                                                            onClick={() => setProductMenuOpen(false)}
                                                        >
                                                            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                                                                <item.icon className="size-5 text-primary" />
                                                            </div>
                                                            <div className="text-right min-w-0">
                                                                <span className="block text-sm font-semibold text-foreground mb-0.5">{item.name}</span>
                                                                <span className="block text-xs text-muted-foreground leading-relaxed">{item.description}</span>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* CTA Card */}
                                        <div className="col-span-3">
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.15 }}
                                                className="bg-muted/50 rounded-2xl p-6 h-full flex flex-col justify-between"
                                            >
                                                <div>
                                                    <h3 className="text-xl font-bold mb-2">مشروع خاص<br />أو مؤسسة؟</h3>
                                                    <p className="text-muted-foreground text-sm">
                                                        تواصل معنا للحصول على حلول مخصصة لاحتياجات عملك
                                                    </p>
                                                </div>
                                                <Link
                                                    href="/contact"
                                                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors mt-4 group"
                                                    onClick={() => setProductMenuOpen(false)}
                                                >
                                                    <ArrowRight className="size-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                                    <span>احجز استشارة الآن</span>
                                                </Link>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Menu - Top Sheet */}
                <AnimatePresence>
                    {menuState && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                                onClick={() => setMenuState(false)}
                            />
                            
                            {/* Top Sheet */}
                            <motion.div
                                initial={{ y: '-100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '-100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                                drag="y"
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={{ top: 0, bottom: 0.4 }}
                                dragMomentum={true}
                                dragTransition={{ bounceStiffness: 200, bounceDamping: 30 }}
                                onDragEnd={(_, info) => {
                                    if (info.offset.y > 100 || info.velocity.y > 200) {
                                        setMenuState(false);
                                    }
                                }}
                                whileDrag={{ cursor: 'grabbing' }}
                                className="fixed top-0 left-0 right-0 bg-white rounded-b-3xl shadow-2xl z-50 lg:hidden max-h-[90vh] overflow-hidden touch-pan-y"
                                style={{ touchAction: 'pan-y' }}
                            >
                                <div className="overflow-y-auto max-h-[90vh] px-5 pt-5 pb-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <RuknyLogo />
                                        <button
                                            onClick={() => setMenuState(false)}
                                            className="size-9 rounded-full bg-muted hover:bg-muted/80 active:scale-95 flex items-center justify-center transition-all"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>

                                    {/* Products Section */}
                                    <div className="mb-5">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">المنتجات</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {productItems.map((item, index) => (
                                                <motion.div
                                                    key={item.name}
                                                    initial={{ opacity: 0, y: -20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 + 0.1 }}
                                                >
                                                    <Link
                                                        href={item.href}
                                                        className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted active:scale-[0.98] transition-all border border-border/50"
                                                        onClick={() => setMenuState(false)}
                                                    >
                                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                            <item.icon className="size-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 text-right">
                                                            <span className="block text-sm font-semibold leading-tight">{item.name}</span>
                                                            <span className="block text-[11px] text-muted-foreground mt-0.5 leading-tight line-clamp-1">{item.description}</span>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quick Links */}
                                    <div className="flex gap-2 mb-5">
                                        {menuItems.map((item, index) => (
                                            <motion.div
                                                key={item.name}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 + 0.4 }}
                                                className="flex-1"
                                            >
                                                <Link
                                                    href={item.href}
                                                    className="flex items-center justify-center p-3 rounded-xl bg-muted/50 hover:bg-muted active:scale-[0.98] transition-all"
                                                    onClick={() => setMenuState(false)}
                                                >
                                                    <span className="text-sm font-medium">{item.name}</span>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Consultation CTA Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 mb-5 border border-primary/10"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="size-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                                                <Sparkles className="size-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-base mb-1">مشروع خاص أو مؤسسة؟</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                                    تواصل معنا للحصول على حلول مخصصة لاحتياجات عملك
                                                </p>
                                                <Link
                                                    href="/contact"
                                                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                                    onClick={() => setMenuState(false)}
                                                >
                                                    <ArrowRight className="size-4 rotate-180" />
                                                    <span>احجز استشارة مجانية</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* CTA Buttons */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.55 }}
                                        className="grid grid-cols-2 gap-3 mb-4"
                                    >
                                        <Button asChild variant="outline" className="w-full rounded-xl h-12 text-sm">
                                            <Link href="/auth/login" onClick={() => setMenuState(false)}>
                                                تسجيل الدخول
                                            </Link>
                                        </Button>
                                        <Button asChild className="w-full rounded-xl h-12 text-sm">
                                            <Link href="/app" onClick={() => setMenuState(false)}>
                                                <LayoutGrid className="size-4 ml-2" />
                                                لوحة التحكم
                                            </Link>
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
}

export default MainHeader;
