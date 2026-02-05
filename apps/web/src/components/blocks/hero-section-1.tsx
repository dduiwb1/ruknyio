'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, ChevronDown, Menu, X, Store, Calendar, Users, Sparkles, LayoutGrid, CreditCard, BarChart3, Settings, FileText, User, Bot, Check, Zap, Shield, Clock, Headphones, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { AnimatedBeam, Circle } from '@/components/ui/animated-beam';
import { cn } from '@/lib/utils';
import type { Variants } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
} satisfies { item: Variants };

export function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden bg-white" dir="rtl">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute right-0 top-0 rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(var(--primary)/0.08)_0,hsla(var(--primary)/0.02)_50%,hsla(var(--primary)/0)_80%)]" />
                    <div className="h-[80rem] absolute right-0 top-0 w-56 rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(var(--primary)/0.06)_0,hsla(var(--primary)/0.02)_80%,transparent_100%)] [translate:-5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute right-0 top-0 w-56 rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(var(--primary)/0.04)_0,hsla(var(--primary)/0.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-20 sm:pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring' as const,
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <Image
                                src="https://images.unsplash.com/photo-1557683316-973673baf926?w=3276&q=80"
                                alt="خلفية"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block object-cover"
                                width={3276}
                                height={4095}
                                priority
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-4 sm:px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants as { item: Variants }}>
                                    <Link
                                        href="/features"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-2 sm:gap-4 rounded-full border p-1 pr-3 sm:pr-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-xs sm:text-sm">🎉 اكتشف مميزات ركني الجديدة</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-r bg-white dark:bg-zinc-700 hidden sm:block"></span>

                                        <div className="bg-background group-hover:bg-muted size-5 sm:size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-10 sm:w-12 translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-5 sm:size-6">
                                                    <ArrowRight className="m-auto size-2.5 sm:size-3 rotate-180" />
                                                </span>
                                                <span className="flex size-5 sm:size-6">
                                                    <ArrowRight className="m-auto size-2.5 sm:size-3 rotate-180" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <h1
                                        className="mt-6 sm:mt-8 max-w-4xl mx-auto text-balance text-3xl sm:text-4xl md:text-5xl font-bold lg:text-6xl lg:mt-16 xl:text-[4.5rem] leading-tight">
                                        أنشئ صفحتك الاحترافية مع منصة <span className="text-primary">ركني</span>
                                    </h1>
                                    <p
                                        className="mx-auto mt-4 sm:mt-6 md:mt-8 max-w-2xl text-balance text-sm sm:text-base md:text-lg text-muted-foreground px-2">
                                        صفحة واحدة تجمع روابطك ومنتجاتك ونماذجك. كل ما تحتاجه للتواصل مع جمهورك وتنمية أعمالك.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        item: transitionVariants.item,
                                    }}
                                    className="mt-8 sm:mt-10 md:mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-6 sm:px-8 text-sm sm:text-base h-11 sm:h-12">
                                            <Link href="/app">
                                                <span className="text-nowrap">ابدأ مجاناً</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                item: transitionVariants.item,
                            }}>
                            <div className="relative mt-8 sm:mt-12 md:mt-20 overflow-hidden px-4 sm:px-6">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-xl sm:rounded-2xl border p-2 sm:p-4 shadow-lg shadow-zinc-950/15 ring-1">
                                    <Image
                                        className="bg-background aspect-[16/10] sm:aspect-[15/8] relative hidden rounded-xl sm:rounded-2xl dark:block object-cover"
                                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=2700&q=80"
                                        alt="لوحة تحكم ركني"
                                        width={2700}
                                        height={1440}
                                    />
                                    <Image
                                        className="z-2 border-border/25 aspect-[16/10] sm:aspect-[15/8] relative rounded-xl sm:rounded-2xl border dark:hidden object-cover"
                                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=2700&q=80"
                                        alt="لوحة تحكم ركني"
                                        width={2700}
                                        height={1440}
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-background py-12 md:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-8 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl font-bold md:text-4xl mb-3 md:mb-4">كل ما تحتاجه في مكان واحد</h2>
                            <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
                                أدوات متكاملة لإدارة أعمالك بكفاءة عالية
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                            <FeatureCard
                                icon={<Store className="size-5 sm:size-6" />}
                                title="إنشاء المتاجر"
                                description="أنشئ متجرك الإلكتروني بسهولة وابدأ البيع فوراً"
                            />
                            <FeatureCard
                                icon={<Calendar className="size-5 sm:size-6" />}
                                title="إدارة الفعاليات"
                                description="نظّم فعالياتك واستقبل الحجوزات بشكل آلي"
                            />
                            <FeatureCard
                                icon={<Users className="size-5 sm:size-6" />}
                                title="تواصل مع العملاء"
                                description="تابع عملاءك وأرسل لهم التحديثات والعروض"
                            />
                            <FeatureCard
                                icon={<Sparkles className="size-5 sm:size-6" />}
                                title="تحليلات متقدمة"
                                description="راقب أداء متجرك واتخذ قرارات ذكية"
                            />
                        </div>
                    </div>
                </section>

                {/* Partners Section */}
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <Link
                                href="/partners"
                                className="block text-sm duration-150 hover:opacity-75">
                                <span>شركاؤنا في النجاح</span>
                                <ChevronRight className="mr-1 inline-block size-3 rotate-180" />
                            </Link>
                        </div>
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-semibold text-muted-foreground">يثق بنا أكثر من 1000+ تاجر</h3>
                        </div>
                        <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
                            <div className="flex items-center justify-center">
                                <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm font-medium">شريك 1</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm font-medium">شريك 2</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm font-medium">شريك 3</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm font-medium">شريك 4</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm font-medium">شريك 5</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm font-medium">شريك 6</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm font-medium">شريك 7</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm font-medium">شريك 8</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Advantages Section */}
                <section className="bg-muted/30 py-12 md:py-20 lg:py-28 m-2 md:m-12 rounded-4xl border-2 border-muted/120 drop-shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="flex gap-4 flex-col items-start sm:items-center sm:text-center">
                            <Badge variant="secondary" className="text-xs sm:text-sm">
                                لماذا ركني؟
                            </Badge>
                            <div className="flex gap-2 sm:gap-3 flex-col">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight font-bold">
                                    مميزات تجعلنا الخيار الأول
                                </h2>
                                <p className="text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed text-muted-foreground">
                                    نقدم لك أدوات متكاملة تساعدك على إدارة أعمالك بكفاءة وسهولة، مع دعم فني متواصل.
                                </p>
                            </div>
                            <div className="flex gap-6 sm:gap-8 md:gap-10 pt-8 sm:pt-10 md:pt-12 flex-col w-full">
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                                    <AdvantageItem 
                                        icon={<Zap className="size-4 sm:size-5 text-primary" />}
                                        title="سرعة فائقة"
                                        description="أداء سريع وموثوق يضمن تجربة سلسة لك ولعملائك."
                                    />
                                    <AdvantageItem 
                                        icon={<Shield className="size-4 sm:size-5 text-primary" />}
                                        title="أمان متقدم"
                                        description="حماية بياناتك وبيانات عملائك بأعلى معايير الأمان."
                                    />
                                    <AdvantageItem 
                                        icon={<Clock className="size-4 sm:size-5 text-primary" />}
                                        title="توفير الوقت"
                                        description="أتمتة المهام المتكررة لتركز على تنمية أعمالك."
                                    />
                                    <AdvantageItem 
                                        icon={<Headphones className="size-4 sm:size-5 text-primary" />}
                                        title="دعم متواصل"
                                        description="فريق دعم جاهز لمساعدتك على مدار الساعة."
                                    />
                                    <AdvantageItem 
                                        icon={<Globe className="size-4 sm:size-5 text-primary" />}
                                        title="وصول عالمي"
                                        description="اعرض منتجاتك وخدماتك للعملاء في كل مكان."
                                    />
                                    <AdvantageItem 
                                        icon={<BarChart3 className="size-4 sm:size-5 text-primary" />}
                                        title="تحليلات ذكية"
                                        description="تقارير مفصلة تساعدك على اتخاذ قرارات أفضل."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Integrations Section with Animated Beam */}
                <section className="bg-background py-12 md:py-20 lg:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="flex gap-4 flex-col items-center text-center mb-10 md:mb-16">
                            <Badge variant="secondary" className="text-xs sm:text-sm">
                                التكاملات
                            </Badge>
                            <div className="flex gap-2 sm:gap-3 flex-col">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight font-bold">
                                    تكامل سلس مع أدواتك المفضلة
                                </h2>
                                <p className="text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed text-muted-foreground">
                                    اربط متجرك مع أكثر من 20 تطبيق وخدمة لتعزيز إنتاجيتك وتوسيع نطاق عملك.
                                </p>
                            </div>
                        </div>
                        <IntegrationsBeam />
                    </div>
                </section>
            </main>
        </>
    );
}

