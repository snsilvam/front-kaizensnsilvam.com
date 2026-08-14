import { request } from './api';
import type { Income } from '../types/income';

interface ListIncomesResponse {
  incomes: Income[] | null;
}

export interface RegisterIncomeInput {
  name: string;
  amount: number;
  date: string;
}

/** POST /incomes */
export function registerIncome(input: RegisterIncomeInput): Promise<unknown> {
  return request<unknown>('/incomes', {
    method: 'POST',
    body: JSON.stringify(input),
  }, false);
}

/** DELETE /incomes/:id */
export function deleteIncome(incomeId: string): Promise<unknown> {
  return request<unknown>(`/incomes/${encodeURIComponent(incomeId)}`, {
    method: 'DELETE',
  }, false);
}

/** GET /incomes: ingresos del usuario autenticado. */
export function listIncomes(): Promise<Income[]> {
  return request<ListIncomesResponse>('/incomes', {}, false).then(
    (response) => response.incomes ?? [],
  );
}
