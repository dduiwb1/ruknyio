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
