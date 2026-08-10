import { publicRequest } from './api';

const PENDING_PAYMENTS_URL = 'https://kaizensnsilvam-backend-778334880592.us-central1.run.app/pending-payments';

export interface RegisterPendingPaymentInput {
  name: string;
  amount: number;
  dueDate: string;
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
