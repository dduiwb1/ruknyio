/**
 * 🪝 usePerformance Hook
 * 
 * React hook for accessing performance metrics
 */

'use client';

import { useEffect, useState } from 'react';
import { getPerformanceTracker } from '@/lib/performance';
import type { CoreWebVitals, PerformanceEvent } from '@/lib/performance/types';

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceEvent[]>([]);
  const [webVitals, setWebVitals] = useState<Partial<CoreWebVitals>>({});

  useEffect(() => {
    const tracker = getPerformanceTracker();
    if (!tracker) return;

    // Get initial metrics
    setMetrics(tracker.getMetrics());
    setWebVitals(tracker.getWebVitals());

    // Update metrics periodically (every 5 seconds)
    const interval = setInterval(() => {
      setMetrics(tracker.getMetrics());
      setWebVitals(tracker.getWebVitals());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    webVitals,
    getMetrics: () => getPerformanceTracker()?.getMetrics() || [],
    getWebVitals: () => getPerformanceTracker()?.getWebVitals() || {},
    clearMetrics: () => getPerformanceTracker()?.clearMetrics(),
  };
}
