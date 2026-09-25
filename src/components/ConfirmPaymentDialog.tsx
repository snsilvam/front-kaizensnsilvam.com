import { Banknote, CircleCheck, Smartphone, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PaymentMethod } from '../services/pendingPayments';
import { Button } from './ui/button';

interface ConfirmPaymentDialogProps {
  open: boolean;
  itemName: string;
  isPaying?: boolean;
  onCancel: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void | Promise<void>;
}

export function ConfirmPaymentDialog({
  open,
  itemName,
  isPaying = false,
  onCancel,
  onConfirm,
}: ConfirmPaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (!open) setPaymentMethod(null);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-end justify-center bg-foreground/40 backdrop-blur-[2px] fade-in duration-150 sm:items-center sm:p-4">
      <div
        className="w-full max-w-md animate-in rounded-t-3xl border border-border bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl duration-200 slide-in-from-bottom-6 sm:rounded-2xl sm:pb-6 sm:zoom-in-95 sm:slide-in-from-bottom-0"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-payment-title"
        aria-describedby="confirm-payment-description"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CircleCheck className="size-5" aria-hidden="true" />
        </div>
        <h2 id="confirm-payment-title" className="mt-4 text-lg font-semibold text-foreground">
          ¿Vas a pagar este gasto?
        </h2>
        <p id="confirm-payment-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Marcaremos <span className="font-medium text-foreground">{itemName}</span> como pagado y dejará de aparecer en tus pendientes.
        </p>
        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-foreground">¿Cómo pagaste?</legend>
          <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Método de pago">
            {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => {
              const selected = paymentMethod === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPaymentMethod(value)}
                  disabled={isPaying}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 ${
                    selected
                      ? 'border-primary bg-accent text-primary ring-1 ring-primary'
                      : 'border-border text-foreground hover:border-primary/40 hover:bg-muted/60'
                  }`}
                >
                  <Icon aria-hidden="true" className="size-6" />
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-6 flex flex-col-reverse gap-2 *:h-11 sm:flex-row sm:justify-end sm:*:h-9">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPaying}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => paymentMethod && onConfirm(paymentMethod)}
            disabled={isPaying || paymentMethod === null}
          >
            {isPaying ? 'Marcando como pagado...' : 'Sí, ya lo pagué'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: LucideIcon }[] = [
  { value: 'digital', label: 'Pago digital', icon: Smartphone },
  { value: 'cash', label: 'Efectivo', icon: Banknote },
];
