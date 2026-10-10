import { useState, type FormEvent } from 'react';
import { Plus, Sparkles, Swords } from 'lucide-react';
import { ErrorMessage } from '../components/ErrorMessage';
import { WinterArcCommitmentDialog } from '../components/WinterArcCommitmentDialog';
import { WinterArcHabitSuggestions } from '../components/WinterArcHabitSuggestions';
import { WinterArcLayout } from '../components/WinterArcLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useKaizenHabits } from '../hooks/useKaizenHabits';
import { ApiError } from '../services/api';
import { setupWinterArc } from '../services/winterArc';
import { WINTER_ARC_MIN_RULES } from '../types/winterArc';

/** Configuración del Winter Arc: elegir las Reglas Inquebrantables y, en un modal, el compromiso del reto. */
export function WinterArcSetup() {
  const habits = useKaizenHabits();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [suggesting, setSuggesting] = useState(false);
  const [askingCommitment, setAskingCommitment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // El backend sólo acepta hábitos activos: los pausados ni se muestran.
  const activeHabits = (habits.data ?? []).filter((habit) => habit.active);
  const canSubmit = selected.size >= WINTER_ARC_MIN_RULES && !submitting;

  function toggle(habitId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(habitId)) next.delete(habitId);
      else next.add(habitId);
      return next;
    });
  }

  // Los hábitos sugeridos que se acaban de crear ya llegan marcados al código.
  function suggestionsCreated(habitIds: string[]) {
    setSelected((current) => new Set([...current, ...habitIds]));
    habits.reload();
  }

  // Elegidos los hábitos, falta el propósito del reto: se pide en un modal.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitError(null);
    setAskingCommitment(true);
  }

  function closeCommitment() {
    if (submitting) return;
    setAskingCommitment(false);
    setSubmitError(null);
  }

  async function start(commitment: string) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await setupWinterArc([...selected], commitment);
      // El inicio del modulo abre el reto mas reciente: el que se acaba de crear.
      window.location.href = '/winter-arc';
    } catch (err: unknown) {
      setSubmitError(
        err instanceof ApiError && err.status === 409
          ? 'Ya tienes un Winter Arc en curso. Búscalo en el inicio del Winter Arc.'
          : err instanceof Error
            ? err.message
            : 'No pudimos iniciar el Winter Arc.',
      );
      setSubmitting(false);
    }
  }

  return (
    <WinterArcLayout>
      <section className="mx-auto w-full max-w-md" aria-labelledby="winter-arc-setup-title">
        <Card>
          <CardHeader>
            <p className="text-[0.62rem] font-semibold tracking-[0.22em] text-[#1d6a8f] uppercase">
              Paso 1 de 2 · El código
            </p>
            <CardTitle id="winter-arc-setup-title" className="text-2xl font-bold tracking-[-0.04em]">
              Elige tu código
            </CardTitle>
            <CardDescription>
              Los hábitos que marques serán tus Reglas Inquebrantables: durante 90 días, lo único que el cuerpo
              obedece. El placer ya no vota.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Sólo en la primera carga: al recargar tras crear sugeridos se queda lo que había. */}
            {habits.loading && !habits.data && (
              <div className="grid gap-3" aria-busy="true" aria-label="Cargando hábitos">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-11 rounded-lg" />
                ))}
              </div>
            )}

            {!habits.loading && habits.error && (
              <ErrorMessage title="No pudimos cargar tus hábitos" message={habits.error} onRetry={habits.reload} />
            )}

            {habits.data && !habits.error && activeHabits.length < WINTER_ARC_MIN_RULES && (
              <div className="grid gap-3 text-sm text-muted-foreground">
                <p>
                  El código de un samurái necesita al menos {WINTER_ARC_MIN_RULES} hábitos activos. Tienes{' '}
                  {activeHabits.length}.
                </p>
                {!suggesting && (
                  <Button type="button" onClick={() => setSuggesting(true)}>
                    <Sparkles aria-hidden="true" />
                    Sugerir hábitos
                  </Button>
                )}
                {suggesting && (
                  <WinterArcHabitSuggestions
                    existingNames={habits.data.map((habit) => habit.name)}
                    onCreated={suggestionsCreated}
                  />
                )}
                <Button type="button" variant="outline" onClick={goToNewHabit}>
                  Forjar mis propios hábitos
                </Button>
              </div>
            )}

            {habits.data && !habits.error && activeHabits.length >= WINTER_ARC_MIN_RULES && (
              <form className="grid gap-5" onSubmit={submit}>
                <fieldset className="grid gap-2" disabled={submitting}>
                  <legend className="sr-only">Hábitos</legend>
                  {activeHabits.map((habit) => {
                    const inputId = `winter-arc-habit-${habit.id}`;
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
                        <span className="font-medium">{habit.name}</span>
                      </label>
                    );
                  })}
                </fieldset>

                <Button type="button" variant="ghost" size="sm" className="w-fit text-muted-foreground" onClick={goToNewHabit}>
                  <Plus aria-hidden="true" />
                  Forjar otro hábito
                </Button>

                <p className="text-xs text-muted-foreground" aria-live="polite">
                  {`Elige al menos ${WINTER_ARC_MIN_RULES} hábitos para tu código (${selected.size}/${WINTER_ARC_MIN_RULES})`}
                </p>

                <Button type="submit" size="lg" disabled={!canSubmit}>
                  <Swords aria-hidden="true" />
                  Jurar mi código
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {askingCommitment && (
        <WinterArcCommitmentDialog
          submitting={submitting}
          error={submitError}
          onClose={closeCommitment}
          onConfirm={start}
        />
      )}
    </WinterArcLayout>
  );
}

/** Crear habitos sin salir del camino Winter Arc. */
function goToNewHabit() {
  window.location.href = '/winter-arc/nuevo-habito';
}
