import { CircleCheck } from 'lucide-react';
import { Button } from './ui/button';

interface ConfirmPaymentDialogProps {
  open: boolean;
  itemName: string;
  isPaying?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmPaymentDialog({
  open,
  itemName,
  isPaying = false,
  onCancel,
  onConfirm,
}: ConfirmPaymentDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-payment-title"
        aria-describedby="confirm-payment-description"
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CircleCheck className="size-5" aria-hidden="true" />
        </div>
        <h2 id="confirm-payment-title" className="mt-4 text-lg font-semibold text-foreground">
          ¿Vas a pagar este gasto?
        </h2>
        <p id="confirm-payment-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Marcaremos <span className="font-medium text-foreground">{itemName}</span> como pagado y dejará de aparecer en tus pendientes.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPaying}>
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isPaying}>
            {isPaying ? 'Marcando como pagado...' : 'Sí, ya lo pagué'}
          </Button>
        </div>
      </div>
    </div>
  );
}
