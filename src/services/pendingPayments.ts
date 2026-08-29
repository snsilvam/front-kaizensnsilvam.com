import { publicRequest } from './api';

const PENDING_PAYMENTS_URL = 'https://kaizensnsilvam-backend-778334880592.us-central1.run.app/pending-payments';

/** Categorias que acepta el backend. Es un conjunto cerrado. */
export type PendingPaymentCategory = 'mercado' | 'otros';

export interface RegisterPendingPaymentInput {
  name: string;
  amount: number;
  dueDate: string;
  /**
   * Opcional: sin ella el backend la deja en "otros". Con "mercado" el gasto
   * pendiente ademas queda disponible en /market como presupuesto de compra.
   */
  category?: PendingPaymentCategory;
}

/** POST /pending-payments sin variables de entorno ni API key. */
export function registerPendingPayment(input: RegisterPendingPaymentInput): Promise<unknown> {
  return publicRequest<unknown>(PENDING_PAYMENTS_URL, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** PATCH /pending-payments/:id/mark-as-paid. */
export function markPendingPaymentAsPaid(paymentId: string): Promise<unknown> {
  return publicRequest<unknown>(
    `${PENDING_PAYMENTS_URL}/${encodeURIComponent(paymentId)}/mark-as-paid`,
    { method: 'PATCH' },
  );
}

/** DELETE /pending-payments/:id. */
export function deletePendingPayment(paymentId: string): Promise<unknown> {
  return publicRequest<unknown>(`${PENDING_PAYMENTS_URL}/${encodeURIComponent(paymentId)}`, {
    method: 'DELETE',
  });
}

/** Representacion REST de un pago pendiente, tal como responde el backend. */
export interface PendingPayment {
  id: string;
  name: string;
  amount: number;
  /** Fecha limite en ISO 8601. */
  dueDate: string;
  paid: boolean;
  category: PendingPaymentCategory;
}

interface ListPendingPaymentsResponse {
  pending_payments: PendingPayment[] | null;
}

/**
 * GET /pending-payments?paid=true: los gastos que ya se pagaron.
 *
 * Sin el filtro el endpoint devuelve los que siguen abiertos, que es lo que ya
 * pinta el dashboard; aqui interesa justo lo contrario.
 */
export function listPaidPendingPayments(): Promise<PendingPayment[]> {
  return publicRequest<ListPendingPaymentsResponse>(`${PENDING_PAYMENTS_URL}?paid=true`).then(
    (response) => response.pending_payments ?? [],
  );
}
