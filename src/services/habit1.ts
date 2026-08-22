import { request } from './api';
import type { Habit1Record } from '../types/habit1';

interface ListHabit1RecordsResponse {
  records: Habit1Record[] | null;
}

export interface RegisterHabit1Input {
  numeroDeRepeticion: number;
  fecha: string;
  horaDespertar: string;
  horaDormir: string;
  horasDormidas: string;
  ritualNoche: boolean;
  ritualDia: boolean;
}

/**
 * POST /habit-1: guarda el registro del día. El backend crea además el del día
 * siguiente, así que hay que recargar la tabla después de llamar.
 */
export function registerHabit1(input: RegisterHabit1Input): Promise<unknown> {
  return request<unknown>('/habit-1', {
    method: 'POST',
    body: JSON.stringify(input),
  }, false);
}

/** GET /habit-1: registros del usuario autenticado. */
export function listHabit1Records(): Promise<Habit1Record[]> {
  return request<ListHabit1RecordsResponse>('/habit-1', {}, false).then(
    (response) => response.records ?? [],
  );
}
