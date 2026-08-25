import { request } from './api';

export interface RegisterKaizenHabitInput {
  name: string;
  description: string;
  identity: string;
  frequency: string;
  active: boolean;
}

/** POST /kaizen-habits: crea un hábito para el usuario autenticado. */
export function registerKaizenHabit(input: RegisterKaizenHabitInput): Promise<unknown> {
  return request<unknown>('/kaizen-habits', {
    method: 'POST',
    body: JSON.stringify(input),
  }, false);
}
