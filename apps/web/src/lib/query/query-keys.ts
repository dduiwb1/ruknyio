/**
 * 🔑 Centralized Query Keys for React Query
 * 
 * This file provides a consistent, type-safe way to manage query keys
 * across the application. Using a factory pattern ensures:
 * - Consistent key structure across all queries
 * - Type safety with TypeScript
 * - Easy invalidation of related queries
 * - Hierarchical cache invalidation
 * 
 * @example
 * // Use in hooks
 * useQuery({ queryKey: queryKeys.users.detail(userId) })
 * 
 * // Invalidate related queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
 */

// ============================================
// Query Key Factories
// ============================================

/**
 * 👤 User & Profile Query Keys
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  settings: () => [...userKeys.all, 'settings'] as const,
  security: () => [...userKeys.all, 'security'] as const,
  sessions: () => [...userKeys.all, 'sessions'] as const,
  socialLinks: () => [...userKeys.all, 'social-links'] as const,
  storage: () => [...userKeys.all, 'storage'] as const,
};

/**
 * 🔐 Auth Query Keys
 */
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  permissions: () => [...authKeys.all, 'permissions'] as const,
};

/**
 * 🏪 Store Query Keys
 */
export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (filters?: { userId?: string; status?: string; search?: string }) => 
    [...storeKeys.lists(), filters] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
  bySlug: (slug: string) => [...storeKeys.all, 'slug', slug] as const,
  myStore: () => [...storeKeys.all, 'my-store'] as const,
  stats: (storeId: string) => [...storeKeys.all, 'stats', storeId] as const,
  analytics: (storeId: string, period?: string) => 
    [...storeKeys.all, 'analytics', storeId, period] as const,
};

/**
 * 📦 Product Query Keys
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: { 
    storeId?: string; 
    categoryId?: string; 
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  bySlug: (storeSlug: string, productSlug: string) => 
    [...productKeys.all, 'slug', storeSlug, productSlug] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  templates: () => [...productKeys.all, 'templates'] as const,
};

/**
 * 📅 Event Query Keys
 */
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: {
    status?: string;
    type?: string;
    organizerId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  bySlug: (slug: string) => [...eventKeys.all, 'slug', slug] as const,
  myEvents: () => [...eventKeys.all, 'my-events'] as const,
  registrations: (eventId: string) => [...eventKeys.all, 'registrations', eventId] as const,
  myRegistrations: () => [...eventKeys.all, 'my-registrations'] as const,
  stats: (eventId: string) => [...eventKeys.all, 'stats', eventId] as const,
  categories: () => [...eventKeys.all, 'categories'] as const,
  upcoming: () => [...eventKeys.all, 'upcoming'] as const,
  featured: () => [...eventKeys.all, 'featured'] as const,
  // Tickets
  tickets: (eventId: string) => [...eventKeys.all, 'tickets', eventId] as const,
  ticketTypes: (eventId: string) => [...eventKeys.all, 'ticket-types', eventId] as const,
  // Organizers & Sponsors
  organizers: (eventId: string) => [...eventKeys.all, 'organizers', eventId] as const,
  sponsors: (eventId: string) => [...eventKeys.all, 'sponsors', eventId] as const,
};

/**
 * 📝 Form Query Keys
 */
export const formKeys = {
  all: ['forms'] as const,
  lists: () => [...formKeys.all, 'list'] as const,
  list: (filters?: {
    userId?: string;
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => [...formKeys.lists(), filters] as const,
  details: () => [...formKeys.all, 'detail'] as const,
  detail: (id: string) => [...formKeys.details(), id] as const,
  bySlug: (slug: string) => [...formKeys.all, 'slug', slug] as const,
  myForms: () => [...formKeys.all, 'my-forms'] as const,
  // Form submissions
  submissions: (formId: string) => [...formKeys.all, 'submissions', formId] as const,
  submission: (formId: string, submissionId: string) => 
    [...formKeys.submissions(formId), submissionId] as const,
  submissionStats: (formId: string) => [...formKeys.all, 'submission-stats', formId] as const,
  // Form analytics
  analytics: (formId: string, period?: string) => 
    [...formKeys.all, 'analytics', formId, period] as const,
  // Form fields & steps
  fields: (formId: string) => [...formKeys.all, 'fields', formId] as const,
  steps: (formId: string) => [...formKeys.all, 'steps', formId] as const,
};

/**
 * ✅ Todo Query Keys (migrated from useTodos.ts)
 */
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...todoKeys.lists(), params] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
  stats: () => [...todoKeys.all, 'stats'] as const,
  today: () => [...todoKeys.all, 'today'] as const,
  overdue: () => [...todoKeys.all, 'overdue'] as const,
  highPriority: () => [...todoKeys.all, 'high-priority'] as const,
  upcoming: () => [...todoKeys.all, 'upcoming'] as const,
  trash: () => [...todoKeys.all, 'trash'] as const,
  timeline: (id: string) => [...todoKeys.all, 'timeline', id] as const,
  activities: () => [...todoKeys.all, 'activities'] as const,
};

/**
 * 📋 Todo List Query Keys
 */
export const todoListKeys = {
  all: ['todo-lists'] as const,
  lists: () => [...todoListKeys.all, 'list'] as const,
  detail: (id: string) => [...todoListKeys.all, 'detail', id] as const,
};

/**
 * 🔔 Notification Query Keys
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: { read?: boolean; type?: string }) => 
    [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

/**
 * 📊 Dashboard & Analytics Query Keys
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  overview: (period?: string) => [...dashboardKeys.all, 'overview', period] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  charts: (type: string, period?: string) => 
    [...dashboardKeys.all, 'charts', type, period] as const,
};

/**
 * 🔗 Social Links Query Keys
 */
export const socialLinkKeys = {
  all: ['social-links'] as const,
  lists: () => [...socialLinkKeys.all, 'list'] as const,
  detail: (id: string) => [...socialLinkKeys.all, 'detail', id] as const,
  analytics: () => [...socialLinkKeys.all, 'analytics'] as const,
};

/**
 * 💳 Payment & Subscription Query Keys
 */
export const paymentKeys = {
  all: ['payments'] as const,
  history: () => [...paymentKeys.all, 'history'] as const,
  subscription: () => [...paymentKeys.all, 'subscription'] as const,
  plans: () => [...paymentKeys.all, 'plans'] as const,
  invoices: () => [...paymentKeys.all, 'invoices'] as const,
};

// ============================================
// Combined Export for Easy Access
// ============================================

export const queryKeys = {
  users: userKeys,
  auth: authKeys,
  stores: storeKeys,
  products: productKeys,
  events: eventKeys,
  forms: formKeys,
  todos: todoKeys,
  todoLists: todoListKeys,
  notifications: notificationKeys,
  dashboard: dashboardKeys,
  socialLinks: socialLinkKeys,
  payments: paymentKeys,
} as const;

// ============================================
// Helper Types
// ============================================

export type QueryKeyFactory = typeof queryKeys;
export type QueryKeyDomain = keyof QueryKeyFactory;
