import { request } from './api';
import type { WinterArc, WinterArcDay, WinterArcGrid } from '../types/winterArc';

/**
 * POST /api/winter-arc/setup: inicia el reto de 90 días con los hábitos
 * elegidos como Reglas Inquebrantables. El backend exige al menos 3 distintos.
 */
export function setupWinterArc(habitIds: string[]): Promise<WinterArc> {
  return request<WinterArc>(
    '/api/winter-arc/setup',
    {
      method: 'POST',
      body: JSON.stringify({ habit_ids: habitIds }),
    },
    false,
  );
}

/** GET /api/winter-arc/:id/grid: los 90 días del reto en orden. */
export function getWinterArcGrid(winterArcId: string): Promise<WinterArcGrid> {
  return request<WinterArcGrid>(`/api/winter-arc/${encodeURIComponent(winterArcId)}/grid`, {}, false);
}

/**
 * POST /api/winter-arc/:id/sync-today: evalúa hoy. Es exitoso sólo si todas
 * las reglas tienen una repetición registrada hoy en Kaizen Habits.
 */
export function syncWinterArcToday(winterArcId: string): Promise<WinterArcDay> {
  return request<WinterArcDay>(
    `/api/winter-arc/${encodeURIComponent(winterArcId)}/sync-today`,
    { method: 'POST' },
    false,
  );
}
