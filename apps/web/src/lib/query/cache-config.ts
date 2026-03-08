/**
 * ⚙️ React Query Cache Configuration
 * 
 * Standardized cache times by data type to ensure consistent
 * behavior across the application. Times are defined based on
 * how frequently data changes and how critical freshness is.
 * 
 * Guidelines:
 * - User-specific data: Shorter stale times (updates frequently)
 * - Reference data: Longer stale times (rarely changes)
 * - Real-time data: Very short or Infinity (always refetch)
 */

// ============================================
// Time Constants (in milliseconds)
// ============================================

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

// ============================================
// Cache Time Presets
// ============================================

/**
 * For data that changes very frequently (notifications, real-time stats)
 */
export const REALTIME_CACHE = {
  staleTime: 0, // Always consider stale
  gcTime: 1 * MINUTE,
} as const;

/**
 * For user-specific data that updates often (profile, settings, todos)
 */
export const USER_DATA_CACHE = {
  staleTime: 30 * SECOND,
  gcTime: 5 * MINUTE,
} as const;

/**
 * For list data that may change moderately (stores, events, forms)
 */
export const LIST_CACHE = {
  staleTime: 2 * MINUTE,
  gcTime: 10 * MINUTE,
} as const;

/**
 * For detail pages that don't change as frequently
 */
export const DETAIL_CACHE = {
  staleTime: 5 * MINUTE,
  gcTime: 15 * MINUTE,
} as const;

/**
 * For reference data that rarely changes (categories, types)
 */
export const REFERENCE_CACHE = {
  staleTime: 30 * MINUTE,
  gcTime: 1 * HOUR,
} as const;

/**
 * For static data that almost never changes (countries, languages)
 */
export const STATIC_CACHE = {
  staleTime: 1 * HOUR,
  gcTime: 24 * HOUR,
} as const;

// ============================================
// Domain-Specific Cache Configurations
// ============================================

/**
 * 👤 User & Auth Cache Config
 */
export const userCacheConfig = {
  profile: USER_DATA_CACHE,
  settings: USER_DATA_CACHE,
  security: USER_DATA_CACHE,
  sessions: REALTIME_CACHE,
  socialLinks: LIST_CACHE,
  storage: USER_DATA_CACHE,
} as const;

/**
 * 🔐 Auth Cache Config
 */
export const authCacheConfig = {
  session: {
    staleTime: 0, // Always check auth status
    gcTime: 5 * MINUTE,
  },
  user: USER_DATA_CACHE,
  permissions: DETAIL_CACHE,
} as const;

/**
 * 🏪 Store Cache Config
 */
export const storeCacheConfig = {
  list: LIST_CACHE,
  detail: DETAIL_CACHE,
  myStore: USER_DATA_CACHE,
  stats: {
    staleTime: 1 * MINUTE,
    gcTime: 5 * MINUTE,
  },
  analytics: {
    staleTime: 5 * MINUTE,
    gcTime: 15 * MINUTE,
  },
} as const;

/**
 * 📦 Product Cache Config
 */
export const productCacheConfig = {
  list: LIST_CACHE,
  detail: DETAIL_CACHE,
  featured: {
    staleTime: 5 * MINUTE,
    gcTime: 15 * MINUTE,
  },
  categories: REFERENCE_CACHE,
  templates: REFERENCE_CACHE,
} as const;

/**
 * 📅 Event Cache Config
 */
export const eventCacheConfig = {
  list: LIST_CACHE,
  detail: DETAIL_CACHE,
  myEvents: USER_DATA_CACHE,
  registrations: {
    staleTime: 30 * SECOND,
    gcTime: 5 * MINUTE,
  },
  myRegistrations: USER_DATA_CACHE,
  stats: {
    staleTime: 1 * MINUTE,
    gcTime: 5 * MINUTE,
  },
  categories: REFERENCE_CACHE,
  upcoming: LIST_CACHE,
  featured: LIST_CACHE,
  tickets: USER_DATA_CACHE,
  ticketTypes: DETAIL_CACHE,
} as const;

/**
 * 📝 Form Cache Config
 */
export const formCacheConfig = {
  list: LIST_CACHE,
  detail: DETAIL_CACHE,
  myForms: USER_DATA_CACHE,
  submissions: {
    staleTime: 30 * SECOND,
    gcTime: 5 * MINUTE,
  },
  submissionStats: {
    staleTime: 1 * MINUTE,
    gcTime: 5 * MINUTE,
  },
  analytics: {
    staleTime: 5 * MINUTE,
    gcTime: 15 * MINUTE,
  },
} as const;

/**
 * ✅ Todo Cache Config
 */
export const todoCacheConfig = {
  list: {
    staleTime: 15 * SECOND, // Todos change frequently
    gcTime: 5 * MINUTE,
  },
  detail: USER_DATA_CACHE,
  stats: {
    staleTime: 15 * SECOND,
    gcTime: 5 * MINUTE,
  },
  today: {
    staleTime: 15 * SECOND,
    gcTime: 5 * MINUTE,
  },
} as const;

/**
 * 🔔 Notification Cache Config
 */
export const notificationCacheConfig = {
  list: REALTIME_CACHE, // Always check for new notifications
  unreadCount: REALTIME_CACHE,
  preferences: USER_DATA_CACHE,
} as const;

/**
 * 📊 Dashboard Cache Config
 */
export const dashboardCacheConfig = {
  stats: {
    staleTime: 1 * MINUTE,
    gcTime: 5 * MINUTE,
  },
  overview: {
    staleTime: 2 * MINUTE,
    gcTime: 10 * MINUTE,
  },
  activity: {
    staleTime: 30 * SECOND,
    gcTime: 5 * MINUTE,
  },
  charts: {
    staleTime: 5 * MINUTE,
    gcTime: 15 * MINUTE,
  },
} as const;

// ============================================
// Combined Export
// ============================================

export const cacheConfig = {
  // Presets
  presets: {
    realtime: REALTIME_CACHE,
    userData: USER_DATA_CACHE,
    list: LIST_CACHE,
    detail: DETAIL_CACHE,
    reference: REFERENCE_CACHE,
    static: STATIC_CACHE,
  },
  // Domain-specific
  user: userCacheConfig,
  auth: authCacheConfig,
  store: storeCacheConfig,
  product: productCacheConfig,
  event: eventCacheConfig,
  form: formCacheConfig,
  todo: todoCacheConfig,
  notification: notificationCacheConfig,
  dashboard: dashboardCacheConfig,
} as const;

// ============================================
// Helper Types
// ============================================

export type CacheTime = {
  staleTime: number;
  gcTime: number;
};

export type CachePreset = keyof typeof cacheConfig.presets;
