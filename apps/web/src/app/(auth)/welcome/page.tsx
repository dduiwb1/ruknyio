'use client';

/**
 * 🎉 Welcome Page - Shown after successful registration/profile completion
 * Responsive design with platform integrations & SVG brand logos
 */

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import {
  Store,
  Calendar,
  FileText,
  Link2,
  BarChart3,
  Bot,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ─────────────── Platform SVG Icons ─────────────── */

const MetaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 36 36" fill="none">
    <path d="M6.5 18c0-3.2 1.3-6.5 3.2-8.9C11.5 6.7 13.7 5.5 16 5.5c1.8 0 3.2 1 4.7 3.2l1 1.5 1-1.5c1.5-2.2 2.9-3.2 4.7-3.2 2.3 0 4.5 1.2 6.3 3.6 1.9 2.4 3.2 5.7 3.2 8.9 0 5.5-3.3 8.5-7 8.5-1.9 0-3.5-.8-5.1-2.7l-2.1-2.8-2.1 2.8c-1.6 1.9-3.2 2.7-5.1 2.7-3.7 0-7-3-7-8.5z" fill="#0081FB"/>
    <path d="M16 5.5c-2.3 0-4.5 1.2-6.3 3.6C7.8 11.5 6.5 14.8 6.5 18c0 5.5 3.3 8.5 7 8.5 1.9 0 3.5-.8 5.1-2.7l2.1-2.8 3.7-4.9c-1-1.7-2.2-3.2-3.7-4.6C18.9 9.7 17.4 8.5 16 7v-1l.2-.3c-.1-.1-.1-.2-.2-.2z" fill="url(#meta_a)"/>
    <path d="M20.7 6.7c-1.5-2.2-2.9-3.2-4.7-3.2V7c1.4 1.5 2.9 2.7 4.6 4.5 1.5 1.4 2.7 2.9 3.7 4.6l1.4-1.8C24.1 11.2 22.2 9 20.7 6.7z" fill="url(#meta_b)"/>
    <defs>
      <linearGradient id="meta_a" x1="10" y1="26" x2="22" y2="8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0064E1"/><stop offset="0.4" stopColor="#0064E1"/><stop offset="0.8" stopColor="#0073EE"/><stop offset="1" stopColor="#0082FB"/>
      </linearGradient>
      <linearGradient id="meta_b" x1="16" y1="7" x2="25" y2="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0082FB"/><stop offset="1" stopColor="#0064E1"/>
      </linearGradient>
    </defs>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366"/>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.108-1.138l-.29-.174-3.03.795.81-2.957-.19-.301A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" fill="#25D366"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <defs>
      <radialGradient id="ig_a" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig_a)"/>
    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.5" fill="none"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#2AABEE"/>
    <path d="M6.5 11.5l8.5-4c.4-.2.8.2.6.6l-2.5 7.5c-.2.5-.8.5-1.1.2l-2-1.5-1.5 1.3c-.2.2-.5 0-.5-.3v-2l5.5-5c.1-.2-.1-.3-.2-.2l-6.8 4.3-2-.7c-.4-.2-.4-.6 0-.8l1.5-.4z" fill="white"/>
  </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.02 10.02 0 001 12c0 1.61.39 3.14 1.08 4.49l3.76-2.4z" fill="#FBBC05"/>
    <path d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.16 6.16-4.16z" fill="#EA4335"/>
  </svg>
);

const GoogleSheetsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#0F9D58"/>
    <path d="M14 2v6h6" fill="#87CEAC"/>
    <path d="M8 13h8v1H8v-1zm0 2h8v1H8v-1zm0 2h5v1H8v-1zm0-6h8v1H8v-1z" fill="#F1F1F1"/>
  </svg>
);

const GoogleCalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M18 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2z" fill="#4285F4"/>
    <path d="M6 4h12a2 2 0 012 2v1H4V6a2 2 0 012-2z" fill="#1A73E8"/>
    <rect x="7" y="9" width="3" height="2.5" rx="0.5" fill="white"/>
    <rect x="10.5" y="9" width="3" height="2.5" rx="0.5" fill="white"/>
    <rect x="14" y="9" width="3" height="2.5" rx="0.5" fill="white"/>
    <rect x="7" y="12" width="3" height="2.5" rx="0.5" fill="white"/>
    <rect x="10.5" y="12" width="3" height="2.5" rx="0.5" fill="white"/>
    <rect x="14" y="12" width="3" height="2.5" rx="0.5" fill="white"/>
    <rect x="7" y="15" width="3" height="2.5" rx="0.5" fill="white"/>
    <rect x="10.5" y="15" width="3" height="2.5" rx="0.5" fill="white"/>
    <path d="M16 2v4M8 2v4" stroke="#1A73E8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const GoogleDriveIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M8 21l-4-7h8l4 7H8z" fill="#4285F4"/>
    <path d="M16.5 3L20.5 14H12.5L8.5 3H16.5z" fill="#0F9D58"/>
    <path d="M8.5 3L12.5 14H4.5L8.5 3z" fill="#FBBC05" opacity="0.9"/>
    <path d="M16.5 3L20.5 14H12.5" fill="#0F9D58"/>
    <path d="M4 14h16l-4 7H8l-4-7z" fill="#4285F4" opacity="0.8"/>
  </svg>
);

