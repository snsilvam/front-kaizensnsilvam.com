import { useCallback, useEffect, useState } from 'react';
import { getDashboard } from '../services/dashboard';
import type { Dashboard } from '../types/dashboard';

interface UseDashboard {
  data: Dashboard | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useDashboard(): UseDashboard {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getDashboard()
      .then((dashboard) => {
        if (!cancelled) setData(dashboard);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => load(), [load, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, reload };
}
