import { useEffect, useState } from 'react';
import { Snowflake } from 'lucide-react';
import { pad, splitRemaining } from '../lib/countdown';
import { formatDayKey } from '../lib/habitDates';
import {
  WINTER_ARC_SEASON_DAYS,
  WINTER_ARC_SEASON_ENDS_AT,
  WINTER_ARC_SEASON_ENDS_ON,
  WINTER_ARC_SEASON_STARTS_AT,
} from '../lib/winterArcSeason';

/**
 * Cuenta atrás en vivo de los 90 días del invierno, hasta el cero del
 * 31 de diciembre. Vive en el header de WinterArcLayout, así que solo se ve
 * dentro del modulo Winter Arc.
 *
 * Es global, no del reto del usuario: el grid de cada reto lleva sus propios
 * 90 días desde el setup.
 */
export function WinterArcSeasonCountdown() {
  const [now, setNow] = useState(() => Date.now());
  const ended = now >= WINTER_ARC_SEASON_ENDS_AT;

  useEffect(() => {
    if (ended) return;

    const id = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= WINTER_ARC_SEASON_ENDS_AT) window.clearInterval(id);
    }, 1000);

    return () => window.clearInterval(id);
  }, [ended]);

  const remaining = splitRemaining(WINTER_ARC_SEASON_ENDS_AT - now);
  const elapsed = Math.min(
    1,
    Math.max(0, (now - WINTER_ARC_SEASON_STARTS_AT) / (WINTER_ARC_SEASON_ENDS_AT - WINTER_ARC_SEASON_STARTS_AT)),
  );

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
      <div className="grid gap-3 rounded-xl border border-[#7cc4e8]/25 bg-[#eef7fc]/5 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="flex items-center gap-2.5">
            <Snowflake aria-hidden="true" className="size-4 shrink-0 text-[#7cc4e8]" />
            <div className="grid leading-tight">
              <span className="text-[0.62rem] font-semibold tracking-[0.2em] text-[#7cc4e8] uppercase">
                {ended ? 'El invierno terminó' : `Quedan del invierno · ${WINTER_ARC_SEASON_DAYS} días`}
              </span>
              <span className="text-xs text-[#eef7fc]/60">Llega a cero el {formatDayKey(WINTER_ARC_SEASON_ENDS_ON)}</span>
            </div>
          </div>

          <p
            role="timer"
            aria-label={`Quedan ${remaining.days} días, ${remaining.hours} horas, ${remaining.minutes} minutos y ${remaining.seconds} segundos del invierno`}
            className="flex items-baseline gap-2.5 font-mono text-[#eef7fc] tabular-nums"
          >
            <TimeUnit value={String(remaining.days)} unit="d" />
            <TimeUnit value={pad(remaining.hours)} unit="h" />
            <TimeUnit value={pad(remaining.minutes)} unit="m" />
            <TimeUnit value={pad(remaining.seconds)} unit="s" />
          </p>
        </div>

        {/* Lo que ya se gastó de los 90 días. */}
        <div aria-hidden="true" className="h-1 w-full overflow-hidden rounded-full bg-[#eef7fc]/10">
          <div
            className="h-full rounded-full bg-linear-to-r from-[#7cc4e8]/60 to-[#cfe8f5]"
            style={{ width: `${elapsed * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, unit }: { value: string; unit: string }) {
  return (
    <span aria-hidden="true">
      <span className="text-xl font-bold sm:text-2xl">{value}</span>
      <span className="ml-0.5 text-xs text-[#7cc4e8]">{unit}</span>
    </span>
  );
}
