import { useEffect, useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { MarketSheet } from './MarketSheet';
import { MoneyInput, parseMoney } from './MoneyInput';
import { money } from '../lib/debts';
import type { DebtSummary } from '../types/debt';

interface DebtMonthlyAmountSheetProps {
  open: boolean;
  summary: DebtSummary;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  /** null quita el monto: el plan vuelve a solo minimos. */
  onSubmit: (amount: number | null) => void | Promise<void>;
}

/** Cuanto puede poner la persona a sus deudas cada mes (FR-004). */
export function DebtMonthlyAmountSheet({ open, summary, saving, error, onCancel, onSubmit }: DebtMonthlyAmountSheetProps) {
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');
  const minimums = summary.plan.minimumsTotal;

  useEffect(() => {
    if (!open) return;
    setAmount((summary.monthlyAmount ?? summary.plan.monthlyAmount).toLocaleString('es-CO'));
    setFormError('');
  }, [open, summary.monthlyAmount, summary.plan.monthlyAmount]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = parseMoney(amount);
    if (!Number.isFinite(value) || value <= 0) return setFormError('Escribe cuánto puedes poner al mes.');
    if (value < minimums) return setFormError(`Necesitas al menos ${money(minimums)} para cubrir las cuotas mínimas.`);
    setFormError('');
    void onSubmit(value);
  }

  return (
    <MarketSheet
      open={open}
      title="¿Cuánto puedes poner al mes?"
      description={`Tus cuotas mínimas suman ${money(minimums)}. Todo lo que pongas encima va a la deuda de mayor tasa.`}
      busy={saving}
      onClose={onCancel}
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="debt-monthly">Monto mensual para deudas</Label>
          <MoneyInput id="debt-monthly" size="lg" value={amount} onChange={setAmount} autoFocus />
        </div>
        {(formError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{formError || error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-2 *:h-11">
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar monto'}
          </Button>
          {summary.monthlyAmount !== null && (
            <Button type="button" variant="ghost" disabled={saving} onClick={() => void onSubmit(null)}>
              Quitar monto (pagar solo los mínimos)
            </Button>
          )}
        </div>
      </form>
    </MarketSheet>
  );
}
