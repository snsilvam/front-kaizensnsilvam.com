import { ShoppingCart, TriangleAlert } from 'lucide-react';
import { Button } from './ui/button';

interface ConfirmMarketBudgetDialogProps {
  open: boolean;
  itemName: string;
  isChoosing?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

/**
 * Confirmacion para usar un gasto como presupuesto de mercado.
 *
 * Elegir el gasto equivocado no se puede deshacer desde la app: la categoria
 * "mercado" se escribe en la base y no hay forma de devolver el gasto a la
 * anterior sin borrarlo. Por eso el aviso es explicito y no una linea mas del
 * texto: la decision es de una sola via y el usuario tiene que verlo antes de
 * confirmar, no despues.
 */
export function ConfirmMarketBudgetDialog({
  open,
  itemName,
  isChoosing = false,
  onCancel,
  onConfirm,
}: ConfirmMarketBudgetDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-market-budget-title"
        aria-describedby="confirm-market-budget-description"
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingCart className="size-5" aria-hidden="true" />
        </div>
        <h2 id="confirm-market-budget-title" className="mt-4 text-lg font-semibold text-foreground">
          ¿Comprar con este gasto?
        </h2>
        <p
          id="confirm-market-budget-description"
          className="mt-2 text-sm leading-relaxed text-muted-foreground"
        >
          Vas a usar <span className="font-medium text-foreground">{itemName}</span> como
          presupuesto de esta compra.
        </p>

        <div className="mt-4 flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="text-sm leading-relaxed text-foreground">
            <p className="font-semibold">Esto no se puede deshacer</p>
            <p className="mt-1 text-muted-foreground">
              El gasto queda relacionado al mercado de forma permanente: pasa a{' '}
              <span className="font-medium text-foreground">Presupuestos de mercado</span> y no
              podrás devolverlo a su categoría anterior. La única forma de revertirlo es eliminar el
              gasto.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isChoosing}>
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isChoosing}>
            {isChoosing ? 'Preparando...' : 'Sí, comprar con este'}
          </Button>
        </div>
      </div>
    </div>
  );
}
