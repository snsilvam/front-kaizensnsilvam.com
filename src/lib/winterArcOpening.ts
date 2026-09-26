/** Día en que abre el modulo Winter Arc, YYYY-MM-DD. */
export const WINTER_ARC_OPENS_ON = '2026-10-01';

/**
 * Instante de apertura: medianoche en Bogotá, igual que el backend y el Juez
 * Nocturno. Colombia no tiene horario de verano, así que siempre es UTC−5.
 */
export const WINTER_ARC_OPENS_AT = Date.parse(`${WINTER_ARC_OPENS_ON}T00:00:00-05:00`);

export function isWinterArcOpen(now = Date.now()): boolean {
  return now >= WINTER_ARC_OPENS_AT;
}
