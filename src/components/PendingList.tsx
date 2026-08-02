import { Fragment } from 'react';
import { formatDate, formatMoney } from '../services/format';
import type { PendingItem } from '../types/dashboard';
import { Separator } from './ui/separator';

interface PendingListProps {
  items: PendingItem[];
  currency: string;
}

export function PendingList({ items, currency }: PendingListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin pendientes.</p>;
  }

  return (
    <ul className="m-0 list-none p-0">
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <li className="flex items-start justify-between gap-3 py-3 text-sm">
            <span className="font-medium text-foreground">{item.title}</span>
            <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
              {item.amount !== undefined && formatMoney(item.amount, currency)}
              {item.dueDate && ` · ${formatDate(item.dueDate)}`}
            </span>
          </li>
          {index < items.length - 1 && <Separator />}
        </Fragment>
      ))}
    </ul>
  );
}
