/**
 * Design System - Centralized styles for consistent UI
 */

// Card styles
export const cardStyles = {
  default: 'bg-white rounded-2xl border border-gray-100 shadow-sm',
  elevated: 'bg-white rounded-2xl border border-gray-100 shadow-md',
  interactive: 'bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow',
  ghost: 'bg-transparent rounded-2xl',
};

// Text styles
export const textStyles = {
  h1: 'text-2xl sm:text-3xl font-bold text-gray-900',
  h2: 'text-xl sm:text-2xl font-bold text-gray-900',
  h3: 'text-lg sm:text-xl font-semibold text-gray-900',
  h4: 'text-base sm:text-lg font-semibold text-gray-900',
  body: 'text-sm sm:text-base text-gray-700',
  small: 'text-xs sm:text-sm text-gray-500',
  tiny: 'text-[10px] sm:text-xs text-gray-400',
};

// Icon container styles
export const iconStyles = {
  circle: (color: 'navy' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'gray' = 'navy') => {
    const colors = {
      navy: 'bg-navy-100 text-navy-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      amber: 'bg-amber-100 text-amber-600',
      rose: 'bg-rose-100 text-rose-600',
      gray: 'bg-gray-100 text-gray-600',
    };
    return `w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${colors[color] || colors.navy}`;
  },
  small: (color: 'navy' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'gray' = 'gray') => {
    const colors = {
      navy: 'bg-navy-50 text-navy-500',
      indigo: 'bg-indigo-50 text-indigo-500',
      emerald: 'bg-emerald-50 text-emerald-500',
      amber: 'bg-amber-50 text-amber-500',
      rose: 'bg-rose-50 text-rose-500',
      gray: 'bg-gray-50 text-gray-500',
    };
    return `w-8 h-8 rounded-lg flex items-center justify-center ${colors[color] || colors.gray}`;
  },
};

// Button styles
export const buttonStyles = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors',
  outline: 'border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors',
  ghost: 'hover:bg-gray-100 text-gray-600 transition-colors',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors',
};

// Badge styles
export const badgeStyles = {
  default: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
  colors: {
    gray: 'bg-gray-100 text-gray-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  },
};

// Input styles
export const inputStyles = {
  default: 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-800 placeholder:text-gray-400',
  error: 'w-full px-4 py-2.5 rounded-xl border border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all text-gray-800',
};

// Animation presets
export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
};

// Spacing utilities
export const spacing = {
  section: 'mb-6 sm:mb-8',
  card: 'p-4 sm:p-6',
  compact: 'p-3 sm:p-4',
};

// ============================================
// 🎨 Enhanced Design System - التحديثات الجديدة
// ============================================

// Enhanced Shadow System - نظام الظلال المحسّن
export const enhancedShadows = {
  sm: 'shadow-sm hover:shadow transition-all duration-200',
  md: 'shadow-md hover:shadow-lg transition-all duration-300',
  lg: 'shadow-lg hover:shadow-xl transition-all duration-300',
  xl: 'shadow-xl hover:shadow-2xl transition-all duration-300',
  '2xl': 'shadow-2xl',
  colored: {
    primary: 'shadow-lg shadow-primary/10 dark:shadow-primary/20',
    success: 'shadow-lg shadow-green-500/10 dark:shadow-green-500/20',
    warning: 'shadow-lg shadow-amber-500/10 dark:shadow-amber-500/20',
    danger: 'shadow-lg shadow-red-500/10 dark:shadow-red-500/20',
  },
  dark: {
    sm: 'dark:shadow-black/20',
    md: 'dark:shadow-black/30',
    lg: 'dark:shadow-black/40',
    xl: 'dark:shadow-black/50',
  }
} as const;

// Enhanced Button Styles - أزرار محسّنة
export const enhancedButtons = {
  primary: 'bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95',
  secondary: 'bg-muted text-foreground hover:bg-muted/80 transition-all duration-200 hover:scale-105 active:scale-95',
  outline: 'border border-border bg-transparent hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow',
  ghost: 'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95',
  destructive: 'bg-destructive text-destructive-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95',
  success: 'bg-green-600 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95',
  icon: 'w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95',
} as const;

