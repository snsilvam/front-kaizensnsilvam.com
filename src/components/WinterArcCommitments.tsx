import { useState } from 'react';
import { PenLine } from 'lucide-react';
import { WinterArcCommitmentDialog } from './WinterArcCommitmentDialog';
import { Button } from './ui/button';
import { monthName } from '../lib/habitDates';
import { cn } from '../lib/utils';
import { WINTER_ARC_SEASON_ENDS_ON } from '../lib/winterArcSeason';
import { ApiError } from '../services/api';
import { addWinterArcCommitment } from '../services/winterArc';
import type { WinterArcCommitment, WinterArcGrid } from '../types/winterArc';

interface WinterArcCommitmentsProps {
  grid: WinterArcGrid;
  /** Se guardó (o se intentó guardar) el compromiso del mes: hay que recargar el grid. */
  onAdded?: () => void;
}

/**
 * Los compromisos del reto con su yo de enero, uno por mes. El historial sólo
 * crece: ninguno se edita ni se borra.
 *
 * Con el reto activo, el del mes en curso va destacado y, si todavía no lo
 * escribió, una invitación de un toque abre el juramento del mes; debajo, los
 * de los meses anteriores. Con el reto terminado, todos en orden de mes, sin
 * opción de escribir otro.
 *
 * El mes en curso sale del `today` del servidor (Bogotá), no del reloj del
 * navegador. Si el backend todavía no manda `commitments`, no pinta nada.
 */
export function WinterArcCommitments({ grid, onAdded }: WinterArcCommitmentsProps) {
  const commitments = grid.commitments ?? [];

  if (grid.status !== 'active') return <CommitmentHistory commitments={commitments} />;
  return <MonthlyCommitment grid={grid} commitments={commitments} onAdded={onAdded} />;
}

function MonthlyCommitment({
  grid,
  commitments,
  onAdded,
}: {
  grid: WinterArcGrid;
  commitments: WinterArcCommitment[];
  onAdded?: () => void;
}) {
  const [writing, setWriting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const month = grid.today.slice(0, 7);
  const name = monthName(month);
  const current = commitments.find((commitment) => commitment.month === month);
  const previous = commitments.filter((commitment) => commitment.month !== month).reverse();
  // Sólo se escribe el del mes en curso, y no después de la temporada.
  const canWrite = !current && grid.today <= WINTER_ARC_SEASON_ENDS_ON;

  if (!current && !canWrite && previous.length === 0) return null;

  function open() {
    setError(null);
    setWriting(true);
  }

  function close() {
    if (saving) return;
    setWriting(false);
    setError(null);
  }

  async function save(text: string) {
    setSaving(true);
    setError(null);
    try {
      await addWinterArcCommitment(grid.id, text);
      setWriting(false);
      onAdded?.();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        // Otro dispositivo lo escribió primero o el reto ya terminó: el grid recargado lo muestra.
        setError(`Ya no puedes escribir este compromiso: ${name} ya tiene uno o tu Winter Arc terminó.`);
        onAdded?.();
      } else if (err instanceof ApiError && err.status === 400) {
        setError('Escribe tu compromiso: no puede quedar vacío ni pasar de 500 caracteres.');
      } else {
        setError('No pudimos guardar tu compromiso. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-label="Tus compromisos con tu yo de enero" className="grid gap-4">
      {current ? (
        <CommitmentQuote label={`Tu compromiso de ${name}`} text={current.commitment} />
      ) : (
        canWrite && (
          <div className="grid gap-3 rounded-xl border border-dashed border-[#7cc4e8] bg-[#7cc4e8]/10 p-4">
            <div className="grid gap-1">
              <p className="text-[0.62rem] font-semibold tracking-[0.22em] text-[#1d6a8f] uppercase">
                Nuevo mes · {name}
              </p>
              <p className="text-sm font-medium">Renueva tu juramento con tu yo de enero.</p>
              <p className="text-sm text-muted-foreground">
                {previous.length > 0
                  ? `Escribe tu compromiso de ${name}. El de ${monthName(previous[0].month)} se queda en tu historial.`
                  : `Escribe tu compromiso de ${name}: lo verás cada día del mes.`}
              </p>
            </div>
            <Button type="button" className="w-full sm:w-fit" onClick={open}>
              <PenLine aria-hidden="true" />
              Escribir mi compromiso de {name}
            </Button>
          </div>
        )
      )}

      {previous.length > 0 && (
        <div className="grid gap-3">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">Meses anteriores</p>
          <ul className="grid gap-3">
            {previous.map((commitment) => (
              <li key={commitment.month}>
                <CommitmentQuote label={monthName(commitment.month)} text={commitment.commitment} muted />
              </li>
            ))}
          </ul>
        </div>
      )}

      {writing && (
        <WinterArcCommitmentDialog
          submitting={saving}
          error={error}
          onClose={close}
          onConfirm={save}
          eyebrow={`El juramento de ${name}`}
          description={`Cada mes del reto renuevas tu compromiso. Este será el de ${name}: se suma a tu historial y no se puede cambiar después.`}
          submitLabel="Jurar mi compromiso"
          submittingLabel="Guardando..."
        />
      )}
    </section>
  );
}

/** El reto terminado: todo lo que se prometió, de octubre a diciembre. */
function CommitmentHistory({ commitments }: { commitments: WinterArcCommitment[] }) {
  if (commitments.length === 0) return null;

  return (
    <section aria-labelledby="winter-arc-commitments-title" className="grid gap-4">
      <div className="grid gap-1.5">
        <p className="text-[0.62rem] font-semibold tracking-[0.26em] text-muted-foreground uppercase">
          Tus compromisos
        </p>
        <h2 id="winter-arc-commitments-title" className="text-2xl font-bold tracking-[-0.03em]">
          Lo que le prometiste a tu yo de enero
        </h2>
      </div>
      <ol className="grid gap-4">
        {commitments.map((commitment) => (
          <li key={commitment.month}>
            <CommitmentQuote label={monthName(commitment.month)} text={commitment.commitment} />
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Un compromiso con su mes. `muted` es para los meses anteriores, bajo el del mes en curso. */
function CommitmentQuote({ label, text, muted = false }: { label: string; text: string; muted?: boolean }) {
  return (
    <figure className={cn('grid border-l-2 pl-4', muted ? 'gap-1 border-border' : 'gap-1.5 border-[#7cc4e8]')}>
      <figcaption className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{label}</figcaption>
      <blockquote
        className={cn('leading-relaxed whitespace-pre-line', muted ? 'text-sm text-muted-foreground' : 'text-base')}
      >
        {text}
      </blockquote>
    </figure>
  );
}
