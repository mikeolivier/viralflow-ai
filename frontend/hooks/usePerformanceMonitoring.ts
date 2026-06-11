import { useEffect } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    // Collect Web Vitals
    const collectMetrics = () => {
      const metrics: Partial<PerformanceMetrics> = {};

      // Page Load Time
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        metrics.pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
      }

      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.largestContentfulPaint = lastEntry.startTime;
          });

          observer.observe({ entryTypes: ['largest-contentful-paint'] });

          // Cleanup
          return () => observer.disconnect();
        } catch (e) {
          console.warn('LCP observer not supported');
        }
      }

      // Log metrics
      if (Object.keys(metrics).length > 0) {
        console.log('Performance Metrics:', metrics);

        // Send to analytics (optional)
        if ('sendBeacon' in navigator) {
          const data = new FormData();
          data.append('metrics', JSON.stringify(metrics));
          navigator.sendBeacon('/api/analytics/metrics', data);
        }
      }
    };

    // Wait for page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', collectMetrics);
      return () => document.removeEventListener('DOMContentLoaded', collectMetrics);
    } else {
      collectMetrics();
    }
  }, []);
}

/**
 * Hook to measure component render time
 */
export function useMeasureRenderTime(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (renderTime > 100) {
        console.warn(
          `${componentName} took ${renderTime.toFixed(2)}ms to render`
        );
      }
    };
  }, [componentName]);
}

/**
 * Hook to debounce expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
