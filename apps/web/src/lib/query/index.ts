/**
 * 🔄 React Query Configuration
 * 
 * Centralized exports for query keys and cache configuration.
 * 
 * @example
 * import { queryKeys, cacheConfig } from '@/lib/query';
 * 
 * useQuery({
 *   queryKey: queryKeys.users.detail(userId),
 *   ...cacheConfig.user.profile,
 * })
 */

export * from './query-keys';
export * from './cache-config';
