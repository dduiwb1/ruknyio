'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/lib/auth/auth-provider';
import { useUsernameCheck } from '@/lib/hooks/auth/use-username-check';
import { quickSignClient } from '@/lib/auth/quicksign-client';
import { setCsrfToken } from '@/lib/api/client';
import { sanitizeToken, handleError, logError, formLimiter } from '@/lib/security';
import { getProfileToken, saveProfileToken, clearProfileToken, isProfileTokenValid, getProfileTokenTimeRemaining } from '@/lib/auth/token-storage';
import { Loader2, CheckCircle2, XCircle, User, AlertTriangle, Store, Sparkles, FileText, MapPin, Phone, ShoppingBag, Utensils, Laptop, Palette, Home, Dumbbell, BookOpen, MoreHorizontal, Briefcase, Heart, Camera, Music, Car, Plane, Shirt, Gift, Gem, PawPrint, Baby, Hammer, Leaf, Coffee, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressIndicator from '@/components/ui/progress-indicator';
import { triggerCelebration } from '@/components/ui/confetti';
import { Select, SelectOption } from '@/components/ui/animated-select';

// 🔒 Text sanitization functions
const sanitizeName = (text: string): string => {
  // Allow Arabic, English letters, spaces, and common punctuation
  // Don't trim during typing - only remove dangerous characters
  return text
    .replace(/[<>{}[\]\\]/g, '') // Remove dangerous characters
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space (but allow single spaces)
    .slice(0, 50); // Max 50 characters
};

const sanitizeUsername = (text: string): string => {
  // Only allow lowercase letters, numbers, and underscores
  // Remove spaces and special characters immediately
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 30); // Max 30 characters
};

const sanitizePhone = (text: string): string => {
  // Only allow numbers, + at the start, and spaces for formatting
  const cleaned = text
    .replace(/[^\d+\s]/g, '') // Allow digits, +, and spaces
    .replace(/(?!^)\+/g, '') // Remove + if not at start
    .replace(/\s{2,}/g, ' '); // Replace multiple spaces with single
  return cleaned.slice(0, 20); // Max 20 characters (with spaces)
};

const sanitizeDescription = (text: string): string => {
  // Allow Arabic, English, numbers, and common punctuation
  // Preserve newlines and spaces for natural text
  return text
    .replace(/[<>{}[\]\\]/g, '') // Remove dangerous characters only
    .slice(0, 500); // Max 500 characters
};

// Store categories with icons
const storeCategories = [
  { id: 'fashion', label: 'أزياء وملابس', icon: Shirt },
  { id: 'electronics', label: 'إلكترونيات وأجهزة', icon: Laptop },
  { id: 'food', label: 'طعام ومشروبات', icon: Utensils },
  { id: 'beauty', label: 'جمال وعناية شخصية', icon: Palette },
  { id: 'home', label: 'منزل وأثاث', icon: Home },
  { id: 'sports', label: 'رياضة ولياقة', icon: Dumbbell },
  { id: 'books', label: 'كتب وقرطاسية', icon: BookOpen },
  { id: 'jewelry', label: 'مجوهرات وإكسسوارات', icon: Gem },
  { id: 'health', label: 'صحة وعافية', icon: Heart },
  { id: 'photography', label: 'تصوير وخدمات إبداعية', icon: Camera },
  { id: 'automotive', label: 'سيارات وقطع غيار', icon: Car },
  { id: 'travel', label: 'سياحة وسفر', icon: Plane },
  { id: 'gifts', label: 'هدايا ومناسبات', icon: Gift },
  { id: 'pets', label: 'حيوانات أليفة', icon: PawPrint },
  { id: 'kids', label: 'أطفال ومستلزماتهم', icon: Baby },
  { id: 'services', label: 'خدمات مهنية', icon: Briefcase },
  { id: 'handmade', label: 'منتجات يدوية', icon: Hammer },
  { id: 'organic', label: 'منتجات طبيعية وعضوية', icon: Leaf },
  { id: 'cafe', label: 'مقهى أو مطعم', icon: Coffee },
  { id: 'other', label: 'تصنيف آخر', icon: MoreHorizontal },
];

