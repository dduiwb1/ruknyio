'use client';

/**
 * 🎉 Welcome Page - Shown after successful registration/profile completion
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import { 
  Store, 
  Calendar, 
  FileText, 
  Link2, 
  BarChart3, 
  Sparkles,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Users,
  Globe,
  Megaphone,
  Target,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Bot,
  Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function WelcomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const features = [
    {
      icon: Store,
      title: 'المتاجر الإلكترونية',
      description: 'أنشئ متجرك الإلكتروني وابدأ البيع فوراً مع نظام متكامل لإدارة المنتجات والطلبات',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      icon: Calendar,
      title: 'إدارة الفعاليات',
      description: 'نظم فعالياتك وأحداثك بسهولة مع تتبع الحضور والتذاكر',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      icon: FileText,
      title: 'النماذج الذكية',
      description: 'صمم نماذج تفاعلية لجمع البيانات وإدارة الاستبيانات',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      icon: Link2,
      title: 'روابط مختصرة',
      description: 'اختصر روابطك وتتبع زوارك بإحصائيات تفصيلية',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      icon: BarChart3,
      title: 'تحليلات متقدمة',
      description: 'احصائيات شاملة لفهم أداء منتجاتك وفعالياتك',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
    },
    {
      icon: Bot,
      title: 'تكامل الذكاء الاصطناعي',
      description: 'استخدم AI لإنشاء المحتوى وتحليل البيانات تلقائياً',
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
      borderColor: 'border-violet-200 dark:border-violet-800',
    },
  ];

  const updates = [
    {
      icon: Megaphone,
      title: 'حملات التسويق',
      description: 'أطلق حملات إعلانية ذكية لمنتجاتك وفعالياتك',
      status: 'قريباً'
    },
    {
      icon: Target,
      title: 'استهداف متقدم',
      description: 'استهدف جمهورك المثالي بإعلانات مخصصة',
      status: 'قريباً'
    },
    {
      icon: TrendingUp,
      title: 'تحسين SEO',
      description: 'أدوات متقدمة لتحسين ظهورك في محركات البحث',
      status: 'قيد التطوير'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex mb-6"
          >
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-xs px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1" />
              مرحباً بك في Rukny
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4"
          >
            أهلاً {user.name || 'بك'}! 🎉
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto"
          >
            منصتك الشاملة لإنشاء متجرك الإلكتروني، إدارة فعالياتك، وبناء حملاتك التسويقية بكل سهولة
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => router.push('/app')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3.5 rounded-full font-medium shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            ابدأ الآن
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Platform Purpose */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12 bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-zinc-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">هدف المنصة</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Rukny تساعدك على بناء حضورك الرقمي بطريقة احترافية وسهلة. من إنشاء متجرك الإلكتروني إلى تنظيم فعالياتك وإطلاق حملاتك التسويقية - كل ما تحتاجه في مكان واحد.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { icon: Zap, label: 'سريع', value: '99%' },
              { icon: Shield, label: 'آمن', value: '100%' },
              { icon: Clock, label: 'متاح 24/7', value: 'دائماً' },
              { icon: Users, label: 'سهل الاستخدام', value: '⭐⭐⭐⭐⭐' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-zinc-700/50"
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">{stat.label}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            مميزات المنصة
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl p-6 bg-white dark:bg-zinc-800 border ${feature.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`relative w-12 h-12 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                </div>
                
                {/* Content */}
                <h3 className="relative text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="relative text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>

                {/* Checkmark */}
                <div className="relative mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 className="w-4 h-4" />
                  متاح الآن
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Coming Soon Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              التحديثات القادمة
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {updates.map((update, index) => (
              <motion.div
                key={update.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-800/50 border border-slate-200 dark:border-zinc-700"
              >
                <update.icon className="w-10 h-10 text-orange-600 dark:text-orange-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {update.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {update.description}
                </p>
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                  {update.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="text-center bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white"
        >
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-2">جاهز للبدء؟</h3>
          <p className="text-indigo-100 mb-6 max-w-xl mx-auto">
            انطلق الآن وابدأ رحلتك الرقمية معنا. منصة شاملة لكل احتياجاتك
          </p>
          <button
            onClick={() => router.push('/app')}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3.5 rounded-full font-medium shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            انتقل إلى لوحة التحكم
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
