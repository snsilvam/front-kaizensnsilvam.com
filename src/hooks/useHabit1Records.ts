import { useCallback, useEffect, useState } from 'react';
import { listHabit1Records } from '../services/habit1';
import type { Habit1Record } from '../types/habit1';

interface UseHabit1Records {
  data: Habit1Record[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useHabit1Records(): UseHabit1Records {
  const [data, setData] = useState<Habit1Record[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    listHabit1Records()
      .then((records) => {
        if (!cancelled) setData(records);
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
