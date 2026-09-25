// Contrato de /api/winter-arc/setup (el backend responde en snake_case).

/** Mínimo de hábitos (Reglas Inquebrantables) para iniciar el reto. */
export const WINTER_ARC_MIN_RULES = 3;

/** Días fallados seguidos con los que se pierde el reto. La regla vive en el backend. */
export const WINTER_ARC_MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Lo decide el Juez Nocturno al cerrar cada día (23:59, America/Bogota).
 * `failed`: se perdió por acumular 3 días fallados seguidos.
 * `completed`: llegó vivo al cierre del día 90. Ambos son definitivos.
 */
export type WinterArcStatus = 'active' | 'failed' | 'completed';

export interface WinterArcRule {
  id: string;
  habit_id: string;
}

export interface WinterArc {
  id: string;
  /** Primer día del reto, YYYY-MM-DD. Lo decide el servidor. */
  start_date: string;
  /** Último día del reto (inclusivo), YYYY-MM-DD. */
  end_date: string;
  status: WinterArcStatus;
  created_at: string;
  rules: WinterArcRule[];
}

export interface WinterArcDay {
  /** 1 a 90. */
  day_number: number;
  /** YYYY-MM-DD. */
  date: string;
  /** false también para los días que nunca se sincronizaron. */
  is_successful: boolean;
}

/** Respuesta de GET /api/winter-arc/:id/grid. */
export interface WinterArcGrid {
  id: string;
  start_date: string;
  end_date: string;
  status: WinterArcStatus;
  /** Día actual según el servidor (America/Bogota), YYYY-MM-DD. */
  today: string;
  /** Días fallados seguidos (0 a 3) según el último cierre del Juez Nocturno. Sincronizar hoy no la cambia. */
  consecutive_failed_days: number;
  /** Día del reto en que se perdió (el tercer fallo seguido); null si no se perdió. */
  failed_on_day: number | null;
  /** Los 90 días del reto en orden cronológico. */
  days: WinterArcDay[];
}
