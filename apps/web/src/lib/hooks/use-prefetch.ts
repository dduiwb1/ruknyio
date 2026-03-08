'use client';

/**
 * 🚀 Prefetch Hook
 * 
 * Intelligently prefetches data and routes based on user behavior
 * and network conditions.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { usePrefetchStrategy } from './use-network';
import api from '@/lib/api/client';

interface PrefetchOptions {
  /** Delay before prefetching (ms) */
  delay?: number;
  /** Only prefetch on hover */
  onHover?: boolean;
  /** Only prefetch when in viewport */
  onVisible?: boolean;
}

/**
 * Hook to prefetch routes on hover/focus
 */
export function usePrefetchRoute(href: string, options: PrefetchOptions = {}) {
  const router = useRouter();
  const strategy = usePrefetchStrategy();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedRef = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetchedRef.current || strategy === 'none') return;

    const delay = options.delay ?? (strategy === 'aggressive' ? 0 : 100);

    timeoutRef.current = setTimeout(() => {
      router.prefetch(href);
      prefetchedRef.current = true;
    }, delay);
  }, [href, router, strategy, options.delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  // Auto-prefetch on aggressive strategy
  useEffect(() => {
    if (strategy === 'aggressive' && !options.onHover) {
      prefetch();
    }
  }, [strategy, options.onHover, prefetch]);

  return {
    onMouseEnter: options.onHover ? prefetch : undefined,
    onMouseLeave: options.onHover ? cancel : undefined,
    onFocus: options.onHover ? prefetch : undefined,
    onBlur: options.onHover ? cancel : undefined,
    prefetch,
    cancel,
  };
}

/**
 * Hook to prefetch API data
 */
export function usePrefetchQuery<T>(
  queryKey: string[],
  endpoint: string,
  options: PrefetchOptions = {}
) {
  const queryClient = useQueryClient();
  const strategy = usePrefetchStrategy();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedRef = useRef(false);

  const prefetch = useCallback(async () => {
    if (prefetchedRef.current || strategy === 'none') return;

    const delay = options.delay ?? (strategy === 'aggressive' ? 0 : 200);

    timeoutRef.current = setTimeout(async () => {
      try {
        await queryClient.prefetchQuery({
          queryKey,
          queryFn: async () => {
            const { data } = await api.get<T>(endpoint);
            return data;
          },
          staleTime: 2 * 60 * 1000, // 2 minutes
        });
        prefetchedRef.current = true;
      } catch {
        // Silently fail prefetch
      }
    }, delay);
  }, [queryClient, queryKey, endpoint, strategy, options.delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return {
    onMouseEnter: options.onHover ? prefetch : undefined,
    onMouseLeave: options.onHover ? cancel : undefined,
    prefetch,
    cancel,
  };
}

/**
 * Hook to prefetch when element becomes visible
 */
export function usePrefetchOnVisible(
  callback: () => void,
  options: { threshold?: number; rootMargin?: string } = {}
) {
  const elementRef = useRef<HTMLElement | null>(null);
  const prefetchedRef = useRef(false);
  const strategy = usePrefetchStrategy();

  useEffect(() => {
    if (!elementRef.current || strategy === 'none' || prefetchedRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !prefetchedRef.current) {
            callback();
            prefetchedRef.current = true;
            observer.disconnect();
          }
        });
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? '100px',
      }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [callback, strategy, options.threshold, options.rootMargin]);

  return elementRef;
}

/**
 * Prefetch common dashboard data
 */
export function usePrefetchDashboard() {
  const queryClient = useQueryClient();
  const strategy = usePrefetchStrategy();

  useEffect(() => {
    if (strategy !== 'aggressive') return;

    // Prefetch dashboard data in the background
    const prefetchData = async () => {
      try {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ['dashboard', 'stats'],
            queryFn: async () => {
              const { data } = await api.get('/dashboard/stats');
              return data;
            },
            staleTime: 2 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['stores', 'stats'],
            queryFn: async () => {
              const { data } = await api.get('/stores/stats');
              return data;
            },
            staleTime: 2 * 60 * 1000,
          }),
        ]);
      } catch {
        // Silently fail
      }
    };

    // Delay prefetch to not block initial render
    const timer = setTimeout(prefetchData, 1000);
    return () => clearTimeout(timer);
  }, [queryClient, strategy]);
}

export default usePrefetchRoute;
