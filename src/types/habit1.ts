// Contrato esperado de GET /habit-1.

export interface Habit1Record {
  id: string;
  /** Número incremental de la repetición del hábito. */
  numeroDeRepeticion: number;
  /** Fecha en ISO 8601 (ej: "2026-08-22T00:00:00Z"). */
  fecha: string;
  /** Hora del reloj en formato "HH:MM" de 24 horas (ej: "06:00"). */
  horaDespertar: string;
  /** Hora del reloj en formato "HH:MM" de 24 horas (ej: "22:30"). */
  horaDormir: string;
  /** Duración del sueño con el mismo formato: "07:30" son 7 horas 30 minutos. */
  horasDormidas: string;
  ritualNoche: boolean;
  ritualDia: boolean;
}
