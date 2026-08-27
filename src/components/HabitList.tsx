import { CalendarClock, Flame, MapPin } from 'lucide-react';
import type { KaizenHabit } from '../types/kaizenHabit';

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

export function frequencyLabel(frequency: string): string {
  return FREQUENCY_LABELS[frequency] ?? frequency;
}

interface HabitListProps {
  habits: KaizenHabit[];
  selectedId: string | null;
  onSelect: (habit: KaizenHabit) => void;
}

/** Columna de habitos: elegir uno cambia el calendario y las estadisticas. */
export function HabitList({ habits, selectedId, onSelect }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        Todavía no tienes hábitos. Forja el primero para empezar a registrar repeticiones.
      </p>
    );
  }

  return (
    <ul className="grid gap-2" aria-label="Tus hábitos">
      {habits.map((habit) => {
        const selected = habit.id === selectedId;

        return (
          <li key={habit.id}>
            <button
              type="button"
              onClick={() => onSelect(habit)}
              aria-current={selected ? 'true' : undefined}
              className={`w-full rounded-xl border px-3.5 py-3 text-left transition-colors ${
                selected
                  ? 'border-primary/40 bg-accent'
                  : 'border-border bg-card hover:border-primary/25 hover:bg-accent/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
                  {habit.name}
                </span>
                {!habit.active && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] font-semibold text-muted-foreground">
                    Pausado
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {habit.identity || habit.description}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Flame aria-hidden="true" className="size-3" />
                  {frequencyLabel(habit.frequency)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarClock aria-hidden="true" className="size-3" />
                  {habit.time || '--:--'}
                </span>
                {habit.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin aria-hidden="true" className="size-3" />
                    {habit.location}
                  </span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
