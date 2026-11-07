import { History, Pencil, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { PsePayButton } from './PsePayButton';
import { DEBT_KIND_LABELS, dueText, formatMonth, formatRate, money } from '../lib/debts';
import { formatShortDate } from '../services/format';
import type { Debt } from '../types/debt';

interface DebtRowProps {
  debt: Debt;
  onPay: () => void;
  onBalance: () => void;
  onHistory: () => void;
  onEdit: () => void;
}

const STATUS_STYLES = {
  paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-muted text-muted-foreground',
  late: 'bg-destructive/10 text-destructive',
} as const;

/** Una deuda: saldo, cuota del mes, lugar en el plan y sus acciones. */
export function DebtRow({ debt, onPay, onBalance, onHistory, onEdit }: DebtRowProps) {
  const month = debt.month;

  return (
    <li className="rounded-3xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2">
            {debt.planPosition > 0 && (
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {debt.planPosition}
              </span>
            )}
            <span className="truncate font-semibold text-foreground">{debt.displayName}</span>
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {DEBT_KIND_LABELS[debt.kind]} · {debt.entityName} · {formatRate(debt.annualRate)}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Editar ${debt.displayName}`} onClick={onEdit}>
          <Pencil aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-heading text-2xl font-bold tracking-[-0.03em] tabular-nums">{money(debt.balance)}</span>
        {debt.paidOff ? (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES.paid}`}>Saldada 🎉</span>
        ) : (
          <span className="text-[0.7rem] text-muted-foreground">Saldo informado el {formatShortDate(debt.balanceUpdatedAt)}</span>
        )}
      </div>

      {month && (
        <div className="mt-3 space-y-1.5 text-sm">
          <p className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[month.status]}`}>
              {month.status === 'paid' ? 'Cuota del mes pagada' : month.status === 'late' ? 'Atrasada' : 'Pendiente'}
            </span>
            <span className="text-xs text-muted-foreground">{dueText(month.daysUntil, month.dueDate)}</span>
          </p>
          <p className="text-muted-foreground">
            Este mes el plan pide <span className="font-semibold text-foreground">{money(month.planned)}</span>
            {month.paid > 0 && <> · pagaste {money(month.paid)}</>}
            {month.remaining > 0 && month.paid > 0 && <> · faltan {money(month.remaining)}</>}
          </p>
          <p className="text-xs text-muted-foreground">
            {debt.stuck
              ? 'Con este monto no baja.'
              : debt.payoffMonth && <>Se salda en {formatMonth(debt.payoffMonth)} (estimado)</>}
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {debt.paymentUrl && !debt.paidOff ? <PsePayButton url={debt.paymentUrl} compact /> : null}
        {!debt.paidOff && (
          <Button type="button" variant="outline" className={debt.paymentUrl ? '' : 'col-span-2'} onClick={onPay}>
            Ya pagué
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onBalance}>
          <RefreshCw aria-hidden="true" />
          Actualizar saldo
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onHistory}>
          <History aria-hidden="true" />
          Historial
        </Button>
      </div>
    </li>
  );
}
