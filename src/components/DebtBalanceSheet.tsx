import { useEffect, useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { MarketSheet } from './MarketSheet';
import { MoneyInput, parseMoney } from './MoneyInput';
import type { Debt } from '../types/debt';

interface DebtBalanceSheetProps {
  debt: Debt | null;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (balance: number) => void | Promise<void>;
}

/**
 * El saldo que dice el banco. Corrige lo que el plan estima (intereses,
 * seguros, compras nuevas). 0 deja la deuda saldada; mas de 0 en una saldada
 * la vuelve a activar.
 */
export function DebtBalanceSheet({ debt, saving, error, onCancel, onSubmit }: DebtBalanceSheetProps) {
  const [balance, setBalance] = useState('');
  const [formError, setFormError] = useState('');

  const debtId = debt?.id;
  useEffect(() => {
    if (!debt) return;
    setBalance(debt.balance.toLocaleString('es-CO'));
    setFormError('');
  }, [debtId]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = balance === '' ? Number.NaN : parseMoney(balance);
    if (!Number.isFinite(value) || value < 0) return setFormError('Escribe el saldo que dice tu banco (puede ser 0).');
    setFormError('');
    void onSubmit(value);
  }

  return (
    <MarketSheet
      open={debt !== null}
      title="Actualizar saldo"
      description="Pon el saldo que dice tu extracto o la app de tu banco. Los pagos que ya registraste quedan en el historial."
      busy={saving}
      onClose={onCancel}
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="debt-new-balance">{debt?.displayName ?? 'Saldo'}</Label>
          <MoneyInput id="debt-new-balance" size="lg" value={balance} onChange={setBalance} autoFocus />
        </div>
        {(formError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{formError || error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar saldo'}
        </Button>
      </form>
    </MarketSheet>
  );
}
