import { request } from './api';
import type {
  KaizenHabit,
  KaizenHabitCalendar,
  KaizenHabitGoal,
  KaizenHabitRepetition,
  KaizenHabitStats,
} from '../types/kaizenHabit';

export interface RegisterKaizenHabitInput {
  name: string;
  description: string;
  identity: string;
  cue: string;
  attractiveness: string;
  action: string;
  minimumAction2min: string;
  reward: string;
  frequency: string;
  time: string;
  location: string;
  timezone?: string;
  active: boolean;
}

export interface RegisterKaizenHabitRepetitionInput {
  occurredOn: string;
  isMinimum?: boolean;
  description?: string;
}

export interface CreateKaizenHabitGoalInput {
  targetRepetitions: number;
  startedOn: string;
}

/** POST /kaizen-habits: crea un habito para el usuario autenticado. */
export function registerKaizenHabit(input: RegisterKaizenHabitInput): Promise<KaizenHabit> {
  return request<KaizenHabit>(
    '/kaizen-habits',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    false,
  );
}

/** GET /kaizen-habits: lista los habitos del usuario autenticado. */
export function listKaizenHabits(): Promise<KaizenHabit[]> {
  return request<KaizenHabit[]>('/kaizen-habits', {}, false);
}

/** POST /kaizen-habits/:habitId/repetitions */
export function registerKaizenHabitRepetition(
  habitId: string,
  input: RegisterKaizenHabitRepetitionInput,
): Promise<KaizenHabitRepetition> {
  return request<KaizenHabitRepetition>(
    `/kaizen-habits/${encodeURIComponent(habitId)}/repetitions`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    false,
  );
}

/** GET /kaizen-habits/:habitId/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD */
export function getKaizenHabitCalendar(
  habitId: string,
  from: string,
  to: string,
): Promise<KaizenHabitCalendar> {
  const params = new URLSearchParams({ from, to });
  return request<KaizenHabitCalendar>(
    `/kaizen-habits/${encodeURIComponent(habitId)}/calendar?${params.toString()}`,
    {},
    false,
  );
}

/** GET /kaizen-habits/:habitId/stats */
export function getKaizenHabitStats(habitId: string, asOf?: string): Promise<KaizenHabitStats> {
  const params = new URLSearchParams();
  if (asOf) params.set('asOf', asOf);

  const query = params.toString();
  return request<KaizenHabitStats>(
    `/kaizen-habits/${encodeURIComponent(habitId)}/stats${query ? `?${query}` : ''}`,
    {},
    false,
  );
}

/** POST /kaizen-habits/:habitId/goals */
export function createKaizenHabitGoal(
  habitId: string,
  input: CreateKaizenHabitGoalInput,
): Promise<KaizenHabitGoal> {
  return request<KaizenHabitGoal>(
    `/kaizen-habits/${encodeURIComponent(habitId)}/goals`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    false,
  );
}

/** DELETE /kaizen-habits/:habitId: borra el habito y todo su historial. */
export function deleteKaizenHabit(habitId: string): Promise<unknown> {
  return request<unknown>(
    `/kaizen-habits/${encodeURIComponent(habitId)}`,
    {
      method: 'DELETE',
    },
    false,
  );
}
