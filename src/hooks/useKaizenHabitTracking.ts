import { useCallback, useEffect, useState } from 'react';
import { getKaizenHabitCalendar, getKaizenHabitStats } from '../services/kaizenHabits';
import { monthRange } from '../lib/habitDates';
import type { KaizenHabitCalendar, KaizenHabitStats } from '../types/kaizenHabit';

interface UseKaizenHabitTracking {
  calendar: KaizenHabitCalendar | null;
  stats: KaizenHabitStats | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Calendario del mes visible + estadisticas de un habito. Se recargan juntos
 * porque cada repeticion registrada cambia las dos cosas a la vez.
 */
export function useKaizenHabitTracking(
  habitId: string | null,
  visibleMonth: string,
): UseKaizenHabitTracking {
  const [calendar, setCalendar] = useState<KaizenHabitCalendar | null>(null);
  const [stats, setStats] = useState<KaizenHabitStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!habitId) {
      setCalendar(null);
      setStats(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const { from, to } = monthRange(visibleMonth);

    setLoading(true);
    setError(null);

    Promise.all([getKaizenHabitCalendar(habitId, from, to), getKaizenHabitStats(habitId)])
      .then(([habitCalendar, habitStats]) => {
        if (cancelled) return;
        setCalendar(habitCalendar);
        setStats(habitStats);
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
  }, [habitId, visibleMonth, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { calendar, stats, loading, error, reload };
}
