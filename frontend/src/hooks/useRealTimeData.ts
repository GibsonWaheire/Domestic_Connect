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
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await crossEntityApi.getDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching real-time data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      
      // If it's an authentication error, stop trying to fetch
      if (err instanceof Error && err.message.includes('Authentication required')) {
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshData = useCallback(() => {
    if (!user) return;
    setLoading(true);
    fetchData();
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
    lastUpdated,
    refreshData,
    isStale: lastUpdated ? Date.now() - lastUpdated.getTime() > refreshInterval * 2 : false
  };
};

export default useRealTimeData;
