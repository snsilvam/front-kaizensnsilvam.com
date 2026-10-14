import { request } from './api';
import type { SaveSleepInput, SleepHistory, SleepToday } from '../types/sleep';

/** Sin registros previos: la tira del historial no se pinta. */
const EMPTY_HISTORY: SleepHistory = { days: [], typicalWakeTime: '', averageSleepMinutes: 0, onTrack: false };

/**
 * GET /sleep/today. Abrir el modal de sueno deja creado el habito
 * "Habito 01: Despertar 5AM" si el usuario no lo tenia.
 */
export async function getSleepToday(): Promise<SleepToday> {
  return withHistory(await request<SleepToday>('/sleep/today', {}, false));
}

/** PUT /sleep/today: crea o corrige el registro de hoy. */
export async function saveSleepToday(input: SaveSleepInput): Promise<SleepToday> {
  return withHistory(await request<SleepToday>('/sleep/today', { method: 'PUT', body: JSON.stringify(input) }, false));
}

/**
 * Un backend anterior al historial no manda `history`: se toma como vacio para
 * que el modal siga funcionando, sin la tira, mientras front y backend se
 * despliegan por separado.
 */
function withHistory(today: SleepToday): SleepToday {
  return { ...today, history: today.history ?? EMPTY_HISTORY };
}
