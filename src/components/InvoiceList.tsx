import { ChevronRight, ReceiptText } from 'lucide-react';
import { formatDateOnly, formatMoney } from '../services/format';
import type { Invoice } from '../types/invoice';

interface InvoiceListProps {
  items: Invoice[];
  currency: string;
  onSelect: (invoice: Invoice) => void;
}

/** El nombre que se muestra cuando el modelo no pudo leer el emisor. */
export function issuerLabel(invoice: Invoice): string {
  return invoice.issuerName || 'Comercio sin nombre';
}

/** Lista de facturas guardadas; cada una abre su detalle con la foto. */
export function InvoiceList({ items, currency, onSelect }: InvoiceListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        Aún no tienes facturas. Toma una foto de la próxima que recibas y aparecerá aquí.
      </p>
    );
  }

  return (
    <ul className="m-0 -mx-2 list-none divide-y divide-border/70 p-0">
      {items.map((invoice) => (
        <li key={invoice.id}>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            onClick={() => onSelect(invoice)}
          >
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary"
            >
              <ReceiptText className="size-[1.1rem]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{issuerLabel(invoice)}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {invoice.issuedOn ? formatDateOnly(invoice.issuedOn) : 'Sin fecha'}
                {invoice.invoiceNumber && ` · ${invoice.invoiceNumber}`}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold whitespace-nowrap text-foreground tabular-nums">
              {formatMoney(invoice.total, currency)}
            </span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </li>
      ))}
    </ul>
  );
}
