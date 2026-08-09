import { request } from './api';

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
