import { useState, type FormEvent } from 'react';
import { CheckCheck, Timer } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { formatDayKey } from '../lib/habitDates';
import type { KaizenHabitCalendarDay } from '../types/kaizenHabit';

/** El backend limita la nota de la repeticion a 240 caracteres. */
const MAX_DESCRIPTION = 240;

interface HabitRepetitionDialogProps {
  habitName: string;
  minimumAction: string;
  dayKey: string;
  /** Registro que ya existe para ese dia, si lo hay. */
  existing?: KaizenHabitCalendarDay;
  saving: boolean;
  error: string;
  onClose: () => void;
  onConfirm: (input: { isMinimum: boolean; description: string }) => void | Promise<void>;
}

/**
 * Registra la repeticion de un dia concreto. Se monta al elegir un dia del
 * calendario, por lo que el formulario arranca limpio en cada apertura.
 * Un dia ya registrado se muestra en modo lectura: el backend solo permite una
 * repeticion por dia y no expone endpoint para editarla.
 */
export function HabitRepetitionDialog({
  habitName,
  minimumAction,
  dayKey,
  existing,
  saving,
  error,
  onClose,
  onConfirm,
}: HabitRepetitionDialogProps) {
  const [isMinimum, setIsMinimum] = useState(false);
  const [description, setDescription] = useState('');
  const alreadyRegistered = Boolean(existing?.hasRepetition);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onConfirm({ isMinimum, description: description.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-repetition-title"
        aria-describedby="habit-repetition-description"
      >
        <div className="grid size-11 place-items-center rounded-full bg-accent text-primary">
          {(alreadyRegistered ? existing?.isMinimum : isMinimum) ? (
            <Timer aria-hidden="true" className="size-5" />
          ) : (
            <CheckCheck aria-hidden="true" className="size-5" />
          )}
        </div>
        <h2 id="habit-repetition-title" className="mt-4 text-lg font-semibold text-foreground">
          {alreadyRegistered ? 'Repetición registrada' : 'Registrar repetición'}
        </h2>
        <p id="habit-repetition-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{habitName}</span> · {formatDayKey(dayKey)}
        </p>

        {alreadyRegistered ? (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-2 rounded-xl border border-primary/15 bg-accent/60 px-4 py-3.5 text-sm">
              <DetailRow
                label="Tipo"
                value={existing?.isMinimum ? 'Mínima (2 min)' : 'Completa'}
              />
              {existing?.registeredAt && (
                <DetailRow label="Registrada" value={formatRegisteredAt(existing.registeredAt)} />
              )}
              {existing?.description && <DetailRow label="Nota" value={existing.description} />}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Solo se guarda una repetición por día, así que este registro ya no se puede cambiar.
            </p>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form className="mt-5 grid gap-5" onSubmit={submit}>
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium text-foreground">¿Cómo la completaste?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <RepetitionOption
                  selected={!isMinimum}
                  onSelect={() => setIsMinimum(false)}
                  title="Completa"
                  detail="Hiciste el hábito entero."
                />
                <RepetitionOption
                  selected={isMinimum}
                  onSelect={() => setIsMinimum(true)}
                  title="Mínima (2 min)"
                  detail={minimumAction || 'La versión más pequeña.'}
                />
              </div>
            </fieldset>

            <div className="grid gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor="repetition-description">Nota (opcional)</Label>
                <span className="text-xs text-muted-foreground">
                  {description.length}/{MAX_DESCRIPTION}
                </span>
              </div>
              <textarea
                id="repetition-description"
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, MAX_DESCRIPTION))}
                maxLength={MAX_DESCRIPTION}
                rows={2}
                placeholder="¿Cómo te fue hoy?"
                className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Registrar'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

/** `registeredAt` llega en ISO 8601; se muestra como hora local del navegador. */
function formatRegisteredAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function RepetitionOption({
  selected,
  onSelect,
  title,
  detail,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
        selected ? 'border-primary/40 bg-accent' : 'border-border bg-background hover:bg-muted'
      }`}
    >
      <span className={`block text-sm font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
        {title}
      </span>
      <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{detail}</span>
    </button>
  );
}
