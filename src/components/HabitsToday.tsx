import { ChevronRight, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { ErrorMessage } from './ErrorMessage';
import { HabitTodayCard } from './HabitTodayCard';
import { cn } from '../lib/utils';
import { formatWeekdayDayMonth, todayKey } from '../lib/habitDates';
import { HABIT_TEMPLATES, habitEmoji, type HabitTemplate } from '../lib/habitTemplates';
import type { HabitToday } from '../hooks/useHabitsToday';
import type { KaizenHabit } from '../types/kaizenHabit';

/** Una frase por dia, siempre la misma ese dia. */
const DAILY_WORDS = [
  'No tienes que ser extremo, solo constante.',
  'Un 1 % mejor cada día. En un año serás otra persona.',
  'Cada repetición es un voto por la persona en la que te estás convirtiendo.',
  'Los días difíciles también cuentan: haz la versión mínima.',
  'Fallar un día es humano. No fallar dos seguidos es el camino.',
  'Lo pequeño, repetido, se vuelve enorme.',
  'Empieza tan pequeño que no puedas decir que no.',
  'La motivación te hace empezar. El hábito te hace seguir.',
  'Hoy no se trata de ser perfecto, se trata de presentarse.',
];

interface HabitsTodayProps {
  /** Habitos activos, ya ordenados por hora. */
  habits: KaizenHabit[];
  paused: KaizenHabit[];
  entries: Record<string, HabitToday>;
  error: string | null;
  onRetry: () => void;
  savingHabitId: string | null;
  onOpen: (habit: KaizenHabit) => void;
  onRegister: (habit: KaizenHabit, isMinimum: boolean, origin: HTMLElement) => void;
  onCreate: (template?: HabitTemplate) => void;
}

/**
 * La pantalla principal del camino: responde "¿que me falta hoy?". Arriba el
 * avance del dia; abajo, cada habito con su check a mano.
 */
export function HabitsToday({
  habits,
  paused,
  entries,
  error,
  onRetry,
  savingHabitId,
  onOpen,
  onRegister,
  onCreate,
}: HabitsTodayProps) {
  if (habits.length === 0 && paused.length === 0) {
    return <FirstHabit onCreate={onCreate} />;
  }

  const loaded = habits.filter((habit) => entries[habit.id]);
  const done = loaded.filter((habit) => entries[habit.id].today.hasRepetition).length;
  const atRisk = loaded.filter((habit) => {
    const entry = entries[habit.id];
    return !entry.today.hasRepetition && entry.stats.currentStreak > 0;
  }).length;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <DayHero
        total={habits.length}
        done={done}
        atRisk={atRisk}
        loading={loaded.length < habits.length && !error}
      />

      <section aria-labelledby="habits-today-title" className="grid grid-cols-[minmax(0,1fr)] gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="habits-today-title" className="text-sm font-bold tracking-[0.1em] text-muted-foreground uppercase">
            Tus hábitos de hoy
          </h2>
          <Button type="button" size="sm" variant="outline" onClick={() => onCreate()}>
            <Plus aria-hidden="true" />
            Nuevo
          </Button>
        </div>

        {error && <ErrorMessage title="No pudimos cargar tu día" message={error} onRetry={onRetry} />}

        {habits.length > 0 ? (
          <ul className="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-3 p-0">
            {habits.map((habit) => (
              <HabitTodayCard
                key={habit.id}
                habit={habit}
                entry={entries[habit.id]}
                saving={savingHabitId === habit.id}
                onOpen={() => onOpen(habit)}
                onRegister={(isMinimum, origin) => onRegister(habit, isMinimum, origin)}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Todos tus hábitos están en pausa. Reactiva uno o crea uno nuevo para volver al camino.
          </p>
        )}

        <button
          type="button"
          onClick={() => onCreate()}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-4 py-3.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:border-primary/40 hover:bg-card hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Plus aria-hidden="true" className="size-4" />
          Añadir otro hábito
        </button>
      </section>

      {paused.length > 0 && (
        <details className="group rounded-2xl border border-border bg-card/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
            En pausa ({paused.length})
            <ChevronRight aria-hidden="true" className="size-4 transition-transform group-open:rotate-90" />
          </summary>
          <ul className="m-0 grid list-none gap-1 px-2 pb-2">
            {paused.map((habit) => (
              <li key={habit.id}>
                <button
                  type="button"
                  onClick={() => onOpen(habit)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span aria-hidden="true" className="grid size-9 place-items-center rounded-lg bg-muted text-lg grayscale">
                    {habitEmoji(habit)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{habit.name}</span>
                  <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function DayHero({ total, done, atRisk, loading }: { total: number; done: number; atRisk: number; loading: boolean }) {
  const today = todayKey();
  const complete = total > 0 && done === total;
  const dayNumber = Math.floor(Date.UTC(...ymd(today)) / 86_400_000);
  const words = DAILY_WORDS[dayNumber % DAILY_WORDS.length];

  let title = 'Tu práctica de hoy';
  let detail: string;
  if (loading) {
    detail = 'Preparando tu día…';
  } else if (complete) {
    title = '¡Día completo!';
    detail = 'Hoy fuiste la persona que quieres ser. Mañana, otra vez.';
  } else if (done === 0) {
    detail = total === 1 ? 'Un hábito te espera. Empieza ahora.' : `${total} hábitos te esperan. Empieza por el más fácil.`;
  } else {
    title = `Vas ${done} de ${total}`;
    detail = `Buen ritmo: ${total - done === 1 ? 'te falta uno' : `te faltan ${total - done}`}.`;
  }
  const risk =
    !loading && atRisk > 0
      ? atRisk === 1
        ? 'Tienes una racha por defender.'
        : `Tienes ${atRisk} rachas por defender.`
      : '';

  return (
    <section
      aria-labelledby="habits-day-title"
      className="relative isolate overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7"
    >
      {/* 改善 (kaizen): la mejora continua, como marca de agua. */}
      <span
        lang="ja"
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -bottom-8 -z-10 text-[7.5rem] leading-none font-bold text-foreground/[0.04] select-none sm:text-[9rem]"
      >
        改善
      </span>

      <div className="flex items-center gap-4 sm:gap-6">
        <ProgressRing done={done} total={total} complete={complete} />
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase">
            {greeting()} · {formatWeekdayDayMonth(today)}
          </p>
          <h1 id="habits-day-title" className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {detail}
            {risk && <span className="font-medium text-orange-700"> {risk}</span>}
          </p>
        </div>
      </div>

      <p className="mt-5 border-t border-dashed border-border pt-3.5 text-sm text-foreground/75 italic">
        “{words}”
      </p>
    </section>
  );
}

/** Anillo del dia: cuantos habitos van de cuantos. */
function ProgressRing({ done, total, complete }: { done: number; total: number; complete: boolean }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const fraction = total > 0 ? done / total : 0;

  return (
    <div
      role="img"
      aria-label={`${done} de ${total} hábitos hechos hoy`}
      className="relative grid size-22 shrink-0 place-items-center sm:size-24"
    >
      <svg viewBox="0 0 80 80" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="7" className="stroke-muted" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className={cn(
            'transition-[stroke-dashoffset] duration-700 ease-out',
            complete ? 'stroke-[#c9a227]' : 'stroke-primary',
          )}
        />
      </svg>
      <span aria-hidden="true" className="text-center leading-none">
        {complete ? (
          <span className="text-3xl">🏆</span>
        ) : (
          <>
            <span className="text-2xl font-bold text-foreground tabular-nums">{done}</span>
            <span className="text-sm font-semibold text-muted-foreground">/{total}</span>
          </>
        )}
      </span>
    </div>
  );
}

/** Pantalla vacia: el primer habito, con plantillas para no empezar de cero. */
function FirstHabit({ onCreate }: { onCreate: (template?: HabitTemplate) => void }) {
  return (
    <section
      aria-labelledby="first-habit-title"
      className="relative isolate overflow-hidden rounded-3xl border border-border bg-card px-5 py-8 text-center shadow-sm sm:px-10 sm:py-12"
    >
      <span aria-hidden="true" className="text-5xl">🌱</span>
      <h1 id="first-habit-title" className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Empieza con un hábito pequeño
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        Los grandes cambios no llegan de golpe: se construyen un 1 % cada día. Elige uno para inspirarte o crea el tuyo.
      </p>

      <ul className="mx-auto mt-6 grid max-w-md list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3">
        {HABIT_TEMPLATES.map((template) => (
          <li key={template.id}>
            <button
              type="button"
              onClick={() => onCreate(template)}
              className="flex w-full flex-col items-center gap-1 rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground transition-colors outline-none hover:border-primary/40 hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span aria-hidden="true" className="text-2xl">{template.emoji}</span>
              {template.label}
            </button>
          </li>
        ))}
      </ul>

      <Button type="button" size="lg" className="mt-6" onClick={() => onCreate()}>
        <Plus aria-hidden="true" />
        Crear mi propio hábito
      </Button>
    </section>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function ymd(dayKey: string): [number, number, number] {
  const [year, month, day] = dayKey.split('-').map(Number);
  return [year, month - 1, day];
}
