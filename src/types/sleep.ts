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
 * La pantalla del modulo. El dia y el habito los decide el backend: el dia es
 * hoy en la zona del habito y el habito es siempre "Habito 01: Despertar 5AM".
 */
export interface SleepToday {
  /** "2026-10-11". */
  date: string;
  habit: { id: string; name: string };
  /** null mientras no se haya guardado nada hoy. */
  record: SleepRecord | null;
}

/** Body de PUT /sleep/today. Sin usuario, habito ni fecha: los pone el backend. */
export interface SaveSleepInput {
  wakeTime: string;
  bedTime: string;
  sleepMinutes: number;
}
