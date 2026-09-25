import { useState } from 'react';
import { ChevronDown, ChevronUp, CircleCheck, Trash2, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { formatMoney, formatShortDate } from '../services/format';
import {
  deletePendingPayment,
  listPaidPendingPayments,
  type PaymentMethod,
  type PendingPayment,
} from '../services/pendingPayments';

interface PaidPaymentsSectionProps {
  currency: string;
}

/**
 * Los gastos que ya se pagaron, detras de un boton.
 *
 * Se piden solo cuando el usuario abre la tabla: el resumen del dashboard no
 * los necesita y no vale la pena una llamada extra en cada carga.
 */
export function PaidPaymentsSection({ currency }: PaidPaymentsSectionProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PendingPayment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<PendingPayment | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      setItems(await listPaidPendingPayments());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos cargar tus éxitos financieros.',
      );
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    // Se carga la primera vez que se abre, y se reintenta si quedó en error.
    if (next && (items === null || error)) void load();
  }

  /**
   * Borra el gasto y lo quita de la tabla sin volver a pedir la lista: esta
   * seccion es la unica que la tiene, asi que basta con sacarlo del estado.
   */
  async function handleDelete(paymentId: string) {
    setDeletingId(paymentId);
    setDeleteError(null);

    try {
      await deletePendingPayment(paymentId);
      setItems((current) => (current ?? []).filter((payment) => payment.id !== paymentId));
      setPaymentToDelete(null);
    } catch (requestError) {
      setDeleteError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible eliminar el gasto pagado.',
      );
    } finally {
      setDeletingId(null);
    }
  }

  const total = (items ?? []).reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <section className="mt-4 overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border">
        <button
          type="button"
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
          aria-expanded={open}
          aria-controls="paid-payments-panel"
          onClick={toggle}
        >
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Trophy className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-foreground">Éxitos financieros</span>
            <span className="block text-sm text-muted-foreground">
              {open ? 'Lo que ya pagaste.' : 'Mira todo lo que ya pagaste.'}
            </span>
          </span>
          {open ? (
            <ChevronUp aria-hidden="true" className="size-5 text-muted-foreground" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-5 text-muted-foreground" />
          )}
        </button>

        {open && (
          <div id="paid-payments-panel" className="border-t px-5 pt-2 pb-5">
            {loading ? (
              <div className="space-y-3 pt-3" aria-busy="true" aria-label="Cargando gastos pagados">
                {[0, 1, 2].map((row) => (
                  <Skeleton key={row} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-start gap-3 pt-3">
                <p className="text-sm text-destructive">{error}</p>
                <Button type="button" variant="outline" size="sm" onClick={load}>
                  Reintentar
                </Button>
              </div>
            ) : !items || items.length === 0 ? (
              <p className="pt-3 text-sm text-muted-foreground">
                Todavía no has pagado ningún gasto. El primero que marques como pagado aparecerá aquí.
              </p>
            ) : (
              <>
                {deleteError && <p className="mt-3 text-sm text-destructive">{deleteError}</p>}
                <ul className="m-0 -mx-2 list-none divide-y divide-border/70 p-0">
                  {items.map((payment) => (
                    <li key={payment.id} className="flex items-center gap-3 px-2 py-3">
                      <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-success" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{payment.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[
                            payment.paymentMethod ? PAYMENT_METHOD_LABELS[payment.paymentMethod] : null,
                            `límite ${formatShortDate(payment.dueDate)}`,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold whitespace-nowrap text-foreground tabular-nums">
                        {formatMoney(payment.amount, currency)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Eliminar ${payment.name}`}
                        title="Eliminar"
                        disabled={deletingId === payment.id}
                        onClick={() => {
                          setDeleteError(null);
                          setPaymentToDelete(payment);
                        }}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-baseline justify-between rounded-xl bg-success-soft px-4 py-3">
                  <span className="text-sm font-semibold text-foreground">Total pagado</span>
                  <span className="text-lg font-bold text-success tabular-nums">{formatMoney(total, currency)}</span>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <ConfirmDeleteDialog
        open={paymentToDelete !== null}
        itemName={paymentToDelete?.name ?? 'este gasto pagado'}
        itemType="gasto"
        isDeleting={deletingId === paymentToDelete?.id}
        onCancel={() => setPaymentToDelete(null)}
        onConfirm={() => {
          if (!paymentToDelete) return;
          void handleDelete(paymentToDelete.id);
        }}
      />
    </>
  );
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  digital: 'Pago digital',
  cash: 'Efectivo',
};
