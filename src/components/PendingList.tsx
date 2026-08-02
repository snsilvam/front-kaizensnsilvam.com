import { formatDate, formatMoney } from '../services/format';
import type { PendingItem } from '../types/dashboard';

interface PendingListProps {
  items: PendingItem[];
  currency: string;
}

export function PendingList({ items, currency }: PendingListProps) {
  if (items.length === 0) {
    return <p className="state">Sin pendientes.</p>;
  }

  return (
    <ul className="pending-list">
      {items.map((item) => (
        <li key={item.id}>
          <span>{item.title}</span>
          <span className="pending-meta">
            {item.amount !== undefined && formatMoney(item.amount, currency)}
            {item.dueDate && ` · ${formatDate(item.dueDate)}`}
          </span>
        </li>
      ))}
    </ul>
  );
}
