// Contrato de /api/winter-arc/setup (el backend responde en snake_case).

/** Mínimo de hábitos (Reglas Inquebrantables) para iniciar el reto. */
export const WINTER_ARC_MIN_RULES = 3;

/** Días fallados seguidos con los que se pierde el reto. La regla vive en el backend. */
export const WINTER_ARC_MAX_CONSECUTIVE_FAILURES = 3;

/** El backend limita el compromiso del reto a 500 caracteres. */
export const WINTER_ARC_MAX_COMMITMENT = 500;

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
  /** Respuesta a "¿Cuál es tu compromiso con tu yo de enero?"; vacío en retos anteriores a la pregunta. */
  commitment: string;
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
  /** Propósito del reto; vacío en retos anteriores a la pregunta. */
  commitment: string;
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
  /** Las Reglas Inquebrantables en el orden del día, como las ordena el backend. */
  schedule: WinterArcScheduleItem[];
}

/** Una Regla Inquebrantable en el horario del día. */
export interface WinterArcScheduleItem {
  habit_id: string;
  name: string;
  /** Hora del hábito "HH:MM" (24 h); null si no tiene una. */
  time: string | null;
  /** Ya tiene repetición hoy en Kaizen Habits. Siempre false si el reto no está activo. */
  done_today: boolean;
}

// Contrato de GET /api/winter-arc/:id/analytics: la retrospectiva de un reto terminado.

/** Día de la semana ISO 8601: 1 = lunes ... 7 = domingo. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Una Regla Inquebrantable con los días del reto en que tuvo repetición. */
export interface WinterArcHabitTally {
  habit_id: string;
  /** Nombre del hábito en Kaizen Habits. */
  name: string;
  /** Días con al menos una repetición del hábito. */
  completed_days: number;
  /** Días cerrados con detalle por hábito en el tramo: hasta el día 90 o hasta el que se perdió el reto. */
  evaluated_days: number;
}

/** El hábito más constante en el último tercio de los días evaluados. */
export interface WinterArcAnchorHabit extends WinterArcHabitTally {
  /** Primer día (1 a 90) del último tercio. */
  from_day: number;
  /** Último día evaluado. */
  to_day: number;
}

export interface WinterArcWeekdayStat {
  weekday: IsoWeekday;
  /** Días exitosos (todas las reglas cumplidas) que cayeron en ese día de la semana. */
  successful_days: number;
  evaluated_days: number;
}

/** Respuesta de GET /api/winter-arc/:id/analytics. Sólo existe para retos terminados. */
export interface WinterArcAnalytics {
  id: string;
  status: WinterArcStatus;
  /** Hábito con más días cumplidos en todo el reto; null si no hubo ninguna repetición. */
  unbreakable_habit: WinterArcHabitTally | null;
  /** Siempre 7, de lunes a domingo. */
  weekdays: WinterArcWeekdayStat[];
  /**
   * Mayor y menor tasa de éxito. Los decide el backend (los empates los gana
   * el primero de la semana); null si todos los días tienen la misma tasa.
   */
  best_weekday: IsoWeekday | null;
  worst_weekday: IsoWeekday | null;
  anchor_habit: WinterArcAnchorHabit | null;
}
