// Contrato esperado de GET /incomes.

export interface Income {
  id: string;
  name: string;
  amount: number;
  /** Fecha en ISO 8601 (ej: "2026-08-01T00:00:00Z"). */
  date: string;
}
