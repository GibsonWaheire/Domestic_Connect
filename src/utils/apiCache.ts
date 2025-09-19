/**
 * API caching utility for frontend performance optimization
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum number of cache entries

  set<T>(key: string, data: T, ttl: number = 300000): void { // Default 5 minutes
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  private calculateHitRate(): number {
    // This would need to be implemented with hit/miss tracking
    return 0;
  }
}

// Global cache instance
export const apiCache = new APICache();

/**
 * Cached API request function
 */
export const cachedApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  ttl: number = 300000 // 5 minutes default
): Promise<T> => {
  const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
  
  // Check cache first
  const cachedData = apiCache.get<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Make API request
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Cache successful responses
  if (response.status < 400) {
    apiCache.set(cacheKey, data, ttl);
  }

  return data;
};

/**
 * Hook for cached API calls
 */
export const useCachedApi = <T>(
  endpoint: string,
  options: RequestInit = {},
  ttl: number = 300000
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await cachedApiRequest<T>(endpoint, options, ttl);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, JSON.stringify(options), ttl]);

  return { data, loading, error };
};

/**
 * Hook for paginated cached API calls
 */
export const useCachedPaginatedApi = <T>(
  endpoint: string,
  page: number = 1,
  perPage: number = 20,
  options: RequestInit = {},
  ttl: number = 300000
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = `${endpoint}?page=${page}&per_page=${perPage}`;
        const result = await cachedApiRequest<{
          data: T[];
          pagination: { total: number; pages: number; has_next: boolean };
        }>(url, options, ttl);
        
        setData(result.data);
        setTotal(result.pagination.total);
        setHasMore(result.pagination.has_next);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, page, perPage, JSON.stringify(options), ttl]);

  return { data, loading, error, hasMore, total };
};

/**
 * Utility for clearing cache
 */
export const clearApiCache = (pattern?: string) => {
  if (pattern) {
    // Clear specific cache entries matching pattern
    for (const key of apiCache['cache'].keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    apiCache.clear();
  }
};

/**
 * Utility for preloading data
 */
export const preloadData = async <T>(
  endpoint: string,
  options: RequestInit = {},
  ttl: number = 300000
): Promise<void> => {
  try {
    await cachedApiRequest<T>(endpoint, options, ttl);
  } catch (error) {
    console.warn(`Failed to preload data from ${endpoint}:`, error);
  }
};
