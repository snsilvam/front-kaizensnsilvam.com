import { useState, type FormEvent } from 'react';
import { Swords } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { WINTER_ARC_MAX_COMMITMENT } from '../types/winterArc';

interface WinterArcCommitmentDialogProps {
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (commitment: string) => void | Promise<void>;
  /** Textos del modal; por defecto, los del último paso del setup. */
  eyebrow?: string;
  description?: string;
  submitLabel?: string;
  submittingLabel?: string;
}

const SETUP_DESCRIPTION =
  'Al comenzar, tu cuerpo deja de ser una máquina de placer y se activa como samurái. Escribe por qué: es el ' +
  'propósito de tus 90 días y lo verás cada día del reto.';

/**
 * El juramento: la respuesta a "¿Cuál es tu compromiso con tu yo de enero?".
 * Es el último paso antes de iniciar el Winter Arc y también el compromiso de
 * cada mes del reto (WinterArcCommitments), que cambia los textos por props.
 * Se monta al abrirse, así que arranca vacío en cada apertura; si guardar
 * falla, el texto se queda. Sin respuesta no se puede confirmar.
 */
export function WinterArcCommitmentDialog({
  submitting,
  error,
  onClose,
  onConfirm,
  eyebrow = 'Paso 2 de 2 · El juramento',
  description = SETUP_DESCRIPTION,
  submitLabel = 'Activar modo samurái',
  submittingLabel = 'Activando...',
}: WinterArcCommitmentDialogProps) {
  const [commitment, setCommitment] = useState('');
  const trimmed = commitment.trim();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmed || submitting) return;
    void onConfirm(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="winter-arc-commitment-title"
        aria-describedby="winter-arc-commitment-description"
      >
        <div
          lang="ja"
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-full bg-[#0b1624] text-lg font-bold text-[#cfe8f5] shadow-md shadow-[#7cc4e8]/40"
        >
          侍
        </div>
        <p className="mt-4 text-[0.62rem] font-semibold tracking-[0.22em] text-[#1d6a8f] uppercase">{eyebrow}</p>
        <h2 id="winter-arc-commitment-title" className="mt-1.5 text-lg font-semibold text-foreground">
          ¿Cuál es tu compromiso con tu yo de enero?
        </h2>
        <p id="winter-arc-commitment-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <form className="mt-5 grid gap-5" onSubmit={submit}>
          <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="winter-arc-commitment">Tu compromiso</Label>
              <span className="text-xs text-muted-foreground">
                {commitment.length}/{WINTER_ARC_MAX_COMMITMENT}
              </span>
            </div>
            <textarea
              id="winter-arc-commitment"
              value={commitment}
              onChange={(event) => setCommitment(event.target.value.slice(0, WINTER_ARC_MAX_COMMITMENT))}
              maxLength={WINTER_ARC_MAX_COMMITMENT}
              rows={4}
              required
              autoFocus
              disabled={submitting}
              placeholder="En enero quiero mirarme y saber que..."
              className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            />
          </div>

          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Volver
            </Button>
            <Button type="submit" disabled={!trimmed || submitting}>
              <Swords aria-hidden="true" />
              {submitting ? submittingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
