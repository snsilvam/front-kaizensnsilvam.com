import { request } from './api';
import { MOCK_DASHBOARD } from './mock';
import type { Dashboard, PlanStatus } from '../types/dashboard';

interface BackendDashboard {
  availableToday: number;
  nextIncome: {
    name: string;
    amount: number;
    date: string;
    daysRemaining: number;
  } | null;
  planStatus: PlanStatus;
  pendingPayments: Array<{
    id: string;
    name: string;
    amount: number;
    dueDate: string;
  }>;
  pendingPaymentsCount: number;
}

export function getDashboard(): Promise<Dashboard> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve(MOCK_DASHBOARD);
  }

  return request<BackendDashboard>('/dashboard', {}, false).then((backend) => ({
    availableMoney: backend.availableToday,
    currency: 'COP',
    nextIncome: backend.nextIncome
      ? {
          amount: backend.nextIncome.amount,
          date: backend.nextIncome.date,
          source: backend.nextIncome.name,
        }
      : null,
    planStatus: backend.planStatus,
    pending: backend.pendingPayments.map((payment) => ({
      id: payment.id,
      title: payment.name,
      amount: payment.amount,
      dueDate: payment.dueDate,
    })),
  }));
}
