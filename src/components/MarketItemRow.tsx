import { Check, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPesos } from '../lib/marketList';
import type { MarketItem } from '../types/market';

interface MarketItemRowProps {
  item: MarketItem;
  /** Este producto esta guardandose. */
  busy: boolean;
  /** Hay otra accion en vuelo o la lista esta cerrada. */
  disabled: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

/** "3 × $4.500" o, sin precio, "3 unidades · sin precio". */
function detailOf(item: MarketItem): string {
  const unit = item.purchased ? item.price : item.estimatedUnitPrice;
  if (unit > 0) return `${item.quantity} × ${formatPesos(unit)}`;
  return `${item.quantity} ${item.quantity === 1 ? 'unidad' : 'unidades'} · sin precio`;
}

/**
 * Un producto de la lista. El circulo de la izquierda es el gesto principal
 * (echar al carro o devolverlo) y tiene el tamano de un dedo; el resto de la
 * fila abre la edicion. Nada depende del hover.
 */
export function MarketItemRow({ item, busy, disabled, onToggle, onEdit }: MarketItemRowProps) {
  // Contra lo estimado solo se compara si hubo estimado.
  const difference =
    item.purchased && item.estimatedUnitPrice > 0
      ? (item.price - item.estimatedUnitPrice) * item.quantity
      : 0;

  return (
    <li className="flex items-center gap-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.purchased}
        aria-label={item.purchased ? `Devolver ${item.name} a la lista` : `Echar ${item.name} al carro`}
        disabled={disabled || busy}
        onClick={onToggle}
        className="grid size-11 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait"
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid size-7 place-items-center rounded-full border-2 transition-colors',
            item.purchased
              ? 'border-success bg-success text-white'
              : 'border-muted-foreground/45 bg-card text-transparent',
          )}
        >
          {busy ? (
            <LoaderCircle className={cn('size-4 animate-spin', item.purchased ? 'text-white' : 'text-muted-foreground')} />
          ) : (
            <Check className="size-4" strokeWidth={3} />
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        className="flex min-h-14 min-w-0 flex-1 items-center justify-between gap-3 rounded-lg py-2 pr-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default"
      >
        <span className="min-w-0">
          <span
            className={cn(
              'block truncate text-[0.95rem] font-semibold',
              item.purchased ? 'text-muted-foreground line-through decoration-muted-foreground/40' : 'text-foreground',
            )}
          >
            {item.name}
          </span>
          <span className="block text-xs text-muted-foreground tabular-nums">{detailOf(item)}</span>
        </span>
        <span className="shrink-0 text-right tabular-nums">
          <span className={cn('block text-sm font-semibold', item.purchased ? 'text-foreground' : 'text-muted-foreground')}>
            {item.total > 0 ? formatPesos(item.total) : '—'}
          </span>
          {difference !== 0 && (
            <span className={cn('block text-[0.7rem] font-medium', difference > 0 ? 'text-warning' : 'text-success')}>
              {difference > 0 ? '+' : '−'}
              {formatPesos(Math.abs(difference))}
            </span>
          )}
        </span>
        <span className="sr-only">. Editar</span>
      </button>
    </li>
  );
}
