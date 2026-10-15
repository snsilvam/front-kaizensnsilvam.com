import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { CheckCheck, Timer, X } from 'lucide-react';
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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saving, onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onConfirm({ isMinimum, description: description.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex animate-in items-end justify-center bg-foreground/40 backdrop-blur-[2px] fade-in duration-150 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="max-h-[92dvh] w-full max-w-md animate-in overflow-y-auto overscroll-contain rounded-t-3xl border border-border bg-card px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl duration-200 slide-in-from-bottom-6 sm:rounded-2xl sm:p-6 sm:zoom-in-95 sm:slide-in-from-bottom-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-repetition-title"
        aria-describedby="habit-repetition-description"
      >
        <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-accent text-primary">
            {(alreadyRegistered ? existing?.isMinimum : isMinimum) ? (
              <Timer aria-hidden="true" className="size-5" />
            ) : (
              <CheckCheck aria-hidden="true" className="size-5" />
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="-mt-1 -mr-2 text-muted-foreground"
            aria-label="Cerrar"
            disabled={saving}
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
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
                  icon={<CheckCheck aria-hidden="true" className="size-4" />}
                />
                <RepetitionOption
                  selected={isMinimum}
                  onSelect={() => setIsMinimum(true)}
                  title="Mínima (2 min)"
                  detail={minimumAction || 'La versión más pequeña.'}
                  icon={<Timer aria-hidden="true" className="size-4" />}
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

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={saving}>
                {saving ? 'Guardando…' : 'Registrar'}
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
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-xl border px-3 py-3 text-left transition-colors ${
        selected ? 'border-primary/40 bg-accent' : 'border-border bg-background hover:bg-muted'
      }`}
    >
      <span
        className={`flex items-center gap-1.5 text-sm font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}
      >
        {icon}
        {title}
      </span>
      <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{detail}</span>
    </button>
  );
}
