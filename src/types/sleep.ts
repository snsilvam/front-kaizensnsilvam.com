// Contrato de GET y PUT /sleep/today del backend.
// Si el backend cambia nombres de campo, este archivo es el unico lugar que
// hay que ajustar.

/** El registro de un dia. Los tres datos los declara el usuario. */
export interface SleepRecord {
  /** Hora a la que se desperto hoy, "HH:MM" en 24 horas. */
  wakeTime: string;
  /** Hora a la que se acostara esta noche, "HH:MM" en 24 horas. */
  bedTime: string;
  /** Lo que durmio la noche anterior, en minutos: 5 h 38 min = 338. */
  sleepMinutes: number;
  /** ISO 8601. */
  updatedAt: string;
}

/**
 * Lo que pinta el modal de sueno. El dia y el habito los decide el backend: el dia es
 * hoy en la zona del habito y el habito es siempre "Habito 01: Despertar 5AM".
 */
export interface SleepToday {
  /** "2026-10-11". */
  date: string;
  habit: { id: string; name: string };
  /** null mientras no se haya guardado nada hoy. */
  record: SleepRecord | null;
  history: SleepHistory;
}

/** Semaforo de una noche: ok = 7 h o mas; warning = de 6 a 7 h; short = menos de 6 h. */
export type SleepStatus = 'ok' | 'warning' | 'short';

/** Un registro del historial, ya evaluado por el backend. */
export interface SleepHistoryDay {
  /** "2026-10-10". */
  date: string;
  wakeTime: string;
  bedTime: string;
  sleepMinutes: number;
  sleepStatus: SleepStatus;
  /** Se desperto a la hora habitual, con 30 minutos de margen. */
  wakeOnSchedule: boolean;
}

/**
 * Higiene del sueno: los ultimos 5 registros, del mas antiguo al mas reciente.
 * Hoy aparece solo si ya se registro; los dias sin registro se saltan. Las
 * reglas las aplica el backend.
 */
export interface SleepHistory {
  /** Lista vacia, nunca null, si no hay registros. */
  days: SleepHistoryDay[];
  /** Hora habitual de despertar, "HH:MM"; vacia sin registros. */
  typicalWakeTime: string;
  averageSleepMinutes: number;
  /** Todos los dias a la hora habitual y ninguna noche de menos de 6 h. */
  onTrack: boolean;
}

/** Body de PUT /sleep/today. Sin usuario, habito ni fecha: los pone el backend. */
export interface SaveSleepInput {
  wakeTime: string;
  bedTime: string;
  sleepMinutes: number;
}
