import { useState, useEffect, useCallback } from 'react';
import { crossEntityApi, DashboardData } from '@/lib/api';
import { useAuth } from '@/hooks/useAuthEnhanced';

interface UseRealTimeDataOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

export const useRealTimeData = (options: UseRealTimeDataOptions = {}) => {
  const { refreshInterval = 30000, enabled = true } = options; // Default 30 seconds
  const { user } = useAuth();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRetryAt, setNextRetryAt] = useState<number>(0);
  const [failureCount, setFailureCount] = useState(0);

  const fetchData = useCallback(async (force = false) => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    if (!force && nextRetryAt > Date.now()) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      setError(null);
      const data = await crossEntityApi.getDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date());
      setFailureCount(0);
      setNextRetryAt(0);
    } catch (err) {
      console.error('Error fetching real-time data:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      const updatedFailureCount = failureCount + 1;
      setFailureCount(updatedFailureCount);
      setNextRetryAt(Date.now() + Math.min(updatedFailureCount * 15000, 120000));
      
      // If it's an authentication error, stop trying to fetch
      if (message.includes('Authentication required')) {
        setLoading(false);
        return;
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [user, nextRetryAt, failureCount]);

  const refreshData = useCallback((showLoader = false) => {
    if (!user) return;
    if (showLoader) {
      setLoading(true);
    }
    fetchData(true);
  }, [fetchData, user]);

  useEffect(() => {
    if (!enabled || !user) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchData();

    // Set up polling interval
    const interval = setInterval(() => {
      if (user) { // Only fetch if user is still authenticated
        fetchData();
      }
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, refreshInterval, fetchData, user]);

  return {
    dashboardData,
    loading,
    error,
    refreshing,
    lastUpdated,
    refreshData,
    isStale: lastUpdated ? Date.now() - lastUpdated.getTime() > refreshInterval * 2 : false
  };
};

export default useRealTimeData;
