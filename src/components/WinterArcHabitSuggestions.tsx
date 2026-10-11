import { useState } from 'react';
import { Swords } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { browserTimezone } from '../lib/habitDates';
import { WINTER_ARC_SUGGESTED_HABITS } from '../lib/winterArcSuggestions';
import { registerKaizenHabit } from '../services/kaizenHabits';

interface WinterArcHabitSuggestionsProps {
  /** Nombres de los hábitos que ya tiene el usuario: esas sugerencias no se repiten. */
  existingNames: string[];
  /** Ids de los hábitos creados, aunque la creación se haya cortado a medias. */
  onCreated: (habitIds: string[]) => void;
}

/**
 * Hábitos sugeridos para arrancar el Winter Arc sin hábitos propios.
 *
 * Vienen todas marcadas: con un clic se crean en Kaizen Habits (activos, con
 * todos sus campos) y quedan listas para entrar en el código. Una sugerencia
 * cuyo nombre ya existe no se muestra, así que reintentar tras un error no
 * duplica las que sí se crearon.
 */
export function WinterArcHabitSuggestions({ existingNames, onCreated }: WinterArcHabitSuggestionsProps) {
  const [unchecked, setUnchecked] = useState<Set<string>>(() => new Set());
  // Los recién creados se ocultan ya, sin esperar a que se recargue la lista de hábitos.
  const [createdNames, setCreatedNames] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const existing = new Set([...existingNames, ...createdNames].map(normalize));
  const available = WINTER_ARC_SUGGESTED_HABITS.filter((habit) => !existing.has(normalize(habit.name)));
  const chosen = available.filter((habit) => !unchecked.has(habit.name));

  if (available.length === 0) return null;

  function toggle(name: string) {
    setUnchecked((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function create() {
    setCreating(true);
    setError('');
    const createdIds: string[] = [];
    const names: string[] = [];

    try {
      // Uno a uno: si uno falla, los anteriores ya quedaron creados y se informan igual.
      for (const { pillar: _pillar, ...habit } of chosen) {
        const created = await registerKaizenHabit({ ...habit, timezone: browserTimezone(), active: true });
        createdIds.push(created.id);
        names.push(habit.name);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible crear los hábitos sugeridos.');
    } finally {
      setCreating(false);
      if (createdIds.length > 0) {
        setCreatedNames((current) => [...current, ...names]);
        onCreated(createdIds);
      }
    }
  }

  return (
    <div className="grid gap-3 rounded-xl border border-dashed px-4 py-3.5">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        Cuerpo, alimento y mente
      </p>

      <fieldset className="grid gap-2" disabled={creating}>
        <legend className="sr-only">Hábitos sugeridos</legend>
        {available.map((habit, index) => {
          const inputId = `winter-arc-suggestion-${index}`;
          return (
            <label
              key={habit.name}
              htmlFor={inputId}
              className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5"
            >
              <input
                id={inputId}
                type="checkbox"
                className="mt-0.5 size-4 accent-primary"
                checked={!unchecked.has(habit.name)}
                onChange={() => toggle(habit.name)}
              />
              <span className="grid gap-0.5">
                <span className="text-[0.62rem] font-semibold tracking-[0.18em] text-[#1d6a8f] uppercase">
                  {habit.pillar}
                </span>
                <span className="font-medium text-foreground">{habit.name}</span>
                <span className="text-xs text-muted-foreground">
                  {`${habit.time} · Mínimo: ${habit.minimumAction2min.toLowerCase()}`}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="button" onClick={create} disabled={creating || chosen.length === 0}>
        <Swords aria-hidden="true" />
        {creating ? 'Forjando...' : chosen.length === 1 ? 'Forjar 1 hábito' : `Forjar ${chosen.length} hábitos`}
      </Button>
      <p className="text-xs text-muted-foreground">Podrás ajustarlos después en el dojo de Hábitos.</p>
    </div>
  );
}

function normalize(name: string): string {
  return name.trim().toLowerCase();
}
