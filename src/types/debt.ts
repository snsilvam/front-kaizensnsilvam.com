/**
 * Contrato de Deudas (specs/005-plan-pago-deudas/contracts/debts.md).
 * Montos en pesos enteros; fechas de dia "YYYY-MM-DD" en hora de Bogota;
 * meses "YYYY-MM".
 */

export type DebtKind =
  | 'credit_card'
  | 'consumer'
  | 'payroll'
  | 'vehicle'
  | 'mortgage'
  | 'education'
  | 'other';

export type DebtMonthStatus = 'paid' | 'pending' | 'late';

export interface DebtEntity {
  code: string;
  name: string;
  /** Pagina oficial de pagos por PSE de la entidad; null = sin boton. */
  paymentUrl: string | null;
}

export interface DebtMonth {
  dueDate: string;
  status: DebtMonthStatus;
  /** Negativo si ya vencio. */
  daysUntil: number;
  paid: number;
  planned: number;
  remaining: number;
}

export interface Debt {
  id: string;
  entityCode: string;
  entityName: string;
  paymentUrl: string | null;
  kind: DebtKind;
  name: string;
  displayName: string;
  annualRate: number;
  minimumPayment: number;
  paymentDay: number;
  /** Saldo actual: el informado menos los pagos registrados desde entonces. */
  balance: number;
  reportedBalance: number;
  balanceUpdatedAt: string;
  createdAt: string;
  paidOff: boolean;
  planPosition: number;
  payoffMonth: string | null;
  stuck: boolean;
  month: DebtMonth | null;
}

export interface DebtNextPayment {
  debtId: string;
  displayName: string;
  dueDate: string;
  daysUntil: number;
  amount: number;
  paymentUrl: string | null;
}

export interface DebtPlan {
  monthlyAmount: number;
  minimumsTotal: number;
  onlyMinimums: boolean;
  amountTooLow: boolean;
  debtFreeMonth: string | null;
  totalInterest: number | null;
  stuckDebtIds: string[];
}

export interface DebtSummary {
  today: string;
  upToDate: boolean;
  lateCount: number;
  nextPayment: DebtNextPayment | null;
  monthlyAmount: number | null;
  plan: DebtPlan;
  progress: { totalBalance: number; totalPaid: number; paidOffCount: number; debtsCount: number };
  debts: Debt[];
  paidOff: Debt[];
}

export interface DebtPayment {
  id: string;
  amount: number;
  paidOn: string;
  createdAt: string;
  countsInBalance: boolean;
}

/** Body de registrar (con balance) y editar (sin balance). */
export interface DebtInput {
  entityCode: string;
  entityName: string;
  kind: DebtKind;
  name: string;
  annualRate: number;
  minimumPayment: number;
  paymentDay: number;
  balance?: number;
}