// Integration Icons as SVG components
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="size-8" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

const GmailIcon = () => (
    <svg viewBox="0 0 24 24" className="size-8">
        <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" className="size-8" fill="#000000">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
);

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" className="size-8" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" className="size-8">
        <defs>
            <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFDC80"/>
                <stop offset="50%" stopColor="#F56040"/>
                <stop offset="100%" stopColor="#833AB4"/>
            </linearGradient>
        </defs>
        <path fill="url(#instagram-gradient)" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
    </svg>
);

const GoogleSheetsIcon = () => (
    <svg viewBox="0 0 24 24" className="size-8">
        <path fill="#0F9D58" d="M19.5 24h-15A4.5 4.5 0 0 1 0 19.5v-15A4.5 4.5 0 0 1 4.5 0h15A4.5 4.5 0 0 1 24 4.5v15a4.5 4.5 0 0 1-4.5 4.5z"/>
        <path fill="#FFFFFF" d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/>
        <rect fill="#FFFFFF" x="5" y="5" width="14" height="14" rx="1" opacity="0.2"/>
        <path fill="#FFFFFF" d="M6 6h12v2H6zm0 4h12v2H6zm0 4h12v2H6zm0 4h12v2H6z" opacity="0.5"/>
    </svg>
);

const AWSS3Icon = () => (
    <svg viewBox="0 0 24 24" className="size-8">
        <path fill="#569A31" d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm-1.073 1.445h.001a1.8 1.8 0 0 1 2.138 0l7.534 5.026c.594.442.924 1.14.924 1.837v7.384c0 .698-.33 1.395-.924 1.838L13.066 22.555a1.8 1.8 0 0 1-2.138 0L3.394 17.53a2.26 2.26 0 0 1-.924-1.838V8.308c0-.698.33-1.395.924-1.837l7.533-5.026z"/>
        <path fill="#FFFFFF" d="M12 6.5l-4 2.25v4.5l4 2.25 4-2.25v-4.5L12 6.5zm0 1.35l2.6 1.4-2.6 1.4-2.6-1.4 2.6-1.4zm-3 2.4l2.5 1.35v2.7L9 12.9v-2.65zm6 0v2.65l-2.5 1.35v-2.7l2.5-1.35z"/>
    </svg>
);

