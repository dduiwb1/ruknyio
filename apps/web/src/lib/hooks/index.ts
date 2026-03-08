/**
 * 🪝 Hooks Index
 */

export { useAuth, useUser, useIsAuthenticated } from './use-auth';
export { 
  useApiQuery, 
  useApiMutation, 
  useApiPost, 
  useApiPut, 
  useApiPatch, 
  useApiDelete 
} from './use-api';
export { usePerformance } from './use-performance';

// Network & Prefetch
export { 
  useNetwork, 
  useAdaptiveImageQuality, 
  useShouldLoadHeavyContent,
  usePrefetchStrategy,
  type NetworkStatus,
} from './use-network';
export {
  usePrefetchRoute,
  usePrefetchQuery,
  usePrefetchOnVisible,
  usePrefetchDashboard,
} from './use-prefetch';
