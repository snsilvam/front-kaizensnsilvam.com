import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { WEEKDAY_LABELS, dayOfMonth, formatDayKey, isAfter, monthGrid, monthLabel } from '../lib/habitDates';
import type { KaizenHabitCalendarDay } from '../types/kaizenHabit';

interface HabitCalendarProps {
  visibleMonth: string;
  /** Dia contable de hoy en la zona horaria del habito. */
  today: string;
  days: KaizenHabitCalendarDay[];
  loading: boolean;
  onMonthChange: (delta: number) => void;
  onSelectDay: (dayKey: string) => void;
}

/**
 * Rejilla del mes: cada celda muestra si el dia tiene repeticion completa,
 * minima o ninguna. Los dias futuros no se pueden registrar.
 */
export function HabitCalendar({
  visibleMonth,
  today,
  days,
  loading,
  onMonthChange,
  onSelectDay,
}: HabitCalendarProps) {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const cells = monthGrid(visibleMonth);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onMonthChange(-1)}
          aria-label="Mes anterior"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <p className="text-sm font-semibold text-foreground" aria-live="polite">
          {monthLabel(visibleMonth)}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onMonthChange(1)}
          aria-label="Mes siguiente"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5" aria-hidden="true">
        {WEEKDAY_LABELS.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="text-center text-[0.7rem] font-semibold text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {cells.map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {cells.map((dayKey, index) => {
            if (!dayKey) return <span key={`empty-${index}`} />;

            const day = byDate.get(dayKey);
            const future = isAfter(dayKey, today);

            return (
              <button
                key={dayKey}
                type="button"
                disabled={future}
                onClick={() => onSelectDay(dayKey)}
                title={`${formatDayKey(dayKey)}${day?.hasRepetition ? (day.isMinimum ? ' · repetición mínima' : ' · repetición completa') : ''}`}
                aria-label={`${formatDayKey(dayKey)}: ${
                  day?.hasRepetition
                    ? day.isMinimum
                      ? 'repetición mínima registrada'
                      : 'repetición completa registrada'
                    : future
                      ? 'día futuro'
                      : 'sin registrar'
                }`}
                className={`grid aspect-square place-items-center rounded-lg border text-xs font-semibold transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${cellClasses(day, future, dayKey === today)}`}
              >
                {dayOfMonth(dayKey)}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.7rem] text-muted-foreground">
        <LegendItem className="border-primary bg-primary text-primary-foreground" label="Completa" />
        <LegendItem className="border-primary/40 bg-primary/15 text-primary" label="Mínima" />
        <LegendItem className="border-border bg-background" label="Sin registrar" />
        <LegendItem className="border-dashed border-border bg-muted/40" label="Futuro" />
      </div>
    </div>
  );
}

function cellClasses(
  day: KaizenHabitCalendarDay | undefined,
  future: boolean,
  isToday: boolean,
): string {
  const ring = isToday ? ' ring-2 ring-primary/30 ring-offset-1 ring-offset-background' : '';

  if (future) return 'cursor-not-allowed border-dashed border-border bg-muted/40 text-muted-foreground/60';
  if (day?.hasRepetition && day.isMinimum) {
    return `border-primary/40 bg-primary/15 text-primary hover:bg-primary/25${ring}`;
  }
  if (day?.hasRepetition) return `border-primary bg-primary text-primary-foreground hover:bg-primary/80${ring}`;

  return `border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent${ring}`;
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={`size-3 rounded border ${className}`} />
      {label}
    </span>
  );
}