const WaylIcon = () => (
    <svg width="64" height="24" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_wayl)">
            <path d="M1.18278 22.4364C0.40062 21.4313 0 19.8422 0 17.6693C0 16.176 0.209849 14.4051 0.620007 12.3375L1.89818 6.31641H7.14439L5.99976 11.7153C5.38929 14.721 5.08406 16.7599 5.08406 17.832C5.08406 19.019 5.40837 19.6125 6.06653 19.6125C6.96316 19.6125 7.91701 18.5308 8.91856 16.377C9.92011 14.2137 10.9026 10.8633 11.866 6.32598H17.1122L15.3762 14.2232C15.1759 15.1039 15.0137 15.9176 14.8706 16.6738C14.7276 17.43 14.6608 18.0043 14.6608 18.3968C14.6608 18.818 14.7371 19.1243 14.8897 19.3158C15.0423 19.5168 15.2808 19.6125 15.6146 19.6125C16.2728 19.6125 16.9596 19.0956 17.694 18.0522C18.4285 17.0088 19.1535 15.4868 19.8784 13.4766C20.6033 11.4664 21.2519 9.08284 21.8433 6.32598H27.0895C26.5172 9.37001 25.6111 12.2513 24.371 14.9412C23.1215 17.6406 21.6526 19.8135 19.9642 21.4696C18.2664 23.1256 16.5208 23.9488 14.6989 23.9488C13.7355 23.9488 12.9915 23.6329 12.4574 23.0107C11.9232 22.3885 11.6561 21.4887 11.6561 20.3304C11.6561 19.8901 11.7134 19.3445 11.8183 18.684V18.55C11.8183 18.2819 11.6847 18.1575 11.4272 18.1575C11.1411 18.1575 10.9121 18.3298 10.7404 18.684C9.92965 20.4836 8.97579 21.8046 7.86932 22.6661C6.76285 23.5181 5.59914 23.9488 4.3782 23.9488C3.0428 23.9488 1.98402 23.4415 1.20186 22.4364H1.18278Z" fill="currentColor"/>
            <path d="M27.959 10.5944C28.9414 9.12984 30.1433 7.962 31.5645 7.09091C32.9858 6.22939 34.4929 5.78906 36.0858 5.78906C37.0492 5.78906 37.8218 5.99966 38.3941 6.41127C38.976 6.83246 39.472 7.37809 39.8822 8.05773C39.9871 8.21089 40.092 8.31618 40.1779 8.38319C40.2637 8.4502 40.3877 8.4502 40.5403 8.38319C40.7406 8.27789 40.836 8.13431 40.836 7.95243C40.836 7.88543 40.8169 7.7897 40.7693 7.65569C40.7025 7.52167 40.6262 7.36851 40.5403 7.19621C40.4545 7.02391 40.4068 6.84203 40.4068 6.66973C40.4068 6.53571 40.4163 6.42084 40.4354 6.30597H45.6816L43.7453 15.5147C43.3924 17.1132 43.1444 18.3864 42.9917 19.3149C42.8391 20.2434 42.7628 21.0379 42.7628 21.6984C42.7628 22.3589 42.8582 23.0386 43.0585 23.6704H37.7455C37.6406 23.23 37.5834 22.8567 37.5834 22.5504C37.5834 21.976 37.6788 21.4496 37.8791 20.9518C38.0794 20.454 38.3465 19.9275 38.6994 19.3532C38.8711 19.0852 38.9951 18.8937 39.0618 18.7597C39.1286 18.6257 39.1572 18.5204 39.1572 18.4342C39.1572 18.3002 39.0905 18.2045 38.9569 18.1375C38.9378 18.1184 38.8806 18.1088 38.7948 18.1088C38.7089 18.1088 38.6135 18.1375 38.5182 18.1949C38.4228 18.2524 38.356 18.3194 38.3369 18.4055C36.2194 22.2632 33.7012 24.1968 30.8014 24.1968C29.2944 24.1968 28.0543 23.6225 27.1005 22.4834C26.1371 21.3443 25.6602 19.8222 25.6602 17.9078C25.6602 17.008 25.746 16.1656 25.9177 15.3711C26.2897 13.6385 26.9669 12.0399 27.9494 10.5657L27.959 10.5944ZM35.628 18.7789C36.4387 18.1471 37.1541 17.2377 37.7932 16.0603C38.4228 14.8829 38.9092 13.5427 39.2335 12.0303C38.7948 11.3698 38.356 10.9103 37.9268 10.6519C37.488 10.3934 36.9252 10.2594 36.2194 10.2594C34.9507 10.2594 33.8729 10.738 32.9953 11.6857C32.1082 12.6429 31.4882 13.9352 31.1448 15.5817C31.0399 16.1752 30.9827 16.6538 30.9827 17.0271C30.9827 17.9078 31.183 18.5683 31.5931 19.0373C31.9938 19.4968 32.5279 19.7265 33.1861 19.7265C34.0159 19.7265 34.8363 19.4106 35.647 18.7693L35.628 18.7789Z" fill="currentColor"/>
            <path d="M53.3016 6.31426L51.5942 14.336C51.2222 16.1547 51.041 17.3226 51.041 17.8203C51.041 18.2607 51.1268 18.5765 51.289 18.7776C51.4511 18.9786 51.7182 19.0743 52.0902 19.0743C52.7007 19.0743 53.521 18.433 54.5512 17.1503C55.5813 15.8675 56.5543 14.3168 57.47 12.5076C58.3857 10.6984 59.0152 9.06155 59.3395 7.58739L59.5971 6.30469H64.8433L62.1534 18.9403C61.5429 21.8982 60.8466 24.1381 60.0549 25.6697C59.2728 27.1917 58.1472 28.2926 56.6783 28.9722C55.2093 29.6518 53.1299 29.9965 50.421 29.9965H43.5723L44.4594 25.7846H48.952C51.0314 25.7846 52.529 25.6506 53.4638 25.3921C54.389 25.1337 55.0662 24.6263 55.4955 23.8988C55.9247 23.1617 56.3158 21.9173 56.6878 20.1656C56.7736 19.6869 56.9263 19.237 57.1266 18.8159C57.3364 18.4042 57.5272 18.0309 57.718 17.715C57.8992 17.3991 58.0327 17.179 58.0995 17.0737C58.1854 16.9014 58.233 16.7769 58.233 16.7099C58.233 16.5759 58.1567 16.4802 58.0041 16.4132C57.9564 16.394 57.9087 16.3845 57.842 16.3845C57.6894 16.3845 57.5367 16.4898 57.3841 16.7099C56.3826 18.5765 55.1235 20.156 53.6164 21.4674C52.1093 22.7693 50.5259 23.4202 48.8662 23.4202C47.6452 23.4202 46.7677 23.1617 46.2431 22.6448C45.7184 22.1279 45.4609 21.3143 45.4609 20.1943C45.4609 19.1413 45.6898 17.581 46.1477 15.5229L48.084 6.31426H53.3302H53.3016Z" fill="currentColor"/>
            <path d="M72.1412 0.113109C72.9901 0.189689 73.6101 0.361992 73.9917 0.620448C74.3732 0.878904 74.564 1.30966 74.564 1.90315C74.564 2.38178 74.4686 3.02313 74.2683 3.80807L71.216 16.9702C71.0157 17.9178 70.9203 18.4826 70.9203 18.6836C70.9203 19.0378 71.0347 19.258 71.2637 19.3441C71.4926 19.4303 71.96 19.4781 72.6563 19.4781H73.8391L72.952 23.69H69.1461C67.7439 23.69 66.7519 23.5081 66.1605 23.1348C65.5691 22.7615 65.2734 22.0723 65.2734 21.0672C65.2734 20.4545 65.3688 19.7079 65.5691 18.8272L68.5547 6.00015C68.7073 5.33966 68.7836 4.93761 68.7836 4.78446C68.7836 4.51643 68.6787 4.36327 68.4689 4.30583C68.259 4.2484 67.8107 4.21968 67.1048 4.21968L67.9919 0.0078125C69.8901 0.0078125 71.2732 0.0461022 72.1221 0.122682L72.1412 0.113109Z" fill="currentColor"/>
        </g>
        <defs>
            <clipPath id="clip0_wayl">
                <rect width="80" height="30" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);

