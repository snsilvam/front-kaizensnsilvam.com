import { useCallback, useEffect, useState } from 'react';
import { listKaizenHabits } from '../services/kaizenHabits';
import type { KaizenHabit } from '../types/kaizenHabit';

interface UseKaizenHabits {
  data: KaizenHabit[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Habitos del usuario autenticado (GET /kaizen-habits). */
export function useKaizenHabits(): UseKaizenHabits {
  const [data, setData] = useState<KaizenHabit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    listKaizenHabits()
      .then((habits) => {
        if (!cancelled) setData(habits);
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
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, loading, error, reload };
}
