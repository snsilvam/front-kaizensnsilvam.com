import { useCallback, useEffect, useState } from 'react';
import { listIncomes } from '../services/incomes';
import type { Income } from '../types/income';

interface UseIncomes {
  data: Income[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useIncomes(): UseIncomes {
  const [data, setData] = useState<Income[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    listIncomes()
      .then((incomes) => {
        if (!cancelled) setData(incomes);
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