const TryboxtIcon = () => (
    <div className="size-6 rounded bg-gray-500 flex items-center justify-center">
        <span className="text-white text-[10px] font-bold">TB</span>
    </div>
);

const RuknyIcon = () => (
    <div className="p-2 h-8 rounded-full flex items-center justify-center">
        <span className="text-black text-sm font-bold" style={{ fontFamily: 'var(--font-courgette), cursive' }}>Rukny</span>
    </div>
);

function IntegrationsBeam() {
    const containerRef = useRef<HTMLDivElement>(null);
    const centerRef = useRef<HTMLDivElement>(null);
    
    // Left side refs
    const whatsappRef = useRef<HTMLDivElement>(null);
    const gmailRef = useRef<HTMLDivElement>(null);
    const tiktokRef = useRef<HTMLDivElement>(null);
    const sheetsRef = useRef<HTMLDivElement>(null);
    
    // Right side refs
    const facebookRef = useRef<HTMLDivElement>(null);
    const instagramRef = useRef<HTMLDivElement>(null);
    const awsRef = useRef<HTMLDivElement>(null);
    const waylRef = useRef<HTMLDivElement>(null);
    const tryboxtRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className="relative flex h-[400px] sm:h-[450px] md:h-[500px] w-full items-center justify-center overflow-hidden rounded-4xl border bg-background p-4 sm:p-6 md:p-10"
        >
            <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-4 sm:gap-6 md:gap-10">
                {/* Left Column */}
                <div className="flex flex-col justify-center gap-3 sm:gap-4">
                    <Circle ref={whatsappRef} className="size-12 sm:size-14 md:size-18 border-green-500/30 hover:border-green-500 transition-colors">
                        <WhatsAppIcon />
                    </Circle>
                    <Circle ref={gmailRef} className="size-12 sm:size-14 md:size-18 border-red-500/30 hover:border-red-500 transition-colors">
                        <GmailIcon />
                    </Circle>
                    <Circle ref={tiktokRef} className="size-12 sm:size-14 md:size-18 border-gray-500/30 hover:border-gray-500 transition-colors">
                        <TikTokIcon />
                    </Circle>
                    <Circle ref={sheetsRef} className="size-12 sm:size-14 md:size-18 border-green-600/30 hover:border-green-600 transition-colors">
                        <GoogleSheetsIcon />
                    </Circle>
                </div>

                {/* Center - Rukny Logo */}
                <div className="flex flex-col justify-center">
                    <Circle
                        ref={centerRef}
                        className="size-18 sm:size-20 md:size-22 border-primary/50 hover:border-primary transition-colors shadow-lg"
                    >
                        <RuknyIcon />
                    </Circle>
                </div>

                {/* Right Column */}
                <div className="flex flex-col justify-center gap-3 sm:gap-4">
                    <Circle ref={facebookRef} className="size-12 sm:size-14 md:size-18 border-gray-500/30 hover:border-gray-500 transition-colors">
                        <FacebookIcon />
                    </Circle>
                    <Circle ref={instagramRef} className="size-12 sm:size-14 md:size-18 border-gray-500/30 hover:border-gray-500 transition-colors">
                        <InstagramIcon />
                    </Circle>
                    <Circle ref={awsRef} className="size-12 sm:size-14 md:size-18 border-gray-500/30 hover:border-gray-500 transition-colors">
                        <AWSS3Icon />
                    </Circle>
                    <Circle ref={waylRef} className="size-12 sm:size-14 md:size-18 border-gray-500/30 hover:border-gray-500 transition-colors">
                        <WaylIcon />
                    </Circle>
                    <Circle ref={tryboxtRef} className="size-12 sm:size-14 md:size-18 border-gray-500/30 hover:border-gray-500 transition-colors">
                        <TryboxtIcon />
                    </Circle>
                </div>
            </div>

            {/* Animated Beams - Left to Center */}
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={whatsappRef}
                toRef={centerRef}
                curvature={-75}
                gradientStartColor="#25D366"
                gradientStopColor="#4a7c59"
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={gmailRef}
                toRef={centerRef}
                curvature={-25}
                gradientStartColor="#EA4335"
                gradientStopColor="#4a7c59"
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={tiktokRef}
                toRef={centerRef}
                curvature={25}
                gradientStartColor="#000000"
                gradientStopColor="#4a7c59"
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={sheetsRef}
                toRef={centerRef}
                curvature={75}
                gradientStartColor="#0F9D58"
                gradientStopColor="#4a7c59"
            />

            {/* Animated Beams - Center to Right */}
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={facebookRef}
                curvature={-75}
                reverse
                gradientStartColor="#4a7c59"
                gradientStopColor="#1877F2"
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={instagramRef}
                curvature={-40}
                reverse
                gradientStartColor="#4a7c59"
                gradientStopColor="#E4405F"
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={awsRef}
                curvature={0}
                reverse
                gradientStartColor="#4a7c59"
                gradientStopColor="#FF9900"
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={waylRef}
                curvature={40}
                reverse
                gradientStartColor="#4a7c59"
                gradientStopColor="#8B5CF6"
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={tryboxtRef}
                curvature={75}
                reverse
                gradientStartColor="#4a7c59"
                gradientStopColor="#06B6D4"
            />
        </div>
    );
}

function AdvantageItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-row gap-3 sm:gap-4 w-full items-start p-4 sm:p-5 rounded-2xl bg-background/60 border border-border/50 hover:border-primary/30 hover:bg-background transition-all duration-300">
            <div className="size-9 sm:size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="flex flex-col gap-0.5 sm:gap-1 text-right">
                <p className="font-semibold text-sm sm:text-base">{title}</p>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="group relative rounded-2xl border border-border/50 bg-muted/40 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:bg-muted/60">
            <div className="mb-3 sm:mb-4 inline-flex size-10 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                {icon}
            </div>
            <h3 className="mb-1 sm:mb-2 text-sm sm:text-lg font-semibold leading-tight">{title}</h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">{description}</p>
        </div>
    );
}

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

const HeroHeader = () => {
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

    // Close product menu when clicking outside
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

                {/* Mega Menu Dropdown - Full Width like wayl.io */}
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
                                        {/* Products Grid - 3 columns for 6 items */}
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
                                    // Close if dragged down more than 100px or with fast velocity
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

                                    {/* Products Section - Cards with Text */}
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
};

const RuknyLogo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-courgette), cursive' }}>Rukny</span>
        </div>
    );
};

export default HeroSection;
