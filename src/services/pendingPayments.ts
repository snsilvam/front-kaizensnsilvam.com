import { publicRequest } from './api';

const API_BASE_URL = 'https://kaizensnsilvam-backend-778334880592.us-central1.run.app';
const PENDING_PAYMENTS_URL = `${API_BASE_URL}/pending-payments`;
const PENDING_PAYMENT_CATEGORIES_URL = `${API_BASE_URL}/pending-payment-categories`;

/**
 * Codigo canonico de una categoria. Es lo estable entre entornos: el id cambia
 * de una base a otra y el nombre lo pueden reescribir, pero el codigo no.
 * Por eso es lo unico contra lo que se puede comparar en el cliente.
 */
export type PendingPaymentCategoryCode = 'mercado' | 'otros';
export type PaymentMethod = 'digital' | 'cash';

/**
 * Una categoria del catalogo. El backend la devuelve entera dentro de cada
 * gasto, asi que no hace falta cruzarla contra la lista para pintarla.
 */
export interface PendingPaymentCategory {
  id: string;
  code: PendingPaymentCategoryCode;
  name: string;
}

export interface RegisterPendingPaymentInput {
  name: string;
  /** Lugar asociado al gasto, si el usuario desea registrarlo. */
  place?: string;
  amount: number;
  dueDate: string;
  /**
   * Opcional: sin el, el backend deja el gasto en la categoria "otros". Con la
   * categoria de codigo "mercado" el gasto ademas queda disponible en /market
   * como presupuesto de compra. Un id que no este en el catalogo es un 400.
   */
  categoryId?: string;
}

interface ListPendingPaymentCategoriesResponse {
  categories: PendingPaymentCategory[] | null;
}

/**
 * GET /pending-payment-categories: el catalogo para pintar el selector.
 *
 * Es global y de solo lectura, igual para todos los usuarios.
 */
export function listPendingPaymentCategories(): Promise<PendingPaymentCategory[]> {
  return publicRequest<ListPendingPaymentCategoriesResponse>(PENDING_PAYMENT_CATEGORIES_URL).then(
    (response) => response.categories ?? [],
  );
}

/** POST /pending-payments sin variables de entorno ni API key. */
export function registerPendingPayment(input: RegisterPendingPaymentInput): Promise<unknown> {
  return publicRequest<unknown>(PENDING_PAYMENTS_URL, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** PATCH /pending-payments/:id/mark-as-paid. */
export function markPendingPaymentAsPaid(paymentId: string, paymentMethod?: PaymentMethod): Promise<unknown> {
  return publicRequest<unknown>(
    `${PENDING_PAYMENTS_URL}/${encodeURIComponent(paymentId)}/mark-as-paid`,
    {
      method: 'PATCH',
      ...(paymentMethod ? { body: JSON.stringify({ paymentMethod }) } : {}),
    },
  );
}

/**
 * PATCH /pending-payments/:id/mark-as-market-budget.
 *
 * Deja el gasto en la categoria "mercado", que es lo que lo vuelve un
 * presupuesto de compra. Es como el modulo de mercado deja elegir un gasto ya
 * registrado sin obligar a crearlo de nuevo.
 */
export function markPendingPaymentAsMarketBudget(paymentId: string): Promise<unknown> {
  return publicRequest<unknown>(
    `${PENDING_PAYMENTS_URL}/${encodeURIComponent(paymentId)}/mark-as-market-budget`,
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
  paymentMethod?: PaymentMethod;
  amount: number;
  /** Fecha limite en ISO 8601. */
  dueDate: string;
  paid: boolean;
  /**
   * La categoria ya resuelta. Puede faltar en un gasto guardado antes de que
   * existiera el catalogo, asi que quien la lea debe contar con eso.
   */
  category: PendingPaymentCategory | null;
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

/**
 * GET /pending-payments: los gastos que siguen abiertos.
 *
 * Es el mismo endpoint de listPaidPendingPayments sin el filtro; aqui interesan
 * los que todavia se deben, para poder elegir uno como presupuesto de mercado.
 */
export function listOpenPendingPayments(): Promise<PendingPayment[]> {
  return publicRequest<ListPendingPaymentsResponse>(PENDING_PAYMENTS_URL).then(
    (response) => response.pending_payments ?? [],
  );
}
