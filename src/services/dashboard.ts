import { request } from './api';
import { MOCK_DASHBOARD } from './mock';
import type { Dashboard } from '../types/dashboard';

/** GET /dashboard */
export function getDashboard(): Promise<Dashboard> {
  // Solo para desarrollo sin backend. Ver src/services/mock.ts
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve(MOCK_DASHBOARD);
  }

  return request<Dashboard>('/dashboard');
}
