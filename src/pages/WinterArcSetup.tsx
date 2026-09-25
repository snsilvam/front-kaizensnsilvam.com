import { useState, type FormEvent } from 'react';
import { ErrorMessage } from '../components/ErrorMessage';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useKaizenHabits } from '../hooks/useKaizenHabits';
import { ApiError } from '../services/api';
import { setupWinterArc } from '../services/winterArc';
import { WINTER_ARC_MIN_RULES } from '../types/winterArc';

/** Configuración del Winter Arc: elegir los hábitos que serán Reglas Inquebrantables. */
export function WinterArcSetup() {
  const habits = useKaizenHabits();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const arc = await setupWinterArc([...selected]);
      window.location.href = `/winter-arc?id=${encodeURIComponent(arc.id)}`;
    } catch (err: unknown) {
      setSubmitError(
        err instanceof ApiError && err.status === 409
          ? 'Ya tienes un Winter Arc en curso.'
          : err instanceof Error
            ? err.message
            : 'No pudimos iniciar el Winter Arc.',
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-8">
      <main className="w-full max-w-md" aria-labelledby="winter-arc-setup-title">
        <Card>
          <CardHeader>
            <CardTitle id="winter-arc-setup-title" className="text-2xl font-bold tracking-[-0.04em]">
              Winter Arc
            </CardTitle>
            <CardDescription>
              90 días de disciplina. Elige los hábitos que serán tus Reglas Inquebrantables.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {habits.loading && (
              <div className="grid gap-3" aria-busy="true" aria-label="Cargando hábitos">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-11 rounded-lg" />
                ))}
              </div>
            )}

            {!habits.loading && habits.error && (
              <ErrorMessage title="No pudimos cargar tus hábitos" message={habits.error} onRetry={habits.reload} />
            )}

            {!habits.loading && !habits.error && activeHabits.length < WINTER_ARC_MIN_RULES && (
              <div className="grid gap-3 text-sm text-muted-foreground">
                <p>
                  Necesitas al menos {WINTER_ARC_MIN_RULES} hábitos activos para comenzar el reto. Tienes{' '}
                  {activeHabits.length}.
                </p>
                <Button type="button" variant="outline" onClick={() => { window.location.href = '/habits'; }}>
                  Crear hábitos
                </Button>
              </div>
            )}

            {!habits.loading && !habits.error && activeHabits.length >= WINTER_ARC_MIN_RULES && (
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

                <p className="text-xs text-muted-foreground" aria-live="polite">
                  {`Selecciona al menos ${WINTER_ARC_MIN_RULES} hábitos para comenzar el reto (${selected.size}/${WINTER_ARC_MIN_RULES})`}
                </p>

                {submitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" size="lg" disabled={!canSubmit}>
                  {submitting ? 'Iniciando...' : 'Iniciar Winter Arc'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
