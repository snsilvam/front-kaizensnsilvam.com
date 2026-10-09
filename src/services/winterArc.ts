import { request } from './api';
import type { WinterArc, WinterArcAnalytics, WinterArcDay, WinterArcGrid } from '../types/winterArc';

/**
 * POST /api/winter-arc/setup: inicia el reto de 90 días con los hábitos
 * elegidos como Reglas Inquebrantables. El backend exige al menos 3 distintos.
 * `commitment` es el propósito del reto (máx. 500 caracteres).
 */
export function setupWinterArc(habitIds: string[], commitment: string): Promise<WinterArc> {
  return request<WinterArc>(
    '/api/winter-arc/setup',
    {
      method: 'POST',
      body: JSON.stringify({ habit_ids: habitIds, commitment }),
    },
    false,
  );
}

/**
 * GET /api/winter-arc/current: el grid del reto más reciente del usuario, en
 * cualquier estado. Responde 404 (ApiError) si nunca inició uno.
 */
export function getCurrentWinterArc(): Promise<WinterArcGrid> {
  return request<WinterArcGrid>('/api/winter-arc/current', {}, false);
}

/** GET /api/winter-arc/:id/grid: los 90 días del reto en orden. */
export function getWinterArcGrid(winterArcId: string): Promise<WinterArcGrid> {
  return request<WinterArcGrid>(`/api/winter-arc/${encodeURIComponent(winterArcId)}/grid`, {}, false);
}

/**
 * GET /api/winter-arc/:id/analytics: la retrospectiva de un reto terminado
 * (completed o failed). Todo se calcula en el backend.
 */
export function getWinterArcAnalytics(winterArcId: string): Promise<WinterArcAnalytics> {
  return request<WinterArcAnalytics>(`/api/winter-arc/${encodeURIComponent(winterArcId)}/analytics`, {}, false);
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
