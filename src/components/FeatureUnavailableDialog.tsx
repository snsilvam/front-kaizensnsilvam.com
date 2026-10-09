import { Sparkles } from 'lucide-react';
import { buttonVariants } from './ui/button';
import { PATH_HOME } from '../lib/paths';

interface FeatureUnavailableDialogProps {
  open: boolean;
}

/**
 * Aviso de que el módulo de facturas con IA no está habilitado para el
 * usuario (el backend respondió 403). No se puede cerrar: sin acceso no hay
 * nada que hacer en la página, la única salida es volver a finanzas.
 */
export function FeatureUnavailableDialog({ open }: FeatureUnavailableDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-end justify-center bg-foreground/40 backdrop-blur-[2px] fade-in duration-150 sm:items-center sm:p-4">
      <div
        className="w-full max-w-md animate-in rounded-t-3xl border border-border bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl duration-200 slide-in-from-bottom-6 sm:rounded-2xl sm:pb-6 sm:zoom-in-95 sm:slide-in-from-bottom-0"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="feature-unavailable-title"
        aria-describedby="feature-unavailable-description"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <h2 id="feature-unavailable-title" className="mt-4 text-lg font-semibold text-foreground">
          Módulo no disponible
        </h2>
        <p id="feature-unavailable-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Las facturas con IA todavía no están habilitadas para tu cuenta. Cuando lo estén, podrás guardarlas con
          una foto desde aquí.
        </p>
        <div className="mt-6 flex sm:justify-end">
          <a href={PATH_HOME.finanzas} className={`${buttonVariants()} h-11 w-full no-underline sm:h-9 sm:w-auto`}>
            Volver a finanzas
          </a>
        </div>
      </div>
    </div>
  );
}
