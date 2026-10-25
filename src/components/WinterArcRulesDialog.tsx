import { useEffect, useState, type FormEvent } from 'react';
import { Swords, X } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { useKaizenHabits } from '../hooks/useKaizenHabits';
import { ApiError } from '../services/api';
import { updateWinterArcRules } from '../services/winterArc';
import { WINTER_ARC_MIN_RULES } from '../types/winterArc';

interface WinterArcRulesDialogProps {
  winterArcId: string;
  /** Las reglas actuales del reto (habit_id del horario). */
  ruleIds: string[];
  onClose: () => void;
  /** Las reglas se cambiaron: hay que recargar el grid. */
  onSaved: () => void;
}

/**
 * Editar el código del reto en curso: qué hábitos entran y cuáles salen de las
 * Reglas Inquebrantables (PUT /api/winter-arc/:id/rules). Vale desde hoy: los
 * días pasados y sus deudas se juzgan con las reglas que tenían.
 *
 * Lista los hábitos activos más las reglas actuales aunque estén pausadas: el
 * backend deja que una regla se quede pausada, pero sólo acepta hábitos
 * activos como nuevos. Se monta al abrirse, así que arranca con las reglas
 * actuales marcadas.
 */
export function WinterArcRulesDialog({ winterArcId, ruleIds, onClose, onSaved }: WinterArcRulesDialogProps) {
  const habits = useKaizenHabits();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(ruleIds));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saving, onClose]);

  const rules = new Set(ruleIds);
  const options = (habits.data ?? []).filter((habit) => habit.active || rules.has(habit.id));
  const added = [...selected].filter((id) => !rules.has(id)).length;
  const removed = ruleIds.filter((id) => !selected.has(id)).length;
  const changed = added > 0 || removed > 0;
  const canSave = selected.size >= WINTER_ARC_MIN_RULES && changed && !saving;

  function toggle(habitId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(habitId)) next.delete(habitId);
      else next.add(habitId);
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await updateWinterArcRules(winterArcId, [...selected]);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'Tu Winter Arc ya no está en curso: su código no se puede cambiar.'
          : err instanceof Error
            ? err.message
            : 'No pudimos cambiar tu código.',
      );
      setSaving(false);
    }
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
        aria-labelledby="winter-arc-rules-title"
        aria-describedby="winter-arc-rules-description"
      >
        <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div
            lang="ja"
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-full bg-[#0b1624] text-lg font-bold text-[#cfe8f5] shadow-md shadow-[#7cc4e8]/40"
          >
            侍
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
        <h2 id="winter-arc-rules-title" className="mt-4 text-lg font-semibold text-foreground">
          Editar tu código
        </h2>
        <p id="winter-arc-rules-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Marca los hábitos que siguen siendo Reglas Inquebrantables. El cambio vale desde hoy: los días ya cerrados y
          sus deudas no cambian.
        </p>

        <div className="mt-5">
          {habits.loading && !habits.data && (
            <div className="grid gap-2" aria-busy="true" aria-label="Cargando hábitos">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-11 rounded-lg" />
              ))}
            </div>
          )}

          {!habits.loading && habits.error && (
            <ErrorMessage title="No pudimos cargar tus hábitos" message={habits.error} onRetry={habits.reload} />
          )}

          {habits.data && !habits.error && (
            <form className="grid gap-5" onSubmit={submit}>
              <fieldset className="grid gap-2" disabled={saving}>
                <legend className="sr-only">Hábitos del código</legend>
                {options.map((habit) => {
                  const inputId = `winter-arc-rule-${habit.id}`;
                  return (
                    <label
                      key={habit.id}
                      htmlFor={inputId}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5"
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={selected.has(habit.id)}
                        onChange={() => toggle(habit.id)}
                      />
                      <span className="min-w-0 flex-1 font-medium break-words">{habit.name}</span>
                      {!habit.active && <span className="text-xs text-muted-foreground">pausado</span>}
                    </label>
                  );
                })}
              </fieldset>

              <p className="text-xs text-muted-foreground" aria-live="polite">
                {selected.size < WINTER_ARC_MIN_RULES
                  ? `Tu código necesita al menos ${WINTER_ARC_MIN_RULES} hábitos (${selected.size}/${WINTER_ARC_MIN_RULES}).`
                  : changed
                    ? changeSummary(added, removed)
                    : 'Sin cambios: marca o desmarca hábitos.'}
              </p>

              {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!canSave}>
                  <Swords aria-hidden="true" />
                  {saving ? 'Guardando...' : 'Guardar código'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/** "Desde hoy entra 1 hábito y salen 2 hábitos." */
function changeSummary(added: number, removed: number): string {
  const parts: string[] = [];
  if (added > 0) parts.push(added === 1 ? 'entra 1 hábito' : `entran ${added} hábitos`);
  if (removed > 0) parts.push(removed === 1 ? 'sale 1 hábito' : `salen ${removed} hábitos`);
  return `Desde hoy ${parts.join(' y ')}.`;
}
