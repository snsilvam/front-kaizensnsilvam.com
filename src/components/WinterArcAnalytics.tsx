import { useState, type ReactNode } from 'react';
import { Anchor, Check } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { useWinterArcAnalytics } from '../hooks/useWinterArcAnalytics';
import { cn } from '../lib/utils';
import type {
  IsoWeekday,
  WinterArcAnchorHabit,
  WinterArcHabitTally,
  WinterArcWeekdayStat,
} from '../types/winterArc';

interface WinterArcAnalyticsProps {
  winterArcId: string;
}

/**
 * Retrospectiva de un Winter Arc terminado, en tres capítulos: el hábito que
 * más se cumplió, los patrones por día de la semana y el Hábito Ancla del
 * último tercio. Todo lo calcula el backend; aquí sólo se cuenta.
 *
 * Sólo debe montarse con el reto en `completed` o `failed`. Si el backend no
 * tiene retrospectiva para el reto no pinta nada.
 */
export function WinterArcAnalytics({ winterArcId }: WinterArcAnalyticsProps) {
  const analytics = useWinterArcAnalytics(winterArcId);

  if (analytics.loading) {
    return <Skeleton className="h-96 w-full rounded-2xl" aria-label="Cargando tu retrospectiva" />;
  }

  if (analytics.error) {
    return (
      <ErrorMessage
        title="No pudimos cargar tu retrospectiva"
        message={analytics.error}
        onRetry={analytics.reload}
      />
    );
  }

  if (analytics.unavailable || !analytics.data) return null;

  const { status, unbreakable_habit, weekdays, best_weekday, worst_weekday, anchor_habit } = analytics.data;
  const evaluatedDays = weekdays.reduce((total, day) => total + day.evaluated_days, 0);

  return (
    <section aria-labelledby="winter-arc-analytics-title" className="grid gap-4">
      <div className="grid gap-1.5">
        <p className="text-[0.62rem] font-semibold tracking-[0.26em] text-muted-foreground uppercase">
          Retrospectiva
        </p>
        <h2 id="winter-arc-analytics-title" className="text-2xl font-bold tracking-[-0.03em]">
          Lo que dejaron {evaluatedDays} días
        </h2>
        <p className="text-sm text-muted-foreground">
          {status === 'completed'
            ? 'Sobreviviste al invierno. Esto es lo que aprendiste de ti.'
            : 'La llama se apagó, pero lo que construiste sigue ahí. Esto es lo que aprendiste de ti.'}
        </p>
      </div>

      <UnbreakableHabit habit={unbreakable_habit} />
      <Patterns weekdays={weekdays} best={best_weekday} worst={worst_weekday} />
      <AnchorHabit habit={anchor_habit} />
    </section>
  );
}

function UnbreakableHabit({ habit }: { habit: WinterArcHabitTally | null }) {
  return (
    <Chapter index="01" title="Tu Hábito Inquebrantable">
      {habit ? (
        <>
          <HabitName>{habit.name}</HabitName>
          <p className="font-mono text-sm text-muted-foreground">
            {habit.completed_days} de {habit.evaluated_days} días
          </p>
          <p className="text-sm text-muted-foreground">
            El que más veces cumpliste. Cuando lo demás flaqueaba, este seguía en pie.
          </p>
        </>
      ) : (
        <EmptyNote>No hubo repeticiones registradas durante el reto.</EmptyNote>
      )}
    </Chapter>
  );
}

interface PatternsProps {
  weekdays: WinterArcWeekdayStat[];
  best: IsoWeekday | null;
  worst: IsoWeekday | null;
}

