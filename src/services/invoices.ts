import { ApiError, request } from './api';
import type { Invoice } from '../types/invoice';

interface ListInvoicesResponse {
  invoices: Invoice[] | null;
}

/**
 * POST /invoices: sube la foto y el backend la lee con Claude. Solo se
 * guardan los datos extraídos, no la foto. Puede tardar varios segundos.
 */
export function captureInvoice(image: Blob): Promise<Invoice> {
  const form = new FormData();
  form.append('image', image, 'factura.jpg');
  return request<Invoice>('/invoices', { method: 'POST', body: form }, false);
}

/** GET /invoices: facturas del usuario autenticado. */
export function listInvoices(): Promise<Invoice[]> {
  return request<ListInvoicesResponse>('/invoices', {}, false).then(
    (response) => (response.invoices ?? []).map(normalizeInvoice),
  );
}

/** DELETE /invoices/:id: borra la factura. */
export function deleteInvoice(invoiceId: string): Promise<unknown> {
  return request<unknown>(`/invoices/${encodeURIComponent(invoiceId)}`, { method: 'DELETE' }, false);
}

/**
 * El backend responde 403 en todo /invoices cuando el usuario no tiene
 * habilitado el módulo de facturas con IA (users.ia_feature en false).
 */
export function isFeatureDisabled(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

/** Lo que el usuario lee cuando una captura falla, según el status del backend. */
export function captureErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 409:
        return 'Esta factura ya está guardada.';
      case 413:
        return 'La foto es demasiado pesada. Intenta con otra.';
      case 415:
        return 'Ese archivo no es una imagen compatible. Usa una foto JPG, PNG o WebP.';
      case 422:
        return 'No encontramos una factura en la foto. Acércate, busca buena luz y que se vea el total.';
      case 429:
        return 'Llegaste al límite de facturas por hoy. Vuelve mañana.';
      case 503:
        return 'No pudimos leer la factura en este momento. Intenta de nuevo en unos minutos.';
    }
  }
  return error instanceof Error ? error.message : 'No fue posible guardar la factura.';
}

/** El backend nunca manda items en null, pero una lista vacía es más segura de pintar. */
function normalizeInvoice(invoice: Invoice): Invoice {
  return { ...invoice, items: invoice.items ?? [] };
}
