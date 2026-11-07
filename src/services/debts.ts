import { request } from './api';
import type { DebtEntity, DebtInput, DebtPayment, DebtSummary } from '../types/debt';

function debtPath(id: string): string {
  return `/debts/${encodeURIComponent(id)}`;
}

function send(path: string, method: string, body?: unknown): Promise<DebtSummary> {
  return request<DebtSummary>(
    path,
    { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) },
    false,
  );
}

/** GET /debt-entities: el catalogo con los enlaces de pago verificados. */
export function listDebtEntities(): Promise<DebtEntity[]> {
  return request<{ entities: DebtEntity[] | null }>('/debt-entities', {}, false).then(
    (response) => response.entities ?? [],
  );
}

/**
 * GET /debts: la pantalla completa. Todas las escrituras responden este mismo
 * resumen ya recalculado, asi la pantalla se actualiza con una sola llamada.
 */
export function getDebtSummary(): Promise<DebtSummary> {
  return request<DebtSummary>('/debts', {}, false);
}

export function createDebt(input: DebtInput): Promise<DebtSummary> {
  return send('/debts', 'POST', input);
}

/** PUT /debts/:id. El saldo no viaja: se cambia con updateDebtBalance. */
export function updateDebt(id: string, input: DebtInput): Promise<DebtSummary> {
  const { balance: _ignored, ...rest } = input;
  return send(debtPath(id), 'PUT', rest);
}

export function deleteDebt(id: string): Promise<DebtSummary> {
  return send(debtPath(id), 'DELETE');
}

/** PATCH /debts/:id/balance: el saldo que dice el banco. 0 la deja saldada. */
export function updateDebtBalance(id: string, balance: number): Promise<DebtSummary> {
  return send(`${debtPath(id)}/balance`, 'PATCH', { balance });
}

/** POST /debts/:id/payments ("Ya pagué"). paidOn vacio es hoy. */
export function addDebtPayment(id: string, amount: number, paidOn?: string): Promise<DebtSummary> {
  return send(`${debtPath(id)}/payments`, 'POST', { amount, paidOn: paidOn ?? '' });
}

export function listDebtPayments(id: string): Promise<DebtPayment[]> {
  return request<{ payments: DebtPayment[] | null }>(`${debtPath(id)}/payments`, {}, false).then(
    (response) => response.payments ?? [],
  );
}

export function deleteDebtPayment(id: string, paymentId: string): Promise<DebtSummary> {
  return send(`${debtPath(id)}/payments/${encodeURIComponent(paymentId)}`, 'DELETE');
}

/** PUT /debts/monthly-amount. null lo borra y el plan vuelve a solo minimos. */
export function setDebtMonthlyAmount(monthlyAmount: number | null): Promise<DebtSummary> {
  return send('/debts/monthly-amount', 'PUT', { monthlyAmount });
}