// Employee count options
const employeeOptions = [
  { value: 'solo', label: 'أعمل بمفردي', emoji: '👤' },
  { value: '2-5', label: '2 - 5 موظفين', emoji: '👥' },
  { value: '6-10', label: '6 - 10 موظفين', emoji: '👨‍👩‍👧‍👦' },
  { value: '11-50', label: '11 - 50 موظف', emoji: '🏢' },
  { value: '50+', label: 'أكثر من 50 موظف', emoji: '🏙️' },
];

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token');
  const [quickSignToken, setQuickSignToken] = useState<string | null>(null);
  const { setUser, user: currentUser, isAuthenticated, needsProfileCompletion, completeOAuthProfile } = useAuthContext();

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Step 1: Profile data
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    username: '',
    phone: '',
  });

  // Step 2: Store settings
  const [storeData, setStoreData] = useState({
    storeDescription: '',
    category: '',
    employeesCount: '',
    country: '',
    city: '',
    address: '',
    latitude: 0,
    longitude: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false); // للتأكد من أن التوكن تم فحصه
  
  const [progressStep, setProgressStep] = useState<'idle' | 'creating-account' | 'creating-store' | 'done'>('idle');
  const [storeCreationError, setStoreCreationError] = useState<string | null>(null);
  const [createdStoreSlug, setCreatedStoreSlug] = useState<string | null>(null);
  
  const { available, checking, error: usernameError } = useUsernameCheck(formData.username);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔐 جلب Token عند التحميل
  useEffect(() => {
    // getProfileToken يدعم الآن URL token كـ parameter
    const token = getProfileToken(urlToken);
    
    if (token) {
      console.log('[CompleteProfile] 🔑 Token found, saving it');
      saveProfileToken(token);
      setQuickSignToken(token);
    } else {
      // لا يوجد توكن في URL أو sessionStorage
      console.warn('[CompleteProfile] ❌ No valid token found');
      setError('انتهت صلاحية الرابط. يرجى طلب رابط جديد.');
    }
    
    // وضع علامة أن التوكن تم فحصه
    setTokenChecked(true);
  }, [urlToken]);

  // Detect if OAuth user or QuickSign user
  useEffect(() => {
    if (isSubmitting) return;
    
    if (isAuthenticated) {
      if (needsProfileCompletion) {
        setIsOAuthUser(true);
        return;
      }
      router.push('/');
      return;
    }

    if (quickSignToken) {
      setIsOAuthUser(false);
      return;
    }

    console.warn('⚠️ No token and not authenticated, redirecting to login');
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, needsProfileCompletion, quickSignToken, router, currentUser, isSubmitting]);

  // Composition flag to support IME (Arabic/other) input without aggressive sanitization
  const isComposing = useRef(false);

  const handleChange = useCallback((field: string, value: string) => {
    // If composing (IME), don't sanitize the name field yet to avoid breaking input
    if (field === 'name' && isComposing.current) {
      setFormData(prev => ({ ...prev, name: value }));
      setError(null);
      setRateLimitError(null);
      return;
    }

    let sanitizedValue = value;
    if (field === 'name') {
      sanitizedValue = sanitizeName(value);
    } else if (field === 'username') {
      sanitizedValue = sanitizeUsername(value);
    } else if (field === 'phone') {
      sanitizedValue = sanitizePhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    setError(null);
    setRateLimitError(null);
  }, []);

  const handleStoreChange = useCallback((field: string, value: string | boolean | number) => {
    let sanitizedValue = value;
    if (field === 'storeDescription' && typeof value === 'string') {
      sanitizedValue = sanitizeDescription(value);
    }
    setStoreData(prev => ({ ...prev, [field]: sanitizedValue }));
    setError(null);
  }, []);


  const validateStep1 = useCallback((): boolean => {
    const name = formData.name.trim();
    const username = formData.username.trim();
    
    if (!name) {
      setError('الرجاء إدخال اسمك');
      return false;
    }

    if (name.length < 2) {
      setError('الاسم يجب أن يكون حرفين على الأقل');
      return false;
    }

    if (name.length > 50) {
      setError('الاسم طويل جداً (الحد الأقصى 50 حرف)');
      return false;
    }

    if (!username) {
      setError('الرجاء إدخال اسم المستخدم');
      return false;
    }

    if (username.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      return false;
    }

    if (username.length > 30) {
      setError('اسم المستخدم طويل جداً (الحد الأقصى 30 حرف)');
      return false;
    }

    if (!/^[a-z][a-z0-9_]*$/.test(username)) {
      setError('اسم المستخدم يجب أن يبدأ بحرف ويحتوي على أحرف وأرقام وشرطة سفلية فقط');
      return false;
    }

    if (!available && !checking) {
      setError('اسم المستخدم غير متاح، جرب اسماً آخر');
      return false;
    }

    // Validate phone if provided
    if (formData.phone && formData.phone.length < 10) {
      setError('رقم الهاتف غير صحيح');
      return false;
    }

    return true;
  }, [formData.name, formData.username, formData.phone, available, checking]);

  const validateStep2 = useCallback((): boolean => {
    // For OAuth users, step 2 is optional (no store required)
    if (isOAuthUser) {
      return true;
    }
    
    // For QuickSign users, store category is required
    if (!storeData.category) {
      setError('الرجاء اختيار تصنيف المتجر');
      return false;
    }
    return true;
  }, [storeData.category, isOAuthUser]);

  const handleContinue = useCallback(() => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      setError(null);
    } else if (currentStep === 2) {
      // On last step, trigger form submission
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }
  }, [currentStep, validateStep1]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quickSignToken && !isOAuthUser) return;
    
    // Validate based on current step
    if (currentStep === 1) {
      handleContinue();
      return;
    }
    
    if (!validateStep2()) return;

    // 🔒 Rate Limiting (UX)
    const rateLimitCheck = formLimiter.check('complete-profile');
    if (!rateLimitCheck.allowed) {
      const seconds = Math.ceil(rateLimitCheck.resetIn / 1000);
      setRateLimitError(`محاولات كثيرة، يرجى الانتظار ${seconds} ثانية`);
      return;
    }

    // منع التوجيه التلقائي أثناء عملية الإرسال
    setIsSubmitting(true);
    setLoading(true);
    setError(null);
    setRateLimitError(null);
    setStoreCreationError(null);

    let storeSlug: string | null = null;

    try {
      // المرحلة 1: إنشاء الحساب
      setProgressStep('creating-account');
      
      if (isOAuthUser) {
        // OAuth user: Update profile via completeOAuthProfile
        const response = await completeOAuthProfile({
          name: formData.name.trim(),
          username: formData.username.trim(),
          phone: formData.phone.trim() || undefined,
        });

        // 🔒 Reset rate limiter on success
        formLimiter.reset('complete-profile');
        
        // Set user data
        if (response.user) {
          setUser(response.user);
        }
      } else {
        // QuickSign user: Complete profile with token
        // Backend will automatically create Store with same name as username
        const response = await quickSignClient.completeProfile({
          quickSignToken: quickSignToken!,
          name: formData.name.trim(),
          username: formData.username.trim(),
          isVendor: true,
          storeCategory: storeData.category || undefined,
          storeDescription: storeData.storeDescription.trim() || undefined,
          employeesCount: storeData.employeesCount || undefined,
          // Location fields - only send if location was selected
          storeCountry: storeData.country || undefined,
          storeCity: storeData.city || undefined,
          storeAddress: storeData.address || undefined,
          storeLatitude: storeData.latitude !== 0 ? storeData.latitude : undefined,
          storeLongitude: storeData.longitude !== 0 ? storeData.longitude : undefined,
        });

        // 🔒 Reset rate limiter on success
        formLimiter.reset('complete-profile');
        
        // 🔐 مسح الـ Token بعد النجاح
        clearProfileToken();
        
        // Set CSRF token and user data
        if (response.csrf_token) {
          setCsrfToken(response.csrf_token);
        }
        setUser(response.user);
        
        // Store created automatically by backend
        if (response.store) {
          storeSlug = response.store.slug;
          setCreatedStoreSlug(storeSlug);
        }
      }

      // المتجر يتم إنشاؤه تلقائياً من الـ Backend
      if (storeSlug) {
        setProgressStep('creating-store');
        // انتظر قليلاً لعرض رسالة إنشاء المتجر
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (isOAuthUser) {
        // OAuth users might not have a store - that's ok
        setProgressStep('creating-store');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // اكتمال العملية!
      setProgressStep('done');

      // Trigger celebration confetti!
      triggerCelebration();

      // Redirect to welcome page with user name and store info after a short delay for confetti
      setTimeout(() => {
        const params = new URLSearchParams();
        params.set('name', formData.name.trim());
        
        if (storeSlug) {
          params.set('store', storeSlug);
          params.set('storeCreated', 'true');
        } else if (!isOAuthUser && storeCreationError) {
          // Only show store error if it failed (not applicable for OAuth)
          params.set('storeError', 'true');
        }
        
        router.push(`/welcome?${params.toString()}`);
      }, 1500);
    } catch (err: unknown) {
      logError(err, 'CompleteProfile');
      const { message } = handleError(err);
      setError(message);
      setProgressStep('idle');
    } finally {
      setLoading(false);
    }
  }, [quickSignToken, isOAuthUser, currentStep, validateStep2, formData, storeData, storeCreationError, setUser, router, handleContinue]);

  const displayError = rateLimitError || error;

  // عرض loading أثناء فحص التوكن
  if (!tokenChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">جاري التحقق من الرابط...</p>
        </div>
      </div>
    );
  }

  if (!quickSignToken && !isOAuthUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center max-w-md w-full"
        >
          <div className="w-20 h-20 mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">رابط غير صالح</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            {error || 'هذه الصفحة تتطلب رابط تسجيل صالح.'}
            <br />
            سيتم توجيهك لصفحة تسجيل الدخول...
          </p>
          <button 
            onClick={() => router.push('/login')} 
            className="flex items-center justify-center gap-2 w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
          >
            الذهاب لتسجيل الدخول
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          {/* Header Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center mb-4"
          >
            <span className="text-xs bg-primary/20 text-primary font-semibold px-4 py-1.5 rounded-full">
              🎯 إكمال الملف الشخصي
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold py-4 text-center text-foreground"
          >
            دعنا نكمل إعدادك
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-md:text-sm text-muted-foreground pb-8 text-center max-w-sm"
          >
            أكمل بيانات ملفك الشخصي في خطوات بسيطة
          </motion.p>

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-96 w-full px-0"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Profile Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Full Name Input */}
                  <div>
                    <label htmlFor="name" className="font-semibold text-sm mb-3 block text-foreground">
                      الاسم الكامل
                    </label>
                    <div className="flex items-center h-12 pl-4 border-2 border-slate-300 dark:border-slate-600 rounded-full focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all overflow-hidden">
                      <User className="h-5 w-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                      <input
                        type="text"
                        id="name"
                        className="h-full px-3 w-full outline-none bg-transparent text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="أدخل اسمك الكامل"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onCompositionStart={() => (isComposing.current = true)}
                        onCompositionEnd={(e) => {
                          isComposing.current = false;
                          handleChange('name', (e.currentTarget as HTMLInputElement).value);
                        }}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Username Input */}
                  <div>
                    <label htmlFor="username" className="font-semibold text-sm mb-3 block text-foreground">
                      اسم المستخدم
                    </label>
                    <div className="flex items-center h-12 pl-4 border-2 border-slate-300 dark:border-slate-600 rounded-full focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all overflow-hidden">
                      <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                      <input
                        type="text"
                        id="username"
                        className="h-full px-3 w-full outline-none bg-transparent text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                        placeholder="username"
                        value={formData.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        disabled={loading}
                        dir="ltr"
                        required
                      />
                    </div>
                    {formData.username && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 flex items-center gap-2 text-xs font-medium ${
                          checking ? 'text-slate-600 dark:text-slate-400' :
                          available ? 'text-emerald-600 dark:text-emerald-400' :
                          'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {checking ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : available ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {checking ? 'جاري التحقق...' :
                         available ? 'متاح ✓' :
                         'غير متاح'}
                      </motion.div>
                    )}
                  </div>

                  {/* Phone Input (Optional) */}
                  <div>
                    <label htmlFor="phone" className="font-semibold text-sm mb-3 block text-foreground">
                      رقم الهاتف <span className="text-xs font-normal text-slate-500">(اختياري)</span>
                    </label>
                    <div className="flex items-center h-12 pl-4 border-2 border-slate-300 dark:border-slate-600 rounded-full focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all overflow-hidden">
                      <Phone className="h-5 w-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                      <input
                        type="tel"
                        id="phone"
                        className="h-full px-3 w-full outline-none bg-transparent text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                        placeholder="+964 770 123 4567"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        disabled={loading}
                        dir="ltr"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Store Settings */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {!isOAuthUser && (
                    <>
                      {/* Category Selection */}
                      <div>
                        <label className="font-semibold text-sm mb-3 block text-foreground">
                          تصنيف المتجر
                        </label>
                        <Select
                          value={storeData.category}
                          setValue={(value) => handleStoreChange('category', value as string)}
                          placeholder="📋 اختر تصنيف متجرك..."
                        >
                          {storeCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <SelectOption key={cat.id} value={cat.id}>
                                <span className="flex items-center gap-2.5">
                                  <Icon className="h-4.5 w-4.5" />
                                  <span>{cat.label}</span>
                                </span>
                              </SelectOption>
                            );
                          })}
                        </Select>
                      </div>

                      {/* Employees Count */}
                      <div>
                        <label className="font-semibold text-sm mb-3 block text-foreground">
                          حجم النشاط <span className="text-xs font-normal text-slate-500">(اختياري)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {employeeOptions.map((option) => {
                            const isSelected = storeData.employeesCount === option.value;
                            return (
                              <motion.button
                                key={option.value}
                                type="button"
                                onClick={() => handleStoreChange('employeesCount', option.value)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-3 py-2 rounded-full border-2 transition-all text-sm font-medium ${
                                  isSelected
                                    ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-primary/30 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="text-base mr-1">{option.emoji}</span>
                                {option.label}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Store Description */}
                      <div>
                        <label htmlFor="storeDescription" className="font-semibold text-sm mb-3 block text-foreground">
                          وصف المتجر <span className="text-xs font-normal text-slate-500">(اختياري)</span>
                        </label>
                        <textarea
                          id="storeDescription"
                          placeholder="اكتب نبذة مختصرة عن متجرك..."
                          value={storeData.storeDescription}
                          onChange={(e) => handleStoreChange('storeDescription', e.target.value)}
                          disabled={loading}
                          rows={4}
                          maxLength={500}
                          className="w-full p-4 border-2 border-slate-300 dark:border-slate-600 rounded-2xl bg-background text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none disabled:opacity-50 resize-none text-sm"
                        />
                        <div className="mt-1 text-xs text-slate-500">
                          {storeData.storeDescription.length}/500
                        </div>
                      </div>
                    </>
                  )}

                  {isOAuthUser && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800/30 rounded-2xl text-center"
                    >
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        رائع! ملفك الشخصي مكتمل
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        يمكنك الآن الدخول لرؤية لوحتك التحكمية
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Alert */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800/30 rounded-2xl flex items-start gap-3"
                role="alert"
              >
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">خطأ</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{displayError}</p>
                </div>
              </motion.div>
            )}

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between gap-3 mt-8"
            >
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 h-12 px-4 border-2 border-slate-300 dark:border-slate-600 text-foreground hover:border-primary/50 hover:bg-primary/5 font-semibold rounded-full transition-all disabled:opacity-50"
                >
                  رجوع
                </motion.button>
              )}

              <motion.button
                type={currentStep === totalSteps ? "submit" : "button"}
                onClick={currentStep === totalSteps ? undefined : handleContinue}
                disabled={loading || checking || !!rateLimitError}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 h-12 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    إكمال
                    <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    التالي
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-slate-500 text-center mt-6"
            >
              الخطوة {currentStep} من {totalSteps}
            </motion.p>
          </motion.div>

          {/* Progress During Submission */}
          <AnimatePresence>
            {progressStep !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-8 p-5 bg-primary/5 border-2 border-primary/20 rounded-2xl w-full max-w-96"
              >
                <div className="space-y-3">
                  <motion.div className="flex items-center gap-3">
                    {progressStep === 'creating-account' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (progressStep === 'creating-store' || progressStep === 'done') ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    )}
                    <span className="text-sm font-semibold text-foreground">
                      {progressStep === 'creating-account' ? 'جاري إنشاء الحساب...' : '✓ تم إنشاء الحساب'}
                    </span>
                  </motion.div>

                  <motion.div className="flex items-center gap-3">
                    {progressStep === 'creating-store' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : progressStep === 'done' ? (
                      storeCreationError ? (
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      )
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    )}
                    <span className={`text-sm font-semibold ${
                      progressStep === 'done' && storeCreationError ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                    }`}>
                      {progressStep === 'creating-store' ? 'جاري إنشاء المتجر...' : 
                       progressStep === 'done' && storeCreationError ? 'تحذير: فشل إنشاء المتجر' :
                       progressStep === 'done' ? '✓ تم الإنشاء بنجاح!' : 'سيتم إنشاء المتجر'}
                    </span>
                  </motion.div>

                  {progressStep === 'done' && !storeCreationError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2 pt-2 mt-2 border-t border-primary/10"
                    >
                      <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        جاري التحويل...
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}

// Loading fallback component
function CompleteProfileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">جاري التحميل...</p>
      </div>
    </div>
  );
}

// Main page component wrapped in Suspense
export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<CompleteProfileLoading />}>
      <CompleteProfileContent />
    </Suspense>
  );
}
