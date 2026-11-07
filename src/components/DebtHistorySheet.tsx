import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { MarketSheet } from './MarketSheet';
import { formatDay, money } from '../lib/debts';
import { listDebtPayments } from '../services/debts';
import { friendlyError } from '../hooks/useDebts';
import type { Debt, DebtPayment } from '../types/debt';

interface DebtHistorySheetProps {
  debt: Debt | null;
  saving: boolean;
  onClose: () => void;
  /** Borra el pago; responde null si salio bien o el mensaje de error. */
  onDelete: (payment: DebtPayment) => Promise<string | null>;
}

/**
 * Los pagos registrados de una deuda. Un pago anterior a la ultima
 * actualizacion del saldo ya no lo baja: queda solo como historial. Los pagos
 * no se editan; se borran y se registran de nuevo.
 */
export function DebtHistorySheet({ debt, saving, onClose, onDelete }: DebtHistorySheetProps) {
  const [payments, setPayments] = useState<DebtPayment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const debtId = debt?.id;
  useEffect(() => {
    if (!debtId) return;
    let cancelled = false;
    setPayments(null);
    setError(null);
    listDebtPayments(debtId)
      .then((list) => {
        if (!cancelled) setPayments(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(friendlyError(err, 'No pudimos cargar el historial.'));
      });
    return () => {
      cancelled = true;
    };
  }, [debtId, reloadKey]);

  async function remove(payment: DebtPayment) {
    const message = await onDelete(payment);
    setConfirming(null);
    if (message) setError(message);
    else setReloadKey((key) => key + 1);
  }

  return (
    <MarketSheet open={debt !== null} title="Historial de pagos" description={debt?.displayName} busy={saving} onClose={onClose}>
      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {payments === null && !error && <p className="text-sm text-muted-foreground">Cargando…</p>}
      {payments?.length === 0 && <p className="text-sm text-muted-foreground">Todavía no registras pagos en esta deuda.</p>}
      <ul className="divide-y divide-border">
        {payments?.map((payment) => (
          <li key={payment.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="font-semibold tabular-nums">{money(payment.amount)}</p>
              <p className="text-xs text-muted-foreground">
                {formatDay(payment.paidOn)}
                {!payment.countsInBalance && ' · ya incluido en el saldo del banco'}
              </p>
            </div>
            {confirming === payment.id ? (
              <div className="flex shrink-0 gap-1.5">
                <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => setConfirming(null)}>
                  No
                </Button>
                <Button type="button" size="sm" variant="destructive" disabled={saving} onClick={() => void remove(payment)}>
                  Borrar
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={`Borrar el pago de ${money(payment.amount)}`}
                onClick={() => setConfirming(payment.id)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </MarketSheet>
  );
}
