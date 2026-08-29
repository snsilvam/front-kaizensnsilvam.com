import { useState } from 'react';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { formatDate, formatMoney } from '../services/format';
import { listPaidPendingPayments, type PendingPayment } from '../services/pendingPayments';

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
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 pr-3 font-semibold text-muted-foreground">Nombre</th>
                      <th className="py-2 pr-3 text-right font-semibold text-muted-foreground">
                        Monto
                      </th>
                      <th className="py-2 text-right font-semibold text-muted-foreground">
                        Fecha límite
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
                        <td className="py-3 text-right whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(payment.dueDate)}
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
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
