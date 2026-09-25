import { Check, PartyPopper, Receipt, Trash2 } from 'lucide-react';
import { dueLabel, formatMoney, type DueTone } from '../services/format';
import type { PendingItem } from '../types/dashboard';
import { Button } from './ui/button';

interface PendingListProps {
  items: PendingItem[];
  currency: string;
  payingId?: string | null;
  deletingId?: string | null;
  onMarkAsPaid?: (paymentId: string) => void;
  onDelete?: (paymentId: string) => void;
}

/** El color de la urgencia: lo vencido en rojo, lo de esta semana en ámbar. */
const TONE_STYLES: Record<DueTone, { icon: string; label: string }> = {
  overdue: { icon: 'bg-destructive-soft text-destructive', label: 'text-destructive' },
  soon: { icon: 'bg-warning-soft text-warning', label: 'text-warning' },
  later: { icon: 'bg-muted text-muted-foreground', label: 'text-muted-foreground' },
};

export function PendingList({
  items,
  currency,
  payingId,
  deletingId,
  onMarkAsPaid,
  onDelete,
}: PendingListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed px-4 py-10 text-center">
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-success-soft text-success">
          <PartyPopper className="size-5" />
        </span>
        <p className="mt-3 font-semibold text-foreground">Todo al día</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          No tienes pagos pendientes. Cuando registres uno, aparecerá aquí con su fecha límite.
        </p>
      </div>
    );
  }

  // Lo que vence primero, arriba: es lo que hay que resolver antes.
  const sorted = [...items].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <ul className="m-0 -mx-2 list-none divide-y divide-border/70 p-0">
      {sorted.map((item) => {
        const due = item.dueDate ? dueLabel(item.dueDate) : null;
        const styles = TONE_STYLES[due?.tone ?? 'later'];

        return (
          <li key={item.id} className="flex items-center gap-3 px-2 py-3">
            <span aria-hidden="true" className={`hidden size-10 shrink-0 place-items-center rounded-xl sm:grid ${styles.icon}`}>
              <Receipt className="size-[1.1rem]" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
              {due && <p className={`mt-0.5 text-xs font-medium ${styles.label}`}>{due.text}</p>}
            </div>

            {item.amount !== undefined && (
              <span className="shrink-0 text-sm font-semibold whitespace-nowrap text-foreground tabular-nums">
                {formatMoney(item.amount, currency)}
              </span>
            )}

            <span className="flex shrink-0 items-center gap-1">
              {onMarkAsPaid && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`Marcar ${item.title} como pagado`}
                  title="Marcar como pagado"
                  disabled={payingId === item.id}
                  onClick={() => onMarkAsPaid(item.id)}
                  className="hover:border-primary/40 hover:bg-accent hover:text-primary"
                >
                  <Check aria-hidden="true" />
                  <span className="hidden sm:inline">Pagar</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Eliminar ${item.title}`}
                  title="Eliminar"
                  disabled={deletingId === item.id}
                  onClick={() => onDelete(item.id)}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
