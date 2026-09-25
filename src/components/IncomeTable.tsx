import { ArrowDownLeft, Clock, Trash2 } from 'lucide-react';
import { calendarDaysUntil, daysLabel, formatMoney, formatShortDate } from '../services/format';
import type { Income } from '../types/income';
import { Button } from './ui/button';

interface IncomeTableProps {
  items: Income[];
  currency: string;
  deletingId?: string | null;
  onDelete?: (incomeId: string) => void;
}

/** Lista de ingresos: los que vienen en camino se distinguen de los ya recibidos. */
export function IncomeTable({ items, currency, deletingId, onDelete }: IncomeTableProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        Aún no registras ingresos. El primero que anotes aparecerá aquí.
      </p>
    );
  }

  const total = items.reduce((sum, income) => sum + income.amount, 0);

  return (
    <>
      <ul className="m-0 -mx-2 list-none divide-y divide-border/70 p-0">
        {items.map((income) => {
          const days = calendarDaysUntil(income.date);
          const upcoming = days !== null && days > 0;

          return (
            <li key={income.id} className="flex items-center gap-3 px-2 py-3">
              <span
                aria-hidden="true"
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                  upcoming ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success'
                }`}
              >
                {upcoming ? <Clock className="size-[1.1rem]" /> : <ArrowDownLeft className="size-[1.1rem]" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{income.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {upcoming
                    ? `Llega en ${daysLabel(days)} · ${formatShortDate(income.date)}`
                    : `Recibido el ${formatShortDate(income.date)}`}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold whitespace-nowrap text-success tabular-nums">
                +{formatMoney(income.amount, currency)}
              </span>
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Eliminar ${income.name}`}
                  title="Eliminar"
                  disabled={deletingId === income.id}
                  onClick={() => onDelete(income.id)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex items-baseline justify-between rounded-xl bg-muted/70 px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">Total registrado</span>
        <span className="text-lg font-bold text-foreground tabular-nums">{formatMoney(total, currency)}</span>
      </div>
    </>
  );
}