function Patterns({ weekdays, best, worst }: PatternsProps) {
  const bestDay = weekdays.find((day) => day.weekday === best);
  const worstDay = weekdays.find((day) => day.weekday === worst);

  return (
    <Chapter index="02" title="Tus Patrones">
      {bestDay && worstDay ? (
        <p className="text-sm text-muted-foreground">
          Tu día más firme es el <strong className="font-semibold text-foreground">{WEEKDAY_NAME[bestDay.weekday]}</strong>{' '}
          ({successRate(bestDay)} %). El más frágil, el{' '}
          <strong className="font-semibold text-foreground">{WEEKDAY_NAME[worstDay.weekday]}</strong> (
          {successRate(worstDay)} %).
        </p>
      ) : (
        <EmptyNote>Ningún día de la semana se distingue de los demás.</EmptyNote>
      )}

      <ul className="grid gap-2" aria-label="Días cumplidos por día de la semana">
        {weekdays.map((day) => {
          const rate = successRate(day);
          const highlighted = day.weekday === best || day.weekday === worst;
          return (
            <li
              key={day.weekday}
              title={`${WEEKDAY_NAME[day.weekday]}: ${day.successful_days} de ${day.evaluated_days} días cumplidos`}
              className="grid grid-cols-[2.25rem_1fr_2.75rem] items-center gap-3 text-xs"
            >
              <span className={cn('text-muted-foreground', highlighted && 'font-semibold text-foreground')}>
                {WEEKDAY_SHORT[day.weekday]}
              </span>
              <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn(
                    'block h-full rounded-full transition-[width] duration-700',
                    day.weekday === best ? 'bg-primary' : 'bg-primary/35',
                  )}
                  style={{ width: `${rate}%` }}
                />
              </span>
              <span className="text-right font-mono text-muted-foreground">{rate} %</span>
            </li>
          );
        })}
      </ul>
    </Chapter>
  );
}

function AnchorHabit({ habit }: { habit: WinterArcAnchorHabit | null }) {
  const [consolidated, setConsolidated] = useState(false);

  function consolidate() {
    // TODO(backend): Kaizen Habits todavía no tiene cómo marcar un hábito como
    // consolidado. PUT /kaizen-habits/:habitId es un reemplazo completo y no
    // tiene un campo para esto. Cuando exista el endpoint (p. ej.
    // POST /kaizen-habits/:habitId/consolidate), crear la función en
    // services/kaizenHabits.ts, llamarla aquí con `habit.habit_id` y mostrar
    // su ApiError en un Alert destructive, como hace WinterArcGrid al sincronizar.
    setConsolidated(true);
  }

  return (
    <Chapter index="03" title="El Hábito Ancla">
      {habit ? (
        <>
          <HabitName>{habit.name}</HabitName>
          <p className="text-sm text-muted-foreground">
            Del día {habit.from_day} al {habit.to_day} fue el que más sostuviste:{' '}
            <span className="font-mono">
              {habit.completed_days} de {habit.evaluated_days}
            </span>{' '}
            días. Lo que resiste al final del invierno ya no depende de la fuerza de voluntad: sobre este hábito
            conviene construir lo demás.
          </p>

          {consolidated ? (
            <Alert variant="success" role="status">
              <Check aria-hidden="true" />
              <AlertTitle>{habit.name} es parte de ti</AlertTitle>
              <AlertDescription>Sigue registrándolo en Kaizen Habits. El reto terminó; el hábito no.</AlertDescription>
            </Alert>
          ) : (
            <Button
              type="button"
              size="lg"
              className="mt-1 h-auto min-h-10 w-full py-2.5 whitespace-normal sm:w-fit"
              onClick={consolidate}
            >
              <Anchor aria-hidden="true" />
              Consolidar {habit.name}
            </Button>
          )}
        </>
      ) : (
        <EmptyNote>El último tramo del reto no dejó un hábito lo bastante constante para recomendarlo.</EmptyNote>
      )}
    </Chapter>
  );
}

function Chapter({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-baseline gap-2.5 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          <span className="font-mono tracking-normal">{index}</span>
          {title}
        </h3>
      </CardHeader>
      <CardContent className="grid gap-3">{children}</CardContent>
    </Card>
  );
}

function HabitName({ children }: { children: ReactNode }) {
  return <p className="text-3xl font-bold tracking-[-0.04em] text-balance break-words">{children}</p>;
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

/** Porcentaje entero de días exitosos; 0 si ese día de la semana no se evaluó. */
function successRate(day: WinterArcWeekdayStat): number {
  if (day.evaluated_days === 0) return 0;
  return Math.round((day.successful_days / day.evaluated_days) * 100);
}

const WEEKDAY_NAME: Record<IsoWeekday, string> = {
  1: 'lunes',
  2: 'martes',
  3: 'miércoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sábado',
  7: 'domingo',
};

const WEEKDAY_SHORT: Record<IsoWeekday, string> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
  7: 'Dom',
};
