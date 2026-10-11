import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface MarketSheetProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  /** Mientras se guarda no se puede cerrar: la respuesta cambia la pantalla. */
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Hoja que sube desde abajo en movil, donde llega el pulgar, y dialogo
 * centrado en escritorio. Es la misma piel de los dialogos de confirmacion,
 * pero para formularios cortos del mercado: se cierra con Escape, con la X o
 * tocando fuera.
 */
export function MarketSheet({ open, title, description, busy = false, onClose, children }: MarketSheetProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-in items-end justify-center bg-foreground/40 backdrop-blur-[2px] fade-in duration-150 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="max-h-[92dvh] w-full max-w-md animate-in overflow-y-auto overscroll-contain rounded-t-3xl border border-border bg-card px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl duration-200 slide-in-from-bottom-6 sm:rounded-2xl sm:p-6 sm:zoom-in-95 sm:slide-in-from-bottom-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="-mt-1 -mr-2 text-muted-foreground"
            aria-label="Cerrar"
            disabled={busy}
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
