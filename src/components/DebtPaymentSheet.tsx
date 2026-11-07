import { useEffect, useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MarketSheet } from './MarketSheet';
import { MoneyInput, parseMoney } from './MoneyInput';
import { money, todayInBogota } from '../lib/debts';
import type { Debt } from '../types/debt';

interface DebtPaymentSheetProps {
  debt: Debt | null;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (amount: number, paidOn: string) => void | Promise<void>;
}

/** Lo que el plan pide este mes y todavia falta; si no falta nada, la cuota. */
function proposedAmount(debt: Debt): number {
  const remaining = debt.month?.remaining ?? 0;
  return Math.min(remaining > 0 ? remaining : debt.minimumPayment, debt.balance);
}

/**
 * "Ya pagué": registra un pago que la persona ya hizo en su entidad. El monto
 * viene listo y la fecha es hoy; puede elegir un dia anterior, pero no antes de
 * la ultima actualizacion del saldo (ese pago ya esta en el saldo del banco).
 */
export function DebtPaymentSheet({ debt, saving, error, onCancel, onSubmit }: DebtPaymentSheetProps) {
  const [amount, setAmount] = useState('');
  const [paidOn, setPaidOn] = useState('');
  const [formError, setFormError] = useState('');
  const today = todayInBogota();
  const minDay = debt ? todayInBogota(new Date(debt.balanceUpdatedAt)) : today;

  const debtId = debt?.id;
  useEffect(() => {
    if (!debt) return;
    setAmount(proposedAmount(debt).toLocaleString('es-CO'));
    setPaidOn(todayInBogota());
    setFormError('');
  }, [debtId]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!debt) return;
    const value = parseMoney(amount);
    if (!Number.isFinite(value) || value <= 0) return setFormError('Escribe cuánto pagaste.');
    if (value > debt.balance) return setFormError('El pago es mayor que el saldo. Si pagaste más, actualiza el saldo.');
    if (!paidOn || paidOn > today || paidOn < minDay) return setFormError('Elige una fecha entre la del saldo y hoy.');
    setFormError('');
    void onSubmit(value, paidOn);
  }

  return (
    <MarketSheet
      open={debt !== null}
      title="Ya pagué"
      description={debt ? `${debt.displayName} · debes ${money(debt.balance)}` : undefined}
      busy={saving}
      onClose={onCancel}
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="debt-pay-amount">¿Cuánto pagaste?</Label>
          <MoneyInput id="debt-pay-amount" size="lg" value={amount} onChange={setAmount} autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="debt-pay-date">Fecha del pago</Label>
          <Input id="debt-pay-date" type="date" min={minDay} max={today} value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
        </div>
        {(formError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{formError || error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? 'Guardando…' : 'Registrar pago'}
        </Button>
      </form>
    </MarketSheet>
  );
}
