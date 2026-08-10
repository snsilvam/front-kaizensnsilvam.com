import { MOCK_DASHBOARD } from './mock';
import type { Dashboard } from '../types/dashboard';

/** Datos temporales para visualizar el dashboard hasta integrar GET /dashboard. */
export function getDashboard(): Promise<Dashboard> {
  return Promise.resolve(MOCK_DASHBOARD);
}
