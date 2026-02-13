'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/lib/auth/auth-provider';
import { useUsernameCheck } from '@/lib/hooks/auth/use-username-check';
import { quickSignClient } from '@/lib/auth/quicksign-client';
import { setCsrfToken } from '@/lib/api/client';
import { sanitizeToken, handleError, logError, formLimiter } from '@/lib/security';
import { Loader2, CheckCircle2, XCircle, User, AlertTriangle, Store, Sparkles, FileText, MapPin, Phone, ShoppingBag, Utensils, Laptop, Palette, Home, Dumbbell, BookOpen, MoreHorizontal, Briefcase, Heart, Camera, Music, Car, Plane, Shirt, Gift, Gem, PawPrint, Baby, Hammer, Leaf, Coffee } from 'lucide-react';
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

// 🔐 Helper لجلب Token بأمان من URL أو sessionStorage
const getProfileToken = (urlToken: string | null): string | null => {
  if (urlToken) {
    return sanitizeToken(urlToken);
  }
  
  if (typeof window !== 'undefined') {
    const sessionToken = sessionStorage.getItem('profile_completion_token');
    if (sessionToken) {
      return sanitizeToken(sessionToken);
    }
  }
  
  return null;
};

const clearProfileToken = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('profile_completion_token');
  }
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
  const { setUser, user: currentUser, isAuthenticated, needsProfileCompletion } = useAuthContext();

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
  
  const [progressStep, setProgressStep] = useState<'idle' | 'creating-account' | 'creating-store' | 'done'>('idle');
  const [storeCreationError, setStoreCreationError] = useState<string | null>(null);
  const [createdStoreSlug, setCreatedStoreSlug] = useState<string | null>(null);
  
  const { available, checking, error: usernameError } = useUsernameCheck(formData.username);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔐 جلب Token عند التحميل
  useEffect(() => {
    const token = getProfileToken(urlToken);
    if (token) {
      setQuickSignToken(token);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('profile_completion_token', token);
      }
    }
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
    if (!storeData.category) {
      setError('الرجاء اختيار تصنيف المتجر');
      return false;
    }
    return true;
  }, [storeData.category]);

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

    let accessToken: string | null = null;
    let storeSlug: string | null = null;

    try {
      // المرحلة 1: إنشاء الحساب
      setProgressStep('creating-account');
      
      if (isOAuthUser) {
        // OAuth user: Update profile via /auth/me endpoint
        // TODO: Create update profile API call
        throw new Error('تحديث OAuth profile قيد التطوير');
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
        accessToken = response.access_token;
        
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
        } else if (storeCreationError) {
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

  if (!quickSignToken && !isOAuthUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <div className="flex items-center justify-center size-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-light text-foreground mb-2">رابط غير صالح</h1>
          <p className="text-sm text-muted-foreground mb-8">
            هذه الصفحة تتطلب رابط تسجيل صالح. سيتم توجيهك لصفحة تسجيل الدخول...
          </p>
          <button 
            onClick={() => router.push('/login')} 
            className="flex items-center justify-center w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-medium rounded-full transition-all duration-300"
          >
            الذهاب لتسجيل الدخول
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
        className="flex flex-col items-center w-full max-w-md"
      >
        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <AnimatePresence mode="wait">
            {/* Step 1: Profile Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <span className="inline-flex items-center gap-2 text-xs bg-muted/80 text-muted-foreground font-medium px-4 py-1.5 rounded-full mb-5">
                    <User className="h-3.5 w-3.5" />
                    إكمال الملف الشخصي
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground mb-2">
                    أهلاً بك
                  </h1>
                  <p className="text-sm text-muted-foreground/80">
                    أخبرنا المزيد عنك لإنشاء حسابك
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-foreground pr-1">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center h-14 pr-4 border border-border rounded-full bg-background focus-within:ring-2 focus-within:ring-foreground/10 focus-within:border-foreground/30 transition-all">
                    <User className="h-5 w-5 text-muted-foreground/70 flex-shrink-0" />
                    <input
                      id="name"
                      type="text"
                      placeholder="محمد أحمد"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onCompositionStart={() => (isComposing.current = true)}
                      onCompositionEnd={(e) => {
                        isComposing.current = false;
                        // sanitize final composed value
                        handleChange('name', (e.currentTarget as HTMLInputElement).value);
                      }}
                      disabled={loading}
                      required
                      className="h-full px-3 w-full outline-none focus:outline-none focus:ring-0 border-none bg-transparent text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-foreground pr-1">
                    اسم المستخدم <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex items-center h-14 pr-4 border rounded-full bg-background focus-within:ring-2 focus-within:ring-foreground/10 transition-all ${
                    formData.username && !checking
                      ? available
                        ? 'border-emerald-500 focus-within:border-emerald-500'
                        : 'border-red-500 focus-within:border-red-500'
                      : 'border-border focus-within:border-foreground/30'
                  }`}>
                    <span className="text-muted-foreground/70 text-sm flex-shrink-0">@</span>
                    <input
                      id="username"
                      type="text"
                      placeholder="mohamed_ahmed"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      disabled={loading}
                      required
                      className="h-full px-2 w-full outline-none focus:outline-none focus:ring-0 border-none bg-transparent text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      dir="ltr"
                    />
                    {formData.username && (
                      <div className="pl-4">
                        {checking ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : available ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {formData.username && !checking && !available && (
                    <p className="text-xs text-red-500 pr-1" role="alert">
                      {usernameError || 'اسم المستخدم غير متاح'}
                    </p>
                  )}
                  {formData.username && !checking && available && (
                    <p className="text-xs text-emerald-500 pr-1" role="status">اسم المستخدم متاح ✓</p>
                  )}
                  <p className="text-[11px] text-muted-foreground/60 pr-1">
                    يبدأ بحرف إنجليزي، ويحتوي على أحرف وأرقام وشرطة سفلية فقط
                  </p>
                </div>

                {/* Phone (Optional) */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground pr-1">
                    رقم الهاتف <span className="text-muted-foreground/60 text-xs">(اختياري)</span>
                  </label>
                  <div className="flex items-center h-14 pr-4 border border-border rounded-full bg-background focus-within:ring-2 focus-within:ring-foreground/10 focus-within:border-foreground/30 transition-all">
                    <Phone className="h-5 w-5 text-muted-foreground/70 flex-shrink-0" />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+964 770 123 4567"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={loading}
                      className="h-full px-3 w-full outline-none focus:outline-none focus:ring-0 border-none bg-transparent text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 pr-1">
                    سيُستخدم للتواصل معك وإشعارات المتجر
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Store Creation */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <span className="inline-flex items-center gap-2 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium px-4 py-1.5 rounded-full mb-5">
                    <Store className="h-3.5 w-3.5" />
                    إعدادات المتجر
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground mb-2">
                    أخبرنا عن متجرك
                  </h1>
                  <p className="text-sm text-muted-foreground/80">
                    سيتم إنشاء متجرك تلقائياً باسم <span className="font-medium text-foreground">@{formData.username || 'username'}</span>
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Category Selection - Grid with Icons */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground pr-1">
                      تصنيف المتجر <span className="text-red-500">*</span>
                    </label>
                    {/* More categories dropdown */}
                    <Select
                      value={storeData.category}
                      setValue={(value) => handleStoreChange('category', value as string)}
                      placeholder="المزيد من التصنيفات..."
                    >
                      {storeCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <SelectOption key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {cat.label}
                            </span>
                          </SelectOption>
                        );
                      })}
                    </Select>
                    {storeData.category && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 pr-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        تم اختيار: {storeCategories.find(c => c.id === storeData.category)?.label}
                      </motion.div>
                    )}
                  </div>

                  {/* Employees Count - Horizontal pills */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground pr-1">
                      حجم النشاط <span className="text-muted-foreground/60 text-xs">(اختياري)</span>
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
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-xs font-medium ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                            }`}
                          >
                            <span>{option.emoji}</span>
                            <span>{option.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Store Description */}
                  <div className="space-y-2">
                    <label htmlFor="storeDescription" className="block text-sm font-medium text-foreground pr-1">
                      وصف المتجر <span className="text-muted-foreground/60 text-xs">(اختياري)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-4 right-4">
                        <FileText className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                      <textarea
                        id="storeDescription"
                        placeholder="صِف متجرك ونشاطك التجاري في بضع كلمات... مثال: متجر متخصص في بيع الملابس الرجالية العصرية بأسعار مناسبة"
                        value={storeData.storeDescription}
                        onChange={(e) => handleStoreChange('storeDescription', e.target.value)}
                        disabled={loading}
                        rows={3}
                        maxLength={500}
                        className="w-full p-4 pr-12 border border-border rounded-2xl bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm resize-none"
                      />
                      {/* Character counter */}
                      <div className="absolute bottom-3 left-3">
                        <span className={`text-[10px] ${storeData.storeDescription.length > 450 ? 'text-amber-500' : 'text-muted-foreground/50'}`}>
                          {storeData.storeDescription.length}/500
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Steps During Creation */}
          <AnimatePresence>
            {progressStep !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20"
              >
                <div className="space-y-3">
                  {/* Creating Account Step */}
                  <div className="flex items-center gap-3">
                    {progressStep === 'creating-account' ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (progressStep === 'creating-store' || progressStep === 'done') ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted" />
                    )}
                    <span className={`text-sm font-medium ${
                      progressStep === 'creating-account' ? 'text-primary' : 
                      (progressStep === 'creating-store' || progressStep === 'done') ? 'text-emerald-600 dark:text-emerald-400' : 
                      'text-muted-foreground'
                    }`}>
                      {progressStep === 'creating-account' ? 'جاري إنشاء حسابك...' : 
                       (progressStep === 'creating-store' || progressStep === 'done') ? 'تم إنشاء الحساب ✓' : 'إنشاء الحساب'}
                    </span>
                  </div>

                  {/* Creating Store Step */}
                  <div className="flex items-center gap-3">
                      {progressStep === 'creating-store' ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : progressStep === 'done' ? (
                        storeCreationError ? (
                          <XCircle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                      )}
                      <span className={`text-sm font-medium ${
                        progressStep === 'creating-store' ? 'text-primary' : 
                        progressStep === 'done' && !storeCreationError ? 'text-emerald-600 dark:text-emerald-400' : 
                        progressStep === 'done' && storeCreationError ? 'text-amber-600 dark:text-amber-400' :
                        'text-muted-foreground'
                      }`}>
                        {progressStep === 'creating-store' ? 'جاري إنشاء متجرك...' : 
                         progressStep === 'done' && !storeCreationError ? 'تم إنشاء المتجر ✓' : 
                         progressStep === 'done' && storeCreationError ? 'فشل إنشاء المتجر (يمكنك المحاولة لاحقاً)' :
                         'إنشاء المتجر'}
                      </span>
                    </div>

                  {/* Done Step */}
                  {progressStep === 'done' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 pt-2"
                    >
                      <Sparkles className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        🎉 اكتمل! جاري تحويلك...
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-500 mt-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl" 
              role="alert" 
              aria-live="polite"
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{displayError}</span>
            </motion.div>
          )}

          {/* Progress Indicator */}
          <div className="mt-8">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              onBack={handleBack}
              onContinue={handleContinue}
              isLoading={loading}
              isBackVisible={currentStep > 1}
              disabled={loading || checking || !!rateLimitError}
              continueLabel="استمرار"
              backLabel="رجوع"
              finishLabel="إنشاء الحساب والمتجر"
            />
          </div>
        </form>

        {/* Footer */}
        <p className="text-[11px] text-muted-foreground/60 text-center mt-6">
          بإنشاء حسابك، أنت توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
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
