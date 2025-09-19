import { useState, useEffect, useCallback } from 'react';
import { crossEntityApi, DashboardData } from '@/lib/api';

interface UseRealTimeDataOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

export const useRealTimeData = (options: UseRealTimeDataOptions = {}) => {
  const { refreshInterval = 30000, enabled = true } = options; // Default 30 seconds
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await crossEntityApi.getDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching real-time data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling interval
    const interval = setInterval(fetchData, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, refreshInterval, fetchData]);

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