// Enhanced Input Styles - حقول محسّنة
export const enhancedInputs = {
  base: 'w-full min-h-[48px] px-4 transition-all duration-200 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:scale-[1.01]',
  outlined: 'border bg-transparent rounded-2xl hover:border-primary/40 focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:shadow-sm focus-visible:shadow-md',
  filled: 'border-0 bg-muted/50 rounded-2xl focus-visible:ring-primary/20 hover:shadow-sm focus-visible:shadow-md',
  underlined: 'border-0 border-b-2 rounded-none bg-transparent hover:border-primary/40 focus-visible:border-primary',
  error: 'border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/20 shadow-sm shadow-destructive/5',
} as const;

// Enhanced Card Styles - بطاقات محسّنة
export const enhancedCards = {
  default: 'bg-card rounded-4xl border border-border/60 p-5 shadow-md hover:shadow-lg transition-all duration-300',
  elevated: 'bg-card rounded-4xl border border-border/60 p-5 shadow-lg hover:shadow-xl transition-all duration-300',
  interactive: 'bg-card rounded-4xl border border-border/60 p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer',
  glass: 'bg-card/95 backdrop-blur-xl rounded-4xl border border-border/60 p-5 shadow-2xl',
  gradient: 'bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-4xl p-5 shadow-md',
} as const;

// Enhanced Modal/Dialog Styles - مودالات محسّنة
export const enhancedModals = {
  backdrop: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm',
  content: 'bg-card rounded-3xl p-6 border border-border/60 shadow-2xl',
  header: 'flex items-center justify-between mb-4',
  title: 'font-semibold text-foreground text-lg',
  close: 'p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-95',
} as const;

// Enhanced Animation Presets - حركات محسّنة
export const enhancedAnimations = {
  modal: {
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    content: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
  },
  card: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  stagger: {
    container: {
      animate: { transition: { staggerChildren: 0.1 } },
    },
    item: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
  },
  success: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { delay: 0.2, type: 'spring', damping: 15, stiffness: 200 },
  },
  loading: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },
} as const;

// Interactive States - حالات تفاعلية
export const interactiveStates = {
  hover: 'hover:scale-105 active:scale-95 transition-transform duration-200',
  focus: 'focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
  loading: 'relative cursor-wait',
} as const;

// Social Media Colors - ألوان وسائل التواصل
export const socialColors = {
  whatsapp: {
    bg: 'bg-[#25D366]',
    hover: 'hover:bg-[#20BD5D]',
    text: 'text-white',
    shadow: 'shadow-md group-hover:shadow-lg',
  },
  twitter: {
    bg: 'bg-black',
    hover: 'hover:bg-gray-900',
    text: 'text-white',
    shadow: 'shadow-md group-hover:shadow-lg',
  },
  telegram: {
    bg: 'bg-[#0088cc]',
    hover: 'hover:bg-[#0077b5]',
    text: 'text-white',
    shadow: 'shadow-md group-hover:shadow-lg',
  },
  email: {
    bg: 'bg-muted-foreground',
    hover: 'hover:bg-muted-foreground/80',
    text: 'text-background',
    shadow: 'shadow-md group-hover:shadow-lg',
  },
} as const;

// Progress Indicator Styles - مؤشرات التقدم
export const progressStyles = {
  bar: 'flex-1 h-1.5 rounded-full transition-all duration-300',
  active: 'bg-primary shadow-sm',
  inactive: 'bg-muted',
  container: 'flex gap-1.5',
} as const;

// Toast/Notification Styles - إشعارات
export const toastStyles = {
  success: 'bg-success/10 border-success/20 text-success rounded-2xl p-4 shadow-lg',
  error: 'bg-destructive/10 border-destructive/20 text-destructive rounded-2xl p-4 shadow-lg',
  warning: 'bg-warning/10 border-warning/20 text-warning rounded-2xl p-4 shadow-lg',
  info: 'bg-primary/10 border-primary/20 text-primary rounded-2xl p-4 shadow-lg',
} as const;

// Accessibility Helpers - مساعدات إمكانية الوصول
export const a11y = {
  srOnly: 'sr-only',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0',
  minTouchTarget: 'min-h-[44px] min-w-[44px]',
  highContrast: 'contrast-more:border-current',
} as const;
