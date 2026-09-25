// Contrato de /api/winter-arc/setup (el backend responde en snake_case).

/** Mínimo de hábitos (Reglas Inquebrantables) para iniciar el reto. */
export const WINTER_ARC_MIN_RULES = 3;

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
  status: 'active';
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
  status: 'active';
  /** Día actual según el servidor (America/Bogota), YYYY-MM-DD. */
  today: string;
  /** Los 90 días del reto en orden cronológico. */
  days: WinterArcDay[];
}
