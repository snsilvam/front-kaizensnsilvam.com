import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { formatDate, formatMoney } from '../services/format';
import type { PendingItem } from '../types/dashboard';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface PendingListProps {
  items: PendingItem[];
  currency: string;
  payingId?: string | null;
  onMarkAsPaid?: (paymentId: string) => void;
}

export function PendingList({ items, currency, payingId, onMarkAsPaid }: PendingListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin pendientes.</p>;
  }

  return (
    <ul className="m-0 list-none p-0">
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <li className="flex items-start justify-between gap-3 py-3 text-sm">
            <span className="min-w-0 font-medium text-foreground">{item.title}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {item.amount !== undefined && formatMoney(item.amount, currency)}
                {item.dueDate && ` · ${formatDate(item.dueDate)}`}
              </span>
              {onMarkAsPaid && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Marcar ${item.title} como pagado`}
                  title="Marcar como pagado"
                  disabled={payingId === item.id}
                  onClick={() => onMarkAsPaid(item.id)}
                >
                  <Check aria-hidden="true" />
                </Button>
              )}
            </span>
          </li>
          {index < items.length - 1 && <Separator />}
        </Fragment>
      ))}
    </ul>
  );
}
