'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { completeProfile, checkUsername } from '@/actions/profile';
import { STORE_CATEGORIES } from '@/lib/definitions';
import { COUNTRIES, getRegionsForCountry, getRegionLabel } from '@/lib/countries';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  AtSign,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Grid3X3,
  Globe,
  AlertTriangle,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

/* ── Sanitization helpers ─────────────────────────────── */

const sanitizeName = (text: string): string =>
  text.replace(/[<>{}[\]\\]/g, '').replace(/\s{2,}/g, ' ').slice(0, 50);

const sanitizeUsername = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);

const sanitizeDescription = (text: string): string =>
  text.replace(/[<>{}[\]\\]/g, '').slice(0, 500);

/* ── Employee options with emojis ─────────────────────── */

const EMPLOYEE_OPTIONS = [
  { value: 'solo', label: 'أعمل بمفردي', emoji: '👤' },
  { value: '2-5', label: '2 - 5 موظفين', emoji: '👥' },
  { value: '6-10', label: '6 - 10 موظفين', emoji: '👨‍👩‍👧‍👦' },
  { value: '11-50', label: '11 - 50 موظف', emoji: '🏢' },
  { value: '50+', label: 'أكثر من 50 موظف', emoji: '🏙️' },
] as const;

/* ── Helpers ──────────────────────────────────────────── */

function findLabel(
  value: string,
  options: readonly { value: string; label: string }[],
): string | undefined {
  if (!value) return undefined;
  return options.find((o) => o.value === value)?.label;
}

/* ── PillSelect — pill-shaped Select trigger ─────────── */

