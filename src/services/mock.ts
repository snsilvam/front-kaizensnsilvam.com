import type { Dashboard } from '../types/dashboard';

/**
 * Datos de desarrollo. Solo se usan cuando VITE_USE_MOCK === 'true',
 * para poder ver la UI antes de que exista GET /dashboard.
 * En build de produccion (sin la variable) esta rama se elimina.
 * Borrar este archivo cuando el endpoint este disponible.
 */
export const MOCK_DASHBOARD: Dashboard = {
  availableMoney: 1250000,
  currency: 'COP',
  nextIncome: {
    amount: 3200000,
    date: '2026-08-15T00:00:00Z',
    source: 'Nomina',
  },
  planStatus: 'at_risk',
  pending: [
    { id: 'p1', title: 'Pagar arriendo', amount: 900000, dueDate: '2026-08-05T00:00:00Z' },
    { id: 'p2', title: 'Tarjeta de credito', amount: 420000, dueDate: '2026-08-12T00:00:00Z' },
    { id: 'p3', title: 'Revisar presupuesto del mes' },
  ],
};
