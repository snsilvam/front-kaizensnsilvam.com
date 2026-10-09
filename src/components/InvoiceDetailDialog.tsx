import { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { issuerLabel } from './InvoiceList';
import { formatDate, formatDateOnly, formatMoney } from '../services/format';
import type { Invoice } from '../types/invoice';

interface InvoiceDetailDialogProps {
  invoice: Invoice | null;
  currency: string;
  onClose: () => void;
  onDelete: (invoice: Invoice) => void;
}

/**
 * Detalle de una factura: lo que leyó el modelo. La foto no se guarda, así
 * que si algo quedó mal leído se borra y se vuelve a capturar.
 */
export function InvoiceDetailDialog({ invoice, currency, onClose, onDelete }: InvoiceDetailDialogProps) {
  useEffect(() => {
    if (!invoice) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [invoice, onClose]);

  if (!invoice) return null;

  const money = (amount: number) => formatMoney(amount, currency);

  return (
    <div
      className="fixed inset-0 z-50 flex animate-in items-end justify-center bg-foreground/40 backdrop-blur-[2px] fade-in duration-150 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg animate-in flex-col rounded-t-3xl border border-border bg-card shadow-2xl duration-200 slide-in-from-bottom-6 sm:rounded-2xl sm:zoom-in-95 sm:slide-in-from-bottom-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border/70 p-5">
          <div className="min-w-0">
            <h2 id="invoice-detail-title" className="truncate text-lg font-semibold text-foreground">
              {issuerLabel(invoice)}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {invoice.issuedOn ? formatDateOnly(invoice.issuedOn) : 'Sin fecha'}
              {invoice.invoiceNumber && ` · ${invoice.invoiceNumber}`}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Cerrar" onClick={onClose}>
            <X aria-hidden="true" />
          </Button>
        </header>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Field label="NIT" value={invoice.issuerTaxId || '—'} />
            <Field label="Número" value={invoice.invoiceNumber || '—'} />
            <Field label="Subtotal" value={invoice.subtotal ? money(invoice.subtotal) : '—'} />
            <Field label="Impuestos" value={invoice.tax ? money(invoice.tax) : '—'} />
            <div className="col-span-2 rounded-xl bg-muted/60 px-3 py-2.5">
              <dt className="text-xs text-muted-foreground">Total</dt>
              <dd className="m-0 text-xl font-bold text-foreground tabular-nums">{money(invoice.total)}</dd>
            </div>
            {invoice.cufe && (
              <div className="col-span-2 min-w-0">
                <dt className="text-xs text-muted-foreground">CUFE</dt>
                <dd className="m-0 truncate font-mono text-xs text-foreground" title={invoice.cufe}>
                  {invoice.cufe}
                </dd>
              </div>
            )}
          </dl>

          {invoice.items.length > 0 && (
            <section aria-labelledby="invoice-items-title">
              <h3 id="invoice-items-title" className="mb-2 text-sm font-semibold text-foreground">
                Detalle ({invoice.items.length})
              </h3>
              <ul className="m-0 list-none divide-y divide-border/70 p-0">
                {invoice.items.map((item, index) => (
                  <li key={index} className="flex items-start justify-between gap-3 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block text-foreground">{item.description || 'Producto'}</span>
                      {item.quantity > 0 && item.unitPrice > 0 && (
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          {item.quantity.toLocaleString('es-CO')} × {money(item.unitPrice)}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-medium text-foreground tabular-nums">{money(item.total)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-xs text-muted-foreground">
            Leída por {invoice.extractionModel} el {formatDate(invoice.createdAt)}. Si algo quedó mal leído, elimínala
            y vuelve a tomar la foto.
          </p>
        </div>

        <footer className="flex justify-end border-t border-border/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(invoice)}
          >
            <Trash2 aria-hidden="true" />
            Eliminar factura
          </Button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="m-0 truncate font-medium text-foreground tabular-nums">{value}</dd>
    </div>
  );
}
