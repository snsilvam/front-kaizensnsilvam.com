import { Check, TriangleAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  formatRecordDate,
  formatShortDay,
  formatSleepMinutes,
  formatSleepShort,
  formatTimeOfDay,
  formatWakeShort,
} from '../lib/sleep';
import type { SleepHistory as SleepHistoryData, SleepStatus } from '../types/sleep';

/** Columnas de la tira: las del historial del backend. */
const COLUMNS = 5;

/** La meta de cada noche, la misma del backend: la linea punteada. */
const GOAL_MINUTES = 7 * 60;

/** Techo de las barras: 9 horas, o la noche mas larga si la pasa. */
const MIN_SCALE_MINUTES = 9 * 60;

interface SleepHistoryProps {
  history: SleepHistoryData;
  /** Dia de hoy, "2026-10-14": su columna dice "Hoy". */
  today: string;
}

/**
 * Higiene del sueno de un vistazo: los ultimos registros como barras de lo
 * dormido, con la meta de 7 horas punteada, y debajo la hora de despertar
 * contra la habitual. Las reglas (semaforo, hora habitual, si va bien) llegan
 * del backend; aqui solo se pintan.
 *
 * El color de cada barra es un estado, asi que nunca va solo: lo acompanan la
 * duracion escrita, la leyenda y una lista equivalente para lectores de pantalla.
 */
export function SleepHistory({ history, today }: SleepHistoryProps) {
  const { days } = history;
  if (days.length === 0) return null;

  const scale = Math.max(MIN_SCALE_MINUTES, ...days.map((day) => day.sleepMinutes));
  const percent = (minutes: number) => `${(minutes / scale) * 100}%`;
  // Los registros quedan a la derecha, con hoy al final: los huecos van a la izquierda.
  const empty = Math.max(0, COLUMNS - days.length);
  const offSchedule = days.filter((day) => !day.wakeOnSchedule).length;
  const shortNights = days.filter((day) => day.sleepStatus === 'short').length;
  const dayLabel = (date: string) => (date === today ? 'Hoy' : formatShortDay(date));

  return (
    <section aria-labelledby="sleep-history-title" className="rounded-2xl bg-muted p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 id="sleep-history-title" className="text-sm font-semibold text-foreground">
          Tus últimos días
        </h3>
        <OnTrackBadge onTrack={history.onTrack} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Despiertas a las {formatTimeOfDay(history.typicalWakeTime)} · duermes{' '}
        {formatSleepMinutes(history.averageSleepMinutes)} en promedio
      </p>

      {!history.onTrack && (
        <p className="mt-2 text-xs font-medium text-foreground">
          {[
            offSchedule > 0 && `${offSchedule} ${offSchedule === 1 ? 'día' : 'días'} fuera de tu hora`,
            shortNights > 0 && `${shortNights} ${shortNights === 1 ? 'noche' : 'noches'} de menos de 6 h`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}

      <div aria-hidden="true" className="mt-4">
        {/* Barras: lo dormido cada noche, con la meta de 7 h punteada. */}
        <div className="relative h-20">
          <div
            className="absolute inset-x-0 border-t border-dashed border-foreground/40"
            style={{ bottom: percent(GOAL_MINUTES) }}
          />
          <div className="grid h-full grid-cols-5 items-end gap-2">
            {Array.from({ length: empty }, (_, index) => (
              <span key={`empty-${index}`} className="mx-auto h-0.5 w-7 rounded-full bg-border" />
            ))}
            {days.map((day) => (
              <span
                key={day.date}
                className={cn('mx-auto w-7 rounded-t-[4px]', BAR_CLASS[day.sleepStatus])}
                style={{ height: percent(day.sleepMinutes) }}
              />
            ))}
          </div>
        </div>

        {/* Etiquetas: duracion, dia y hora de despertar contra la habitual. */}
        <div className="mt-1.5 grid grid-cols-5 gap-2 border-t border-border pt-1.5 text-center">
          {Array.from({ length: empty }, (_, index) => (
            <span key={`empty-${index}`} />
          ))}
          {days.map((day) => (
            <span key={day.date} className="grid min-w-0 gap-0.5 leading-tight">
              <span className="text-xs font-semibold text-foreground tabular-nums">
                {formatSleepShort(day.sleepMinutes)}
              </span>
              <span className={cn('truncate text-[0.68rem] text-muted-foreground', day.date === today && 'font-semibold text-foreground')}>
                {dayLabel(day.date)}
              </span>
              <span className="inline-flex items-center justify-center gap-0.5 text-[0.68rem] text-muted-foreground tabular-nums">
                {day.wakeOnSchedule ? (
                  <Check className="size-3 shrink-0 text-primary" />
                ) : (
                  <TriangleAlert className="size-3 shrink-0 text-[#d03b3b]" />
                )}
                {formatWakeShort(day.wakeTime)}
              </span>
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] text-muted-foreground">
          <LegendItem className={BAR_CLASS.ok}>7 h o más</LegendItem>
          <LegendItem className={BAR_CLASS.warning}>6 a 7 h</LegendItem>
          <LegendItem className={BAR_CLASS.short}>Menos de 6 h</LegendItem>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 border-t border-dashed border-foreground/60" />
            Meta 7 h
          </span>
          <span className="inline-flex items-center gap-1">
            <TriangleAlert className="size-3 text-[#d03b3b]" />
            Fuera de tu hora
          </span>
        </div>
      </div>

      {/* Lo mismo, en palabras. */}
      <ol className="sr-only">
        {days.map((day) => (
          <li key={day.date}>
            {day.date === today ? 'Hoy' : formatRecordDate(day.date)}: dormiste {formatSleepMinutes(day.sleepMinutes)} (
            {STATUS_LABEL[day.sleepStatus]}), despertaste a las {formatTimeOfDay(day.wakeTime)},{' '}
            {day.wakeOnSchedule ? 'a tu hora' : 'fuera de tu hora'}.
          </li>
        ))}
      </ol>
    </section>
  );
}

function OnTrackBadge({ onTrack }: { onTrack: boolean }) {
  return onTrack ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
      <Check aria-hidden="true" className="size-3.5" />
      Vas bien
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#d97706]/12 px-2.5 py-1 text-xs font-semibold text-[#b45309]">
      <TriangleAlert aria-hidden="true" className="size-3.5" />
      Ajusta tu rutina
    </span>
  );
}

function LegendItem({ className, children }: { className: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn('size-2.5 rounded-[3px]', className)} />
      {children}
    </span>
  );
}

const BAR_CLASS: Record<SleepStatus, string> = {
  ok: 'bg-[#4f46e5]',
  warning: 'bg-[#f59e0b]',
  short: 'bg-[#d03b3b]',
};

const STATUS_LABEL: Record<SleepStatus, string> = {
  ok: '7 horas o más',
  warning: 'entre 6 y 7 horas',
  short: 'menos de 6 horas',
};
