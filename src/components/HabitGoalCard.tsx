import { useState, type FormEvent } from 'react';
import { Target } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { createKaizenHabitGoal } from '../services/kaizenHabits';
import { formatDayKey } from '../lib/habitDates';
import type { KaizenHabitGoalProgress } from '../types/kaizenHabit';

/** El backend exige metas de 5 repeticiones o mas. */
const MIN_TARGET = 5;

interface HabitGoalCardProps {
  habitId: string;
  /** Meta activa que llega dentro de las estadisticas del habito. */
  activeGoal: KaizenHabitGoalProgress | null;
  today: string;
  disabled?: boolean;
  onCreated: () => void;
}

/**
 * Meta de repeticiones: muestra el avance de la meta activa o el formulario
 * para crear una nueva (POST /kaizen-habits/:id/goals).
 */
export function HabitGoalCard({ habitId, activeGoal, today, disabled = false, onCreated }: HabitGoalCardProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [target, setTarget] = useState('21');
  const [startedOn, setStartedOn] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const targetRepetitions = Number(target);
    // El backend rechaza metas de menos de 5 repeticiones.
    if (!Number.isInteger(targetRepetitions) || targetRepetitions < MIN_TARGET) {
      setError(`La meta debe ser un número entero de al menos ${MIN_TARGET} repeticiones.`);
      return;
    }
    if (!startedOn) {
      setError('Elige la fecha de inicio de la meta.');
      return;
    }

    setSaving(true);
    try {
      await createKaizenHabitGoal(habitId, { targetRepetitions, startedOn });
      setIsCreating(false);
      onCreated();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No fue posible crear la meta.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target aria-hidden="true" className="size-4 text-primary" />
          Meta de repeticiones
        </CardTitle>
        <CardDescription>
          {activeGoal
            ? 'Avance de la meta activa de este hábito.'
            : 'Define cuántas repeticiones quieres acumular para consolidar el hábito.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {activeGoal ? (
          <GoalProgress goal={activeGoal} />
        ) : isCreating ? (
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="goal-target">Repeticiones objetivo</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min={MIN_TARGET}
                  step={1}
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal-started-on">Inicio</Label>
                <Input
                  id="goal-started-on"
                  type="date"
                  value={startedOn}
                  onChange={(event) => setStartedOn(event.target.value)}
                  required
                />
              </div>
            </div>
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setError('');
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Creando...' : 'Crear meta'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              Sin meta activa. Una meta clásica son 21 repeticiones desde {formatDayKey(today)}.
            </p>
            <Button type="button" variant="outline" onClick={() => setIsCreating(true)} disabled={disabled}>
              <Target aria-hidden="true" />
              Definir meta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GoalProgress({ goal }: { goal: KaizenHabitGoalProgress }) {
  const percent =
    goal.targetRepetitions > 0
      ? Math.min(100, Math.round((goal.progressRepetitions / goal.targetRepetitions) * 100))
      : 0;

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <p className="text-2xl font-bold text-foreground">
          {goal.progressRepetitions}
          <span className="text-base font-medium text-muted-foreground"> / {goal.targetRepetitions}</span>
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            goal.completed ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
          }`}
        >
          {goal.completed ? 'Meta cumplida' : `${percent}%`}
        </span>
      </div>
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={goal.progressRepetitions}
        aria-valuemin={0}
        aria-valuemax={goal.targetRepetitions}
        aria-label="Avance de la meta"
      >
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {goal.completed
          ? 'Cumpliste la meta. Cuando cierres esta meta podrás definir la siguiente.'
          : `Faltan ${Math.max(0, goal.targetRepetitions - goal.progressRepetitions)} repeticiones.`}
      </p>
    </div>
  );
}
