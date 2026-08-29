import { request } from './api';
import type { MarketBudget, MarketSummary } from '../types/market';

/**
 * Moneda del modulo. El backend maneja los montos como enteros sin moneda y
 * el dashboard ya asume COP; se declara aqui para no repetir el literal.
 */
export const MARKET_CURRENCY = 'COP';

interface ListBudgetsResponse {
  budgets: MarketBudget[] | null;
}

/** GET /market: presupuestos de mercado abiertos del usuario. */
export function listMarketBudgets(): Promise<MarketBudget[]> {
  return request<ListBudgetsResponse>('/market', {}, false).then(
    (response) => response.budgets ?? [],
  );
}

/** GET /market/:id */
export function getMarketSummary(budgetId: string): Promise<MarketSummary> {
  return request<MarketSummary>(`/market/${encodeURIComponent(budgetId)}`, {}, false);
}

/**
 * POST /market/:id/items. Responde el resumen ya recalculado, no el producto:
 * la pantalla se actualiza con esta sola llamada.
 */
export function addMarketItem(
  budgetId: string,
  name: string,
  price: number,
): Promise<MarketSummary> {
  return request<MarketSummary>(
    `/market/${encodeURIComponent(budgetId)}/items`,
    { method: 'POST', body: JSON.stringify({ name, price }) },
    false,
  );
}

/** DELETE /market/:id/items/:itemId. Tambien responde el resumen recalculado. */
export function removeMarketItem(budgetId: string, itemId: string): Promise<MarketSummary> {
  return request<MarketSummary>(
    `/market/${encodeURIComponent(budgetId)}/items/${encodeURIComponent(itemId)}`,
    { method: 'DELETE' },
    false,
  );
}
