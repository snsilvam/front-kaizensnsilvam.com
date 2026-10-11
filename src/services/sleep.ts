import { request } from './api';
import type { SaveSleepInput, SleepToday } from '../types/sleep';

/**
 * GET /sleep/today. Entrar al modulo deja creado el habito
 * "Habito 01: Despertar 5AM" si el usuario no lo tenia.
 */
export function getSleepToday(): Promise<SleepToday> {
  return request<SleepToday>('/sleep/today', {}, false);
}

/** PUT /sleep/today: crea o corrige el registro de hoy. */
export function saveSleepToday(input: SaveSleepInput): Promise<SleepToday> {
  return request<SleepToday>('/sleep/today', { method: 'PUT', body: JSON.stringify(input) }, false);
}
