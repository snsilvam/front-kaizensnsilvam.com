/** Último día del invierno, YYYY-MM-DD: el contador llega a cero ese día. */
export const WINTER_ARC_SEASON_ENDS_ON = '2026-12-31';

/** Duración de la temporada que cuenta el contador. */
export const WINTER_ARC_SEASON_DAYS = 90;

/**
 * Instante en que el contador marca cero: las 00:00 del último día en Bogotá,
 * igual que el resto del Winter Arc (Colombia siempre es UTC−5).
 */
export const WINTER_ARC_SEASON_ENDS_AT = Date.parse(`${WINTER_ARC_SEASON_ENDS_ON}T00:00:00-05:00`);

/** 90 días antes del cero: el 2 de octubre a las 00:00 de Bogotá. */
export const WINTER_ARC_SEASON_STARTS_AT = WINTER_ARC_SEASON_ENDS_AT - WINTER_ARC_SEASON_DAYS * 86_400_000;
