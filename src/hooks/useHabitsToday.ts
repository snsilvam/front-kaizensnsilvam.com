import { useCallback, useEffect, useState } from 'react';
import { getKaizenHabitCalendar, getKaizenHabitStats } from '../services/kaizenHabits';
import { shiftDay, todayKey } from '../lib/habitDates';
import type { KaizenHabit, KaizenHabitCalendarDay, KaizenHabitStats } from '../types/kaizenHabit';

/** Dias de la tira de cada habito en la vista de hoy. */
const WEEK_DAYS = 7;

/** Como va un habito hoy: la ultima semana y sus estadisticas. */
export interface HabitToday {
  /** Dia contable de hoy en la zona del habito. */
  date: string;
  /** Los ultimos 7 dias, del mas antiguo a hoy. */
  week: KaizenHabitCalendarDay[];
  /** El registro de hoy (el ultimo de `week`). */
  today: KaizenHabitCalendarDay;
  stats: KaizenHabitStats;
}

interface UseHabitsToday {
  /** Por id de habito; un habito sin entrada todavia esta cargando. */
  entries: Record<string, HabitToday>;
  loading: boolean;
  error: string | null;
  reload: () => void;
  /** Vuelve a pedir un solo habito, tras registrar una repeticion. */
  reloadHabit: (habit: KaizenHabit) => Promise<void>;
}

/**
 * La vista de hoy de varios habitos: por cada uno, el calendario de la ultima
 * semana y sus estadisticas (dos GET por habito, en paralelo). El backend no
 * tiene un endpoint que lo agrupe; con los pocos habitos de una persona basta.
 *
 * `habits` debe ser estable entre renders (memoizado): cambiarlo recarga todo.
 */
export function useHabitsToday(habits: KaizenHabit[]): UseHabitsToday {
  const [entries, setEntries] = useState<Record<string, HabitToday>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all(habits.map(loadHabitToday))
      .then((loaded) => {
        if (cancelled) return;
        setEntries(Object.fromEntries(loaded.map((entry, index) => [habits[index].id, entry])));
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
  }, [habits, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const reloadHabit = useCallback(async (habit: KaizenHabit) => {
    const entry = await loadHabitToday(habit);
    setEntries((current) => ({ ...current, [habit.id]: entry }));
  }, []);

  return { entries, loading, error, reload, reloadHabit };
}

async function loadHabitToday(habit: KaizenHabit): Promise<HabitToday> {
  // "Hoy" es el de la zona del habito, como en el calendario del detalle.
  const date = todayKey(habit.timezone);
  const from = shiftDay(date, -(WEEK_DAYS - 1));
  const [calendar, stats] = await Promise.all([
    getKaizenHabitCalendar(habit.id, from, date),
    getKaizenHabitStats(habit.id),
  ]);

  const byDate = new Map(calendar.days.map((day) => [day.date, day]));
  const week = Array.from({ length: WEEK_DAYS }, (_, index) => {
    const day = shiftDay(from, index);
    return byDate.get(day) ?? { date: day, hasRepetition: false, isMinimum: false, description: '' };
  });

  return { date, week, today: week[WEEK_DAYS - 1], stats };
}
