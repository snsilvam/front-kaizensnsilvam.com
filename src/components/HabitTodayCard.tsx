import { Check, Clock, Flame, LoaderCircle, MapPin, Timer } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { cn } from '../lib/utils';
import { WEEKDAY_LABELS, formatDayMonth, weekdayIndex } from '../lib/habitDates';
import { habitEmoji } from '../lib/habitTemplates';
import type { HabitToday } from '../hooks/useHabitsToday';
import type { KaizenHabit, KaizenHabitCalendarDay } from '../types/kaizenHabit';

interface HabitTodayCardProps {
  habit: KaizenHabit;
  /** undefined mientras carga su semana. */
  entry: HabitToday | undefined;
  saving: boolean;
  onOpen: () => void;
  /** `origin` es el boton tocado: de ahi sale el confeti. */
  onRegister: (isMinimum: boolean, origin: HTMLElement) => void;
}

/**
 * Un habito en la vista de hoy. Lo que se hace con el pulgar va a la derecha:
 * el check registra la repeticion completa de un toque y "2 min" la minima.
 * El resto de la tarjeta abre el detalle. Abajo, la ultima semana: ver la
 * cadena es lo que dan ganas de no romperla.
 */
export function HabitTodayCard({ habit, entry, saving, onOpen, onRegister }: HabitTodayCardProps) {
  const today = entry?.today;
  const done = Boolean(today?.hasRepetition);
  const streak = entry?.stats.currentStreak ?? 0;
  // El backend mantiene viva la racha hasta que termina hoy: si hoy falta, esta en juego.
  const atRisk = !done && streak > 0;
  const plan = habit.identity || habit.action || habit.description;

  return (
    <li
      className={cn(
        'rounded-2xl border bg-card p-3.5 shadow-xs transition-colors duration-300',
        done ? 'border-primary/30 bg-accent/60' : 'border-border',
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="-m-1 flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span
            aria-hidden="true"
            className={cn(
              'grid size-12 shrink-0 place-items-center rounded-xl text-2xl transition-colors',
              done ? 'bg-card' : 'bg-muted',
            )}
          >
            {habitEmoji(habit)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.95rem] font-semibold text-foreground">{habit.name}</span>
            {plan && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{plan}</span>}
            {(habit.time || habit.location) && (
              <span className="mt-1 flex items-center gap-2.5 text-[0.7rem] text-muted-foreground">
                {habit.time && (
                  <span className="inline-flex items-center gap-1">
                    <Clock aria-hidden="true" className="size-3" />
                    {habit.time}
                  </span>
                )}
                {habit.location && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <MapPin aria-hidden="true" className="size-3 shrink-0" />
                    <span className="truncate">{habit.location}</span>
                  </span>
                )}
              </span>
            )}
          </span>
        </button>

        <CheckButton
          habitName={habit.name}
          state={!today ? 'loading' : saving ? 'saving' : done ? (today.isMinimum ? 'minimum' : 'done') : 'pending'}
          onClick={(origin) => onRegister(false, origin)}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-border pt-2.5">
        {entry ? <WeekStrip week={entry.week} /> : <Skeleton className="h-5 w-40 rounded-full" />}

        <div className="flex shrink-0 items-center gap-1.5">
          {streak > 0 && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
                atRisk ? 'bg-orange-100 text-orange-700' : 'text-orange-600',
              )}
              title={atRisk ? `Racha de ${streak} días: regístralo hoy para mantenerla` : `Racha de ${streak} días`}
            >
              <Flame aria-hidden="true" className="size-3.5" />
              {streak}
              <span className="sr-only">
                {streak === 1 ? ' día de racha' : ' días de racha'}
                {atRisk ? ', regístralo hoy para mantenerla' : ''}
              </span>
            </span>
          )}
          {today && !done && (
            <button
              type="button"
              disabled={saving}
              onClick={(event) => onRegister(true, event.currentTarget)}
              title={habit.minimumAction2min || 'La versión de 2 minutos'}
              aria-label={`Registrar la versión mínima de ${habit.name}${
                habit.minimumAction2min ? `: ${habit.minimumAction2min}` : ''
              }`}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-card px-2.5 text-xs font-semibold text-muted-foreground transition-colors outline-none hover:border-primary/40 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <Timer aria-hidden="true" className="size-3.5" />
              2 min
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

type CheckState = 'loading' | 'saving' | 'pending' | 'done' | 'minimum';

function CheckButton({
  habitName,
  state,
  onClick,
}: {
  habitName: string;
  state: CheckState;
  onClick: (origin: HTMLElement) => void;
}) {
  const done = state === 'done' || state === 'minimum';

  if (done) {
    return (
      <span className="flex w-14 shrink-0 flex-col items-center gap-1">
        <span className="habit-check-pop grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30">
          <Check aria-hidden="true" className="size-6" strokeWidth={3} />
        </span>
        <span className="text-[0.68rem] font-semibold text-primary">
          {state === 'minimum' ? 'Mínima' : 'Hecho'}
          <span className="sr-only"> hoy</span>
        </span>
      </span>
    );
  }

  return (
    <span className="flex w-14 shrink-0 flex-col items-center gap-1">
      <button
        type="button"
        disabled={state !== 'pending'}
        onClick={(event) => onClick(event.currentTarget)}
        aria-label={`Marcar ${habitName} como hecho hoy`}
        className="group grid size-12 place-items-center rounded-full border-2 border-primary/35 bg-card text-primary/40 transition-all outline-none hover:border-primary hover:bg-accent hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-90 disabled:opacity-60"
      >
        {state === 'pending' ? (
          <Check aria-hidden="true" className="size-6 transition-transform group-hover:scale-110" strokeWidth={3} />
        ) : (
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        )}
      </button>
      <span aria-hidden="true" className="text-[0.68rem] font-semibold text-muted-foreground">
        Marcar
      </span>
    </span>
  );
}

/** La ultima semana como siete puntos con la inicial del dia. */
function WeekStrip({ week }: { week: KaizenHabitCalendarDay[] }) {
  const registered = week.filter((day) => day.hasRepetition).length;
  const last = week.length - 1;

  return (
    <ol
      className="m-0 flex list-none gap-1 p-0"
      aria-label={`Últimos 7 días: ${registered} de 7 registrados`}
    >
      {week.map((day, index) => (
        <li
          key={day.date}
          title={`${formatDayMonth(day.date)}${
            day.hasRepetition ? (day.isMinimum ? ' · mínima' : ' · completa') : ''
          }`}
          className={cn(
            'grid size-5 place-items-center rounded-full text-[0.58rem] font-bold',
            day.hasRepetition && !day.isMinimum && 'bg-primary text-primary-foreground',
            day.hasRepetition && day.isMinimum && 'bg-primary/20 text-primary',
            !day.hasRepetition && index === last && 'border border-dashed border-primary/50 text-primary',
            !day.hasRepetition && index !== last && 'bg-muted text-muted-foreground/70',
          )}
        >
          <span aria-hidden="true">{WEEKDAY_LABELS[weekdayIndex(day.date)]}</span>
        </li>
      ))}
    </ol>
  );
}
