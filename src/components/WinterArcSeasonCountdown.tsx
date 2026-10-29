import { useEffect, useState } from 'react';
import { Hourglass, Moon } from 'lucide-react';
import { pad, splitRemaining } from '../lib/countdown';
import { bogotaDayEndsAt, bogotaIsoWeekday } from '../lib/dayClock';
import { formatDayMonth } from '../lib/habitDates';
import { cn } from '../lib/utils';
import {
  WINTER_ARC_SEASON_DAYS,
  WINTER_ARC_SEASON_ENDS_AT,
  WINTER_ARC_SEASON_ENDS_ON,
  WINTER_ARC_SEASON_STARTS_AT,
} from '../lib/winterArcSeason';
import { WINTER_ARC_REST_WEEKDAY } from '../types/winterArc';

const DAY_MS = 86_400_000;

/** Qué tan cerca está el cero: sube el tono a medida que se acaba el invierno. */
type Stage = 'running' | 'month' | 'week' | 'lastDay' | 'ended';

function stageOf(remainingMs: number): Stage {
  if (remainingMs <= 0) return 'ended';
  if (remainingMs < DAY_MS) return 'lastDay';
  if (remainingMs <= 7 * DAY_MS) return 'week';
  if (remainingMs <= 30 * DAY_MS) return 'month';
  return 'running';
}

interface StageLook {
  badge: string;
  title: string;
  /** Borde, degradado y brillo de la tarjeta. */
  card: string;
  accent: string;
  dot: string;
  fuse: string;
  spark: string;
}

// Clases completas, no armadas, para que Tailwind las encuentre. Del ámbar al
// rojo: la llama gana terreno al hielo a medida que se acaba el tiempo.
const STAGES: Record<Stage, StageLook> = {
  running: {
    badge: 'El tiempo corre',
    title: 'El invierno se está acabando',
    card: 'border-amber-400/35 from-amber-500/15',
    accent: 'text-amber-300',
    dot: 'bg-amber-400',
    fuse: 'from-amber-200 to-orange-500',
    spark: 'bg-amber-100 shadow-[0_0_10px_3px_rgba(251,146,60,0.85)]',
  },
  month: {
    badge: 'Último mes',
    title: 'Te queda menos de un mes',
    card: 'border-orange-500/50 from-orange-500/20',
    accent: 'text-orange-400',
    dot: 'bg-orange-500',
    fuse: 'from-orange-300 to-red-500',
    spark: 'bg-orange-100 shadow-[0_0_12px_4px_rgba(249,115,22,0.9)]',
  },
  week: {
    badge: 'Última semana',
    title: 'Última semana para forjarte',
    card: 'border-red-500/60 from-red-600/25 shadow-[0_0_32px_-8px_rgba(239,68,68,0.7)]',
    accent: 'text-red-400',
    dot: 'bg-red-500',
    fuse: 'from-orange-400 to-red-600',
    spark: 'bg-red-100 shadow-[0_0_14px_5px_rgba(239,68,68,0.95)]',
  },
  lastDay: {
    badge: 'Último día',
    title: 'El invierno se acaba esta noche',
    card: 'winter-urgent-pulse border-red-500/80 from-red-600/30',
    accent: 'text-red-400',
    dot: 'bg-red-500',
    fuse: 'from-orange-400 to-red-600',
    spark: 'bg-red-100 shadow-[0_0_14px_5px_rgba(239,68,68,0.95)]',
  },
  ended: {
    badge: 'Terminado',
    title: 'El invierno terminó',
    card: 'border-[#eef7fc]/15 from-transparent',
    accent: 'text-[#eef7fc]/50',
    dot: 'bg-[#eef7fc]/40',
    fuse: '',
    spark: '',
  },
};

/**
 * Cuenta atrás en vivo de los 90 días del invierno, hasta el cero del
 * 31 de diciembre. Vive en el header de WinterArcLayout, así que solo se ve
 * dentro del modulo Winter Arc.
 *
 * Está hecha para dar urgencia, como una oferta que vence: el tono sube del
 * ámbar al rojo según lo que falta, cuenta los días que ya se fueron, la
 * mecha se consume y abajo corre el cierre de hoy, que es lo único que el
 * usuario todavía puede ganar.
 *
 * Es global, no del reto del usuario: el grid de cada reto lleva sus propios
 * 90 días desde el setup.
 */
