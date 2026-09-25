import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface ConfirmDeleteDialogProps {
  open: boolean;
  itemName: string;
  itemType: string;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDeleteDialog({
  open,
  itemName,
  itemType,
  isDeleting = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-end justify-center bg-foreground/40 backdrop-blur-[2px] fade-in duration-150 sm:items-center sm:p-4">
      <div
        className="w-full max-w-md animate-in rounded-t-3xl border border-border bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl duration-200 slide-in-from-bottom-6 sm:rounded-2xl sm:pb-6 sm:zoom-in-95 sm:slide-in-from-bottom-0"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-5" aria-hidden="true" />
        </div>
        <h2 id="confirm-delete-title" className="mt-4 text-lg font-semibold text-foreground">
          ¿Eliminar {itemType}?
        </h2>
        <p id="confirm-delete-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Vas a eliminar <span className="font-medium text-foreground">{itemName}</span>. Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 *:h-11 sm:flex-row sm:justify-end sm:*:h-9">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : `Eliminar ${itemType}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