function PillSelect({
  icon: Icon,
  placeholder,
  value,
  onChange,
  options,
}: {
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={(v) => { if (v) onChange(v); }}>
      <SelectTrigger
        className="flex items-center py-6 gap-2 h-11 w-full px-3 border-2 border-slate-300
                   rounded-full bg-white text-sm
                   focus:border-indigo-500 focus:ring-indigo-400/50
                   transition-all duration-200 cursor-pointer
                   data-placeholder:text-slate-400"
      >
        <Icon className="size-[18px] text-slate-400 shrink-0" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className="rounded-xl"
      >
        <SelectGroup>
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="py-2.5 px-3 rounded-lg cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

/* ── Progress steps overlay (shown during submission) ── */

/* ── PillAutocomplete — search input + horizontal pill options ── */

function PillAutocomplete({
  icon: Icon,
  placeholder,
  value,
  onChange,
  options,
}: {
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  const [query, setQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* Filter options */
  const filtered = useMemo(() => {
    if (!query) return [...options];
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, options]);

  /* Check scroll overflow */
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // RTL: scrollLeft is negative in RTL
    const scrollLeft = Math.abs(el.scrollLeft);
    setCanScrollRight(scrollLeft > 0);
    setCanScrollLeft(scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, filtered.length]);

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    // RTL: left means increasing scrollLeft (more negative), right means decreasing
    const amount = dir === 'left' ? -160 : 160;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  return (
    <div className="space-y-2.5">
      {/* Search input */}
      <div className="flex items-center h-11 px-3 border-2 border-slate-200 rounded-full bg-slate-50/80 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-400/30 transition-all duration-200">
        <Search className="size-[18px] text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          className="h-full px-2.5 w-full outline-none bg-transparent text-slate-800 placeholder:text-slate-400 text-sm"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="shrink-0 p-1 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="size-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Horizontal scrollable pills */}
      <div className="relative">
        {/* Left arrow (RTL: appears on right visually) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-7 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="size-4 text-slate-600" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filtered.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(isSelected ? '' : opt.value)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          {filtered.length === 0 && query && (
            <span className="text-xs text-slate-400 py-2 px-1">
              لا توجد نتائج لـ &quot;{query}&quot;
            </span>
          )}
        </div>

        {/* Right arrow (RTL: appears on left visually) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-7 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="size-4 text-slate-600" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Progress steps overlay (shown during submission) ── */

function ProgressSteps({ isPending }: { isPending: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isPending) {
      setStep(0);
      return;
    }
    setStep(1);
    const t = setTimeout(() => setStep(2), 1200);
    return () => clearTimeout(t);
  }, [isPending]);

  if (!isPending || step === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="mt-6 p-4 bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl"
    >
      <div className="space-y-2.5">
        {/* Creating account */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {step === 1 ? (
            <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          )}
          <span
            className={`text-sm font-semibold ${
              step === 1 ? 'text-indigo-600' : 'text-slate-800'
            }`}
          >
            {step === 1 ? 'جاري إنشاء الحساب...' : '✓ تم إنشاء الحساب'}
          </span>
        </motion.div>

        {/* Creating store */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          {step < 2 ? (
            <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          ) : (
            <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
          )}
          <span
            className={`text-sm font-semibold ${
              step === 2 ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            {step === 2 ? 'جاري إنشاء المتجر...' : 'سيتم إنشاء المتجر'}
          </span>
        </motion.div>

        {/* Redirecting shimmer (appears late) */}
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 pt-3 mt-3 border-t border-indigo-100"
          >
            <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-emerald-600">
              جاري التحويل...
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
 * CompleteProfileForm
 * ───────────────────────────────────────────────────────── */
export function CompleteProfileForm() {
  const searchParams = useSearchParams();
  const quickSignToken = searchParams.get('token') ?? '';

  /* bound action — bake quickSignToken into the server action */
  const boundAction = completeProfile.bind(null, quickSignToken);
  const [state, formAction, isPending] = useActionState(boundAction, undefined);

  /* ── Step management ─────────────────────────────────── */
  const [currentStep, setCurrentStep] = useState(1);

  /* ── Controlled state ────────────────────────────────── */
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [employeesCount, setEmployeesCount] = useState('');
  const [storeCountry, setStoreCountry] = useState('IQ');
  const [storeCity, setStoreCity] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  /* ── Local validation error ──────────────────────────── */
  const [localError, setLocalError] = useState<string | null>(null);

  /* ── Username availability ───────────────────────────── */
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  const debouncedCheckUsername = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (value: string) => {
        clearTimeout(timer);
        if (!value || value.length < 3) {
          setUsernameStatus('idle');
          return;
        }
        setUsernameStatus('checking');
        timer = setTimeout(async () => {
          const result = await checkUsername(value);
          setUsernameStatus(result.available ? 'available' : 'taken');
        }, 500);
      };
    })(),
    [],
  );

  useEffect(() => {
    if (username) debouncedCheckUsername(username);
  }, [username, debouncedCheckUsername]);

  /* ── IME composition support (Arabic input) ──────────── */
  const isComposing = useRef(false);

  /* ── Regions derived from country ────────────────────── */
  const regions = useMemo(
    () => getRegionsForCountry(storeCountry),
    [storeCountry],
  );
  const regionLabelText = useMemo(
    () => getRegionLabel(storeCountry),
    [storeCountry],
  );

  /* Reset city when country changes */
  useEffect(() => {
    setStoreCity('');
  }, [storeCountry]);

  const countryOptions = useMemo(
    () => COUNTRIES.map((c) => ({ value: c.value, label: c.label })),
    [],
  );

  /* ── Step validation ─────────────────────────────────── */
  const validateStep1 = useCallback((): boolean => {
    const n = name.trim();
    const u = username.trim();
    if (!n) {
      setLocalError('الرجاء إدخال اسمك');
      return false;
    }
    if (n.length < 2) {
      setLocalError('الاسم يجب أن يكون حرفين على الأقل');
      return false;
    }
    if (!u) {
      setLocalError('الرجاء إدخال اسم المستخدم');
      return false;
    }
    if (u.length < 3) {
      setLocalError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      return false;
    }
    if (!/^[a-z][a-z0-9_]*$/.test(u)) {
      setLocalError(
        'اسم المستخدم يجب أن يبدأ بحرف ويحتوي على أحرف وأرقام وشرطة سفلية فقط',
      );
      return false;
    }
    if (usernameStatus === 'taken') {
      setLocalError('اسم المستخدم غير متاح، جرب اسماً آخر');
      return false;
    }
    return true;
  }, [name, username, usernameStatus]);

  const handleNext = useCallback(() => {
    setLocalError(null);
    if (!validateStep1()) return;
    setCurrentStep(2);
  }, [validateStep1]);

  const handleBack = useCallback(() => {
    setLocalError(null);
    setCurrentStep(1);
  }, []);

  const displayError =
    localError || (state?.message && !state?.success ? state.message : null);

  /* ───────────────────────── JSX ─────────────────────── */

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center w-full"
    >
      <form action={formAction} className="w-full">
        {/* Hidden inputs so FormData picks everything up */}
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="username" value={username} />
        <input type="hidden" name="storeCategory" value={storeCategory} />
        <input type="hidden" name="employeesCount" value={employeesCount} />
        <input type="hidden" name="storeCountry" value={storeCountry} />
        <input type="hidden" name="storeCity" value={storeCity} />
        <input type="hidden" name="storeDescription" value={storeDescription} />

        <AnimatePresence mode="wait">
          {/* ── Step 1 ─ Profile Information ──────────── */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 text-xs bg-indigo-100 text-indigo-600 font-semibold px-3 py-1.5 rounded-full mb-4"
                >
                  إكمال الملف الشخصي
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2"
                >
                  دعنا نكمل إعدادك
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-slate-500 max-w-sm mx-auto"
                >
                  أكمل بيانات ملفك الشخصي في خطوات بسيطة
                </motion.p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name-input"
                  className="block text-sm font-medium text-slate-800"
                >
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center h-11 px-3 border-2 border-slate-300 rounded-full bg-white focus-within:ring-2 focus-within:ring-indigo-400/50 focus-within:border-indigo-500 transition-all duration-200">
                  <User className="h-[18px] w-[18px] text-slate-400 shrink-0" />
                  <input
                    id="name-input"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={name}
                    onChange={(e) => {
                      if (isComposing.current) {
                        setName(e.target.value);
                      } else {
                        setName(sanitizeName(e.target.value));
                      }
                      setLocalError(null);
                    }}
                    onCompositionStart={() => (isComposing.current = true)}
                    onCompositionEnd={(e) => {
                      isComposing.current = false;
                      setName(
                        sanitizeName(
                          (e.target as HTMLInputElement).value,
                        ),
                      );
                    }}
                    disabled={isPending}
                    required
                    className="h-full px-2.5 w-full outline-none bg-transparent text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  />
                </div>
                {state?.errors?.name && (
                  <p className="text-xs text-red-500 font-medium">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label
                  htmlFor="username-input"
                  className="block text-sm font-medium text-slate-800"
                >
                  اسم المستخدم <span className="text-red-500">*</span>
                </label>
                <div
                  className={`flex items-center h-11 px-3 border-2 rounded-full bg-white focus-within:ring-2 transition-all duration-200 ${
                    username && usernameStatus !== 'checking'
                      ? usernameStatus === 'available'
                        ? 'border-emerald-500 focus-within:border-emerald-500 focus-within:ring-emerald-400/20'
                        : usernameStatus === 'taken'
                          ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-400/20'
                          : 'border-slate-300 focus-within:border-indigo-500 focus-within:ring-indigo-400/50'
                      : 'border-slate-300 focus-within:border-indigo-500 focus-within:ring-indigo-400/50'
                  }`}
                >
                  <AtSign className="h-[18px] w-[18px] text-slate-400 shrink-0" />
                  <input
                    id="username-input"
                    type="text"
                    dir="ltr"
                    lang="en"
                    autoComplete="username"
                    pattern="[a-zA-Z0-9._-]+"
                    placeholder="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(sanitizeUsername(e.target.value));
                      setLocalError(null);
                    }}
                    disabled={isPending}
                    required
                    className="h-full px-2.5 w-full outline-none bg-transparent text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-left font-mono"
                  />
                  {username && (
                    <div className="shrink-0">
                      {usernameStatus === 'checking' && (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      )}
                      {usernameStatus === 'available' && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      {usernameStatus === 'taken' && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Username status messages */}
                {username && usernameStatus === 'taken' && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs text-red-500 font-medium"
                    role="alert"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    اسم المستخدم غير متاح، جرب اسماً آخر
                  </motion.p>
                )}
                {username && usernameStatus === 'available' && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium"
                    role="status"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    اسم المستخدم متاح ✓
                  </motion.p>
                )}
                {state?.errors?.username && (
                  <p className="text-xs text-red-500 font-medium">
                    {state.errors.username[0]}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Step 2 ─ Store Information ────────────── */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-full mb-4"
                >
                  إعدادات المتجر
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2"
                >
                  أخبرنا عن متجرك
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-slate-500 max-w-sm mx-auto"
                >
                  سيتم إنشاء متجرك باسم{' '}
                  <span className="font-semibold text-slate-800">
                    @{username || 'username'}
                  </span>
                </motion.p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-800">
                  تصنيف المتجر <span className="text-red-500">*</span>
                </label>
                <PillSelect
                  icon={Grid3X3}
                  placeholder="📋 اختر تصنيف متجرك..."
                  value={storeCategory}
                  onChange={(v) => {
                    setStoreCategory(v);
                    setLocalError(null);
                  }}
                  options={STORE_CATEGORIES}
                />
                {storeCategory && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex py-4 items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-2 rounded-full"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {findLabel(storeCategory, STORE_CATEGORIES)}
                  </motion.div>
                )}
                {state?.errors?.storeCategory && (
                  <p className="text-xs text-red-500 font-medium">
                    {state.errors.storeCategory[0]}
                  </p>
                )}
              </div>

              {/* Employees Count — horizontal emoji pills */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-800">
                  حجم النشاط{' '}
                  <span className="text-xs font-normal text-slate-400">
                    (اختياري)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMPLOYEE_OPTIONS.map((option) => {
                    const isSelected = employeesCount === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setEmployeesCount(isSelected ? '' : option.value)
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full border-2 transition-all duration-200 text-xs font-medium ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-slate-300 hover:border-indigo-300 text-slate-700 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span className="text-base">{option.emoji}</span>
                        <span>{option.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Store Description */}
              <div className="space-y-2">
                <label
                  htmlFor="storeDescription-input"
                  className="block text-sm font-medium text-slate-800"
                >
                  وصف المتجر{' '}
                  <span className="text-xs font-normal text-slate-400">
                    (اختياري)
                  </span>
                </label>
                <textarea
                  id="storeDescription-input"
                  placeholder="اكتب نبذة مختصرة عن متجرك..."
                  value={storeDescription}
                  onChange={(e) =>
                    setStoreDescription(sanitizeDescription(e.target.value))
                  }
                  disabled={isPending}
                  rows={3}
                  maxLength={500}
                  className="w-full p-3 border-2 border-slate-300 rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-500 transition-all duration-200 outline-none disabled:opacity-50 resize-none text-sm"
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    اكتب وصفاً جذاباً لمتجرك
                  </span>
                  <span
                    className={`font-medium ${
                      storeDescription.length > 450
                        ? 'text-amber-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {storeDescription.length}/500
                  </span>
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-800">
                  الدولة
                </label>
                <PillAutocomplete
                  icon={Globe}
                  placeholder="ابحث عن الدولة..."
                  value={storeCountry}
                  onChange={setStoreCountry}
                  options={countryOptions}
                />
              </div>

              {/* Region / Governorate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-800">
                  {regionLabelText}
                </label>
                <PillAutocomplete
                  icon={MapPin}
                  placeholder={`ابحث عن ${regionLabelText}...`}
                  value={storeCity}
                  onChange={setStoreCity}
                  options={regions}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress steps during submission */}
        <AnimatePresence>
          {isPending && <ProgressSteps isPending={isPending} />}
        </AnimatePresence>

        {/* Error alert */}
        <AnimatePresence>
          {displayError && !isPending && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mt-5 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2.5"
              role="alert"
              aria-live="polite"
            >
              <AlertTriangle className="h-[18px] w-[18px] text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-700 mb-0.5">
                  تنبيه
                </p>
                <p className="text-xs text-red-600">{displayError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="mt-8">
          {currentStep === 1 ? (
            <motion.button
              type="button"
              onClick={handleNext}
              disabled={isPending || usernameStatus === 'checking'}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center justify-center gap-2 w-full h-12 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-full transition-all duration-300"
            >
              استمرار
              <ArrowLeft className="size-5" />
            </motion.button>
          ) : (
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={handleBack}
                disabled={isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-1.5 border-2 border-slate-300 text-slate-700 py-2.5 px-5 rounded-full hover:bg-slate-50 transition-all duration-200 font-medium disabled:opacity-50"
              >
                <ArrowRight className="size-4" />
                رجوع
              </motion.button>

              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={!isPending ? { scale: 1.01 } : undefined}
                whileTap={!isPending ? { scale: 0.99 } : undefined}
                className="flex-1 flex items-center justify-center gap-2 h-12 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-full transition-all duration-300"
              >
                {isPending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    إنشاء الحساب والمتجر
                    <ArrowLeft className="size-5" />
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </form>

      {/* Footer */}
      <p className="text-[11px] text-slate-400 text-center mt-6">
        بإنشاء حسابك، أنت توافق على{' '}
        <a href="/terms" className="text-indigo-600 hover:underline">
          شروط الاستخدام
        </a>{' '}
        و{' '}
        <a href="/privacy" className="text-indigo-600 hover:underline">
          سياسة الخصوصية
        </a>
      </p>

      {/* Step indicator — animated width */}
      <div className="flex justify-center gap-2 mt-5">
        <motion.div
          animate={{ width: currentStep === 1 ? 32 : 12 }}
          className={`h-1.5 rounded-full transition-colors ${
            currentStep === 1 ? 'bg-indigo-500' : 'bg-slate-200'
          }`}
        />
        <motion.div
          animate={{ width: currentStep === 2 ? 32 : 12 }}
          className={`h-1.5 rounded-full transition-colors ${
            currentStep === 2 ? 'bg-indigo-500' : 'bg-slate-200'
          }`}
        />
      </div>
    </motion.div>
  );
}
