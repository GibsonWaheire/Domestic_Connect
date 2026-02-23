/**
 * Performance monitoring hook for React components
 */
import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
  });
  
  const mountStartTime = useRef<number>(0);
  const renderStartTime = useRef<number>(0);
  const updateCountRef = useRef<number>(0);

  useEffect(() => {
    mountStartTime.current = performance.now();
    
    return () => {
      const mountTime = performance.now() - mountStartTime.current;
      setMetrics(prev => ({
        ...prev,
        mountTime,
      }));
    };
  }, []);

  useEffect(() => {
    renderStartTime.current = performance.now();
    updateCountRef.current += 1;
    
    const measureRender = () => {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({
        ...prev,
        renderTime,
        updateCount: updateCountRef.current,
      }));
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRender);
  });

  // Log performance issues
  useEffect(() => {
    if (metrics.renderTime > 16) { // More than 16ms (60fps threshold)
      console.warn(`Performance warning: ${componentName} render took ${metrics.renderTime.toFixed(2)}ms`);
    }
    
    if (metrics.updateCount > 10) {
      console.warn(`Performance warning: ${componentName} has updated ${metrics.updateCount} times`);
    }
  }, [metrics, componentName]);

  return metrics;
};

/**
 * Hook for lazy loading components
 */
export const useLazyLoad = <T>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ComponentType<T>
) => {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    importFunc()
      .then((module) => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
        if (fallback) {
          setComponent(() => fallback);
        }
      });
  }, [importFunc, fallback]);

  return { Component, loading, error };
};

/**
 * Hook for debouncing values
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(0);

  return useRef((...args: Parameters<T>) => {
    const now = performance.now();
    if (now - lastRun.current >= delay) {
      lastRun.current = now;
      return callback(...args);
    }
  }).current as T;
};

/**
 * Hook for memoizing expensive calculations
 */
export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const [value, setValue] = useState<T>(factory);
  const prevDeps = useRef<React.DependencyList>(deps);

  useEffect(() => {
    const hasChanged = deps.some((dep, index) => dep !== prevDeps.current[index]);
    if (hasChanged) {
      setValue(factory());
      prevDeps.current = deps;
    }
  }, deps);

  return value;
};

/**
 * Hook for virtual scrolling
 */
export const useVirtualScroll = (
  itemHeight: number,
  containerHeight: number,
  itemCount: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    itemCount
  );
  
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleStart,
    visibleEnd,
    offsetY,
    setScrollTop,
  };
};
