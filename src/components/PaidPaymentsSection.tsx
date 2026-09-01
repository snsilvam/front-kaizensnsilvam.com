import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { formatDate, formatMoney } from '../services/format';
import {
  deletePendingPayment,
  listPaidPendingPayments,
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
      <div className="mt-8 flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          aria-expanded={open}
          aria-controls="paid-payments-panel"
          onClick={toggle}
        >
          <Trophy aria-hidden="true" />
          {open ? 'Ocultar éxitos financieros' : 'Ver éxitos financieros'}
          {open ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
        </Button>
      </div>

      {open && (
        <Card className="mt-4" id="paid-payments-panel">
          <CardHeader>
            <CardTitle className="text-lg">Éxitos financieros:</CardTitle>
            <CardDescription>Gastos que ya pagaste.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3" aria-busy="true" aria-label="Cargando gastos pagados">
                {[0, 1, 2].map((row) => (
                  <Skeleton key={row} className="h-6 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-destructive">{error}</p>
                <Button type="button" variant="outline" size="sm" onClick={load}>
                  Reintentar
                </Button>
              </div>
            ) : !items || items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no has pagado ningún gasto.</p>
            ) : (
              <>
                {deleteError && <p className="mb-3 text-sm text-destructive">{deleteError}</p>}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="py-2 pr-3 font-semibold text-muted-foreground">Nombre</th>
                        <th className="py-2 pr-3 text-right font-semibold text-muted-foreground">
                          Monto
                        </th>
                        <th className="py-2 pr-3 text-right font-semibold text-muted-foreground">
                          Fecha límite
                        </th>
                        <th className="py-2 text-right font-semibold text-muted-foreground">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((payment) => (
                        <tr key={payment.id} className="border-b border-border">
                          <td className="py-3 pr-3 font-medium text-foreground">{payment.name}</td>
                          <td className="py-3 pr-3 text-right whitespace-nowrap text-foreground">
                            {formatMoney(payment.amount, currency)}
                          </td>
                          <td className="py-3 pr-3 text-right whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(payment.dueDate)}
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="py-3 pr-3 font-semibold text-foreground">Total pagado</td>
                        <td className="py-3 pr-3 text-right font-bold whitespace-nowrap text-primary">
                          {formatMoney(total, currency)}
                        </td>
                        <td />
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

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