export function WinterArcSeasonCountdown() {
  const [now, setNow] = useState(() => Date.now());
  const remainingMs = WINTER_ARC_SEASON_ENDS_AT - now;
  const stage = stageOf(remainingMs);
  const ended = stage === 'ended';
  const look = STAGES[stage];

  useEffect(() => {
    if (ended) return;

    const id = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= WINTER_ARC_SEASON_ENDS_AT) window.clearInterval(id);
    }, 1000);

    return () => window.clearInterval(id);
  }, [ended]);

  const remaining = splitRemaining(remainingMs);
  const seasonMs = WINTER_ARC_SEASON_ENDS_AT - WINTER_ARC_SEASON_STARTS_AT;
  const left = Math.min(1, Math.max(0, remainingMs / seasonMs));
  const goneDays = Math.min(WINTER_ARC_SEASON_DAYS, Math.max(0, Math.floor((now - WINTER_ARC_SEASON_STARTS_AT) / DAY_MS)));

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
      <section
        aria-label="Cuenta regresiva del invierno"
        className={cn(
          'grid gap-4 rounded-2xl border bg-[#eef7fc]/3 bg-linear-to-br to-transparent p-4 sm:p-5',
          look.card,
        )}
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid gap-1.5">
            <span
              className={cn(
                'inline-flex w-fit items-center gap-2 text-[0.62rem] font-semibold tracking-[0.2em] uppercase',
                look.accent,
              )}
            >
              <span aria-hidden="true" className="relative flex size-2">
                {!ended && (
                  <span className={cn('absolute inline-flex size-full rounded-full opacity-75 motion-safe:animate-ping', look.dot)} />
                )}
                <span className={cn('relative inline-flex size-2 rounded-full', look.dot)} />
              </span>
              {look.badge}
            </span>

            <p className="text-lg font-bold tracking-[-0.02em] text-balance text-[#eef7fc] sm:text-xl">{look.title}</p>

            <p className="text-sm text-pretty text-[#eef7fc]/65">
              {ended ? (
                `Los ${WINTER_ARC_SEASON_DAYS} días ya pasaron.`
              ) : (
                <>
                  Ya {goneDays === 1 ? 'se fue' : 'se fueron'}{' '}
                  <strong className="font-semibold text-[#eef7fc]">
                    {goneDays} de {WINTER_ARC_SEASON_DAYS} días
                  </strong>
                  . No vuelven.
                  <span className="hidden sm:inline"> Termina el {formatDayMonth(WINTER_ARC_SEASON_ENDS_ON)}.</span>
                </>
              )}
            </p>
          </div>

          <div
            role="timer"
            aria-label={`Quedan ${remaining.days} días, ${remaining.hours} horas, ${remaining.minutes} minutos y ${remaining.seconds} segundos del invierno`}
            className="flex items-start gap-1 sm:gap-1.5"
          >
            <TimeTile value={String(remaining.days)} label={remaining.days === 1 ? 'Día' : 'Días'} />
            <Colon />
            <TimeTile value={pad(remaining.hours)} label="Horas" />
            <Colon />
            <TimeTile value={pad(remaining.minutes)} label="Min" />
            <Colon />
            <TimeTile value={pad(remaining.seconds)} label="Seg" accent={look.accent} tick={!ended} />
          </div>
        </div>

        {/* La mecha: lo que queda del invierno, consumiéndose hacia la izquierda. */}
        <div aria-hidden="true" className="relative h-1.5 w-full rounded-full bg-[#eef7fc]/10">
          {!ended && (
            <div
              className={cn('relative h-full rounded-full bg-linear-to-r', look.fuse)}
              style={{ width: `${left * 100}%` }}
            >
              <span
                className={cn('winter-fuse-spark absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rounded-full', look.spark)}
              />
            </div>
          )}
        </div>

        {/* El último día ya es el cierre de hoy: no se repite. */}
        {stage !== 'ended' && stage !== 'lastDay' && <TodayCloses now={now} accent={look.accent} />}
      </section>
    </div>
  );
}

/** El cierre de hoy a medianoche de Bogotá, o el aviso del domingo libre. */
function TodayCloses({ now, accent }: { now: number; accent: string }) {
  if (bogotaIsoWeekday(now) === WINTER_ARC_REST_WEEKDAY) {
    return (
      <p className="flex items-center gap-2 text-xs text-[#eef7fc]/60">
        <Moon aria-hidden="true" className="size-3.5 shrink-0" />
        Domingo libre. Mañana vuelve el código.
      </p>
    );
  }

  const today = splitRemaining(bogotaDayEndsAt(now) - now);

  return (
    <p className="flex items-center gap-2 text-xs text-[#eef7fc]/60">
      <Hourglass aria-hidden="true" className={cn('size-3.5 shrink-0', accent)} />
      <span>
        Hoy se cierra en{' '}
        <span className={cn('font-mono font-semibold tabular-nums', accent)}>
          {pad(today.hours)}:{pad(today.minutes)}:{pad(today.seconds)}
        </span>
        <span className="hidden sm:inline">. A medianoche se juzga tu día.</span>
      </span>
    </p>
  );
}

function TimeTile({ value, label, accent, tick }: { value: string; label: string; accent?: string; tick?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="grid min-w-14 gap-0.5 overflow-hidden rounded-lg border border-[#eef7fc]/10 bg-[#060d16]/70 px-2 py-2 text-center sm:min-w-16"
    >
      <span className={cn('font-mono text-2xl leading-none font-bold text-[#eef7fc] tabular-nums sm:text-3xl', accent)}>
        {/* Cambiar la key remonta el número y repite la animación cada segundo. */}
        <span key={tick ? value : undefined} className={cn('inline-block', tick && 'winter-tick')}>
          {value}
        </span>
      </span>
      <span className="text-[0.55rem] font-semibold tracking-[0.16em] text-[#eef7fc]/50 uppercase">{label}</span>
    </span>
  );
}

function Colon() {
  return (
    <span aria-hidden="true" className="pt-2 font-mono text-xl font-bold text-[#eef7fc]/35 sm:text-2xl">
      :
    </span>
  );
}