/* ─────────────── Platform Data ─────────────── */

const features = [
  {
    title: 'المتاجر الإلكترونية',
    description: 'أنشئ متجرك الإلكتروني وابدأ البيع فوراً مع نظام متكامل لإدارة المنتجات والطلبات',
    icon: Store,
    tag: 'متاح الآن',
  },
  {
    title: 'إدارة الفعاليات',
    description: 'نظم فعالياتك وأحداثك بسهولة مع تتبع الحضور والتذاكر',
    icon: Calendar,
    tag: 'متاح الآن',
  },
  {
    title: 'النماذج الذكية',
    description: 'صمم نماذج تفاعلية لجمع البيانات وإدارة الاستبيانات',
    icon: FileText,
    tag: 'متاح الآن',
  },
  {
    title: 'روابط مختصرة',
    description: 'اختصر روابطك وتتبع زوارك بإحصائيات تفصيلية',
    icon: Link2,
    tag: 'متاح الآن',
  },
  {
    title: 'تحليلات متقدمة',
    description: 'احصائيات شاملة لفهم أداء منتجاتك وفعالياتك',
    icon: BarChart3,
    tag: 'متاح الآن',
  },
  {
    title: 'تكامل الذكاء الاصطناعي',
    description: 'استخدم AI لإنشاء المحتوى وتحليل البيانات تلقائياً',
    icon: Bot,
    tag: 'متاح الآن',
  },
];

const integrations = [
  {
    name: 'Meta Business',
    description: 'إدارة حملاتك الإعلانية وصفحاتك',
    icon: MetaIcon,
    color: '#0081FB',
  },
  {
    name: 'WhatsApp Business',
    description: 'إشعارات الطلبات والتواصل مع العملاء',
    icon: WhatsAppIcon,
    color: '#25D366',
  },
  {
    name: 'Instagram',
    description: 'ربط متجرك وعرض منتجاتك',
    icon: InstagramIcon,
    color: '#E1306C',
  },
  {
    name: 'Telegram',
    description: 'بوت الإشعارات وإدارة الطلبات',
    icon: TelegramIcon,
    color: '#2AABEE',
  },
  {
    name: 'Google Analytics',
    description: 'تتبع الزوار وتحليل الأداء',
    icon: GoogleIcon,
    color: '#4285F4',
  },
  {
    name: 'Google Sheets',
    description: 'تصدير البيانات تلقائياً',
    icon: GoogleSheetsIcon,
    color: '#0F9D58',
  },
  {
    name: 'Google Calendar',
    description: 'مزامنة الفعاليات والمواعيد',
    icon: GoogleCalendarIcon,
    color: '#4285F4',
  },
  {
    name: 'Google Drive',
    description: 'نسخ احتياطي وتخزين الملفات',
    icon: GoogleDriveIcon,
    color: '#FBBC05',
  },
];

/* ─────────────── Animation Variants ─────────────── */

const ease = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

/* ─────────────── Main Component ─────────────── */

