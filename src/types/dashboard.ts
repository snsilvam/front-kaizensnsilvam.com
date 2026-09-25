// Contrato esperado de GET /dashboard.
// Si el backend usa otros nombres de campo, este archivo es el unico
// lugar que hay que ajustar.

export type PlanStatus = 'on_track' | 'at_risk' | 'off_track' | 'unknown';

export interface NextIncome {
  /** Monto del proximo ingreso. */
  amount: number;
  /** Fecha en ISO 8601 (ej: "2026-08-15T00:00:00Z"). */
  date: string;
  /** Origen del ingreso (nomina, cliente, etc.). Opcional. */
  source?: string;
  /** Dias que faltan para recibirlo, calculados por el backend (0 = hoy). */
  daysRemaining: number;
}

export interface PendingItem {
  id: string;
  title: string;
  /** Monto asociado al pendiente, si aplica. */
  amount?: number;
  /** Fecha limite en ISO 8601, si aplica. */
  dueDate?: string;
}

export interface Dashboard {
  /** Dinero disponible hoy. */
  availableMoney: number;
  /** Lo que queda de hoy despues de pagar todos los pendientes. Puede ser negativo. */
  availableAfterCommitments: number;
  /** Codigo ISO 4217 (ej: "USD", "COP"). */
  currency: string;
  /** null cuando no hay un proximo ingreso registrado. */
  nextIncome: NextIncome | null;
  planStatus: PlanStatus;
  pending: PendingItem[];
}
