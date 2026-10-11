import { request } from './api';
import type {
  MarketBudget,
  MarketItemInput,
  MarketListInput,
  MarketPurchaseInput,
  MarketSummary,
} from '../types/market';

/**
 * Moneda del modulo. El backend maneja los montos como enteros sin moneda y
 * el dashboard ya asume COP; se declara aqui para no repetir el literal.
 */
export const MARKET_CURRENCY = 'COP';

interface ListBudgetsResponse {
  budgets: MarketBudget[] | null;
}

function listPath(budgetId: string): string {
  return `/market/${encodeURIComponent(budgetId)}`;
}

function itemPath(budgetId: string, itemId: string): string {
  return `${listPath(budgetId)}/items/${encodeURIComponent(itemId)}`;
}

/** GET /market: listas de mercado abiertas del usuario, con su avance. */
export function listMarketBudgets(): Promise<MarketBudget[]> {
  return request<ListBudgetsResponse>('/market', {}, false).then(
    (response) => response.budgets ?? [],
  );
}

/**
 * POST /market: crea la lista, que en el backend es un gasto pendiente de
 * categoria "mercado". Responde el resumen de la lista, que trae su id.
 */
export function createMarketList(input: MarketListInput): Promise<MarketSummary> {
  return request<MarketSummary>('/market', { method: 'POST', body: JSON.stringify(input) }, false);
}

/** PUT /market/:id: nombre, presupuesto y fecha. Responde el resumen. */
export function updateMarketList(budgetId: string, input: MarketListInput): Promise<MarketSummary> {
  return request<MarketSummary>(
    listPath(budgetId),
    { method: 'PUT', body: JSON.stringify(input) },
    false,
  );
}

/** DELETE /market/:id: borra la lista y todos sus productos. */
export function deleteMarketList(budgetId: string): Promise<void> {
  return request<void>(listPath(budgetId), { method: 'DELETE' }, false);
}

/** GET /market/:id */
export function getMarketSummary(budgetId: string): Promise<MarketSummary> {
  return request<MarketSummary>(listPath(budgetId), {}, false);
}

/**
 * POST /market/:id/items. Responde el resumen ya recalculado, no el producto:
 * la pantalla se actualiza con esta sola llamada. Asi responden tambien los
 * demas endpoints de productos.
 */
export function addMarketItem(budgetId: string, input: MarketItemInput): Promise<MarketSummary> {
  return request<MarketSummary>(
    `${listPath(budgetId)}/items`,
    { method: 'POST', body: JSON.stringify(input) },
    false,
  );
}

/** PUT /market/:id/items/:itemId. */
export function updateMarketItem(
  budgetId: string,
  itemId: string,
  input: MarketItemInput,
): Promise<MarketSummary> {
  return request<MarketSummary>(
    itemPath(budgetId, itemId),
    { method: 'PUT', body: JSON.stringify(input) },
    false,
  );
}

/** PATCH /market/:id/items/:itemId/mark-as-purchased. */
export function markMarketItemAsPurchased(
  budgetId: string,
  itemId: string,
  input: MarketPurchaseInput,
): Promise<MarketSummary> {
  return request<MarketSummary>(
    `${itemPath(budgetId, itemId)}/mark-as-purchased`,
    { method: 'PATCH', body: JSON.stringify(input) },
    false,
  );
}

/** PATCH /market/:id/items/:itemId/mark-as-pending. */
export function markMarketItemAsPending(budgetId: string, itemId: string): Promise<MarketSummary> {
  return request<MarketSummary>(
    `${itemPath(budgetId, itemId)}/mark-as-pending`,
    { method: 'PATCH' },
    false,
  );
}

/** DELETE /market/:id/items/:itemId. Tambien responde el resumen recalculado. */
export function removeMarketItem(budgetId: string, itemId: string): Promise<MarketSummary> {
  return request<MarketSummary>(itemPath(budgetId, itemId), { method: 'DELETE' }, false);
}