export default function WelcomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax (desktop only)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springCfg = { damping: 30, stiffness: 180 };
  const sx = useSpring(mouseX, springCfg);
  const sy = useSpring(mouseY, springCfg);
  const numX = useTransform(sx, [-300, 300], [15, -15]);
  const numY = useTransform(sy, [-300, 300], [-8, 8]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - (rect.left + rect.width / 2));
      mouseY.set(e.clientY - (rect.top + rect.height / 2));
    }
  }, [mouseX, mouseY]);

  const goNext = useCallback(() => setActiveIndex((p) => (p + 1) % features.length), []);
  const goPrev = useCallback(() => setActiveIndex((p) => (p - 1 + features.length) % features.length), []);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    const t = setInterval(goNext, 5000);
    return () => clearInterval(t);
  }, [goNext]);

  if (!isAuthenticated || !user) return null;

  const current = features[activeIndex];
  const CurrentIcon = current.icon;
  const progress = ((activeIndex + 1) / features.length) * 100;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative mx-auto max-w-6xl px-5 sm:px-8 py-10 md:py-0 md:min-h-screen md:flex md:flex-col md:justify-center"
      >
        {/* ── Oversized parallax number (desktop) ── */}
        <motion.div
          className="pointer-events-none select-none absolute -right-6 top-1/2 -translate-y-1/2 hidden md:block text-[22rem] lg:text-[28rem] font-extrabold leading-none tracking-tighter text-foreground/[0.03]"
          style={{ x: numX, y: numY }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(12px)' }}
              transition={{ duration: 0.6, ease }}
              className="block"
            >
              {String(activeIndex + 1).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* ── Main grid ── */}
        <div className="relative flex flex-col md:flex-row">
          {/* ─ Sidebar (desktop) ─ */}
          <div className="hidden md:flex flex-col items-center justify-center pl-14 border-l border-border/60 shrink-0">
            <motion.span
              className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Rukny Platform
            </motion.span>
            <div className="relative h-28 w-px bg-border/60 mt-6">
              <motion.div
                className="absolute top-0 left-0 w-full bg-primary origin-top rounded-full"
                animate={{ height: `${progress}%` }}
                transition={{ duration: 0.5, ease }}
              />
            </div>
            <span className="mt-4 text-[10px] font-mono text-muted-foreground tabular-nums">
              {String(activeIndex + 1).padStart(2, '0')}/{String(features.length).padStart(2, '0')}
            </span>
          </div>

          {/* ─ Content column ─ */}
          <div className="flex-1 md:pr-14 space-y-10 md:space-y-0">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ease }}
              className="mb-4 md:mb-8 md:pt-4"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                أهلاً {user.name || 'بك'} 👋
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                منصتك الشاملة لإدارة أعمالك الرقمية
              </p>
            </motion.div>

            {/* ── Feature Slider Section ── */}
            <div className="relative rounded-2xl border border-border/60 bg-card/50 p-5 sm:p-8">
              {/* Mobile progress bar */}
              <div className="md:hidden mb-5">
                <div className="h-1 rounded-full bg-border/40 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease }}
                  />
                </div>
              </div>

              {/* Tag badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`tag-${activeIndex}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3 }}
                  className="mb-5"
                >
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
                    <CurrentIcon className="w-3 h-3" />
                    {current.tag}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Title — word-by-word */}
              <div className="min-h-[48px] sm:min-h-[64px] mb-3">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={`title-${activeIndex}`}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {current.title.split(' ').map((word, i) => (
                      <motion.span
                        key={i}
                        className="inline-block ml-[0.25em]"
                        variants={{
                          hidden: { opacity: 0, y: 16, rotateX: 70 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            rotateX: 0,
                            transition: { duration: 0.45, delay: i * 0.06, ease },
                          },
                          exit: {
                            opacity: 0,
                            y: -8,
                            transition: { duration: 0.15, delay: i * 0.02 },
                          },
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </motion.h1>
                </AnimatePresence>
              </div>

              {/* Description */}
              <div className="min-h-[44px] sm:min-h-[52px] mb-6">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`desc-${activeIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg"
                  >
                    {current.description}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* CTA + Nav row */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* CTA */}
                <motion.button
                  onClick={() => router.push('/app')}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
                  whileTap={{ scale: 0.97 }}
                >
                  ابدأ الآن
                  <ArrowLeft className="w-3.5 h-3.5" />
                </motion.button>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={goNext}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors"
                    whileTap={{ scale: 0.93 }}
                    aria-label="التالي"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={goPrev}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors"
                    whileTap={{ scale: 0.93 }}
                    aria-label="السابق"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <span className="text-[11px] font-mono text-muted-foreground tabular-nums mr-1 hidden sm:inline">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Feature dots (mobile) */}
              <div className="flex items-center justify-center gap-1.5 mt-5 md:hidden">
                {features.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex ? 'w-5 bg-primary' : 'w-1.5 bg-border'
                    }`}
                    aria-label={`الانتقال للميزة ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* ── Integrations Section ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 md:mt-10 md:pb-6"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-xs font-medium text-muted-foreground tracking-wide">
                  التكاملات المدعومة
                </span>
                <div className="h-px flex-1 bg-border/40" />
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {integrations.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      variants={itemVariants}
                      className="group relative rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-border hover:shadow-sm p-3 sm:p-4 transition-all duration-200 cursor-default"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${item.color}12` }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Bottom ticker ── */}
        <div className="absolute bottom-2 md:bottom-4 left-0 right-0 overflow-hidden opacity-[0.04] pointer-events-none">
          <motion.div
            className="flex whitespace-nowrap text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
            animate={{ x: [0, 800] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="mx-6">
                {features.map((f) => f.title).join(' • ')} •
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
