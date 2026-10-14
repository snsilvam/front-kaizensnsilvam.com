import { Flame } from 'lucide-react';
import { SurvivalFlame } from './SurvivalFlame';
import { Skeleton } from './ui/skeleton';
import type { UseWinterArcGrid } from '../hooks/useWinterArcGrid';
import { countForgedDays, isTodayForged } from '../lib/samuraiForge';
import { cn } from '../lib/utils';
import { FIRE_BOX_CLASS, FIRE_FLAME_CLASS, FIRE_TEXT_CLASS, type FireTier } from '../lib/winterArcFire';

/**
 * Días forjados que encienden cada tramo del fuego. Siguen las etapas de la
 * forja (samuraiForge): el primer día, el plegado (7) y el temple (21).
 */
const TIER_FROM: { tier: Exclude<FireTier, 'off'>; days: number; name: string }[] = [
  { tier: 'green', days: 1, name: 'la llama verde' },
  { tier: 'fire', days: 7, name: 'el fuego amarillo' },
  { tier: 'purple', days: 21, name: 'el fuego morado' },
];

const TIER_LABEL: Record<FireTier, string> = {
  off: 'la forja está fría',
  green: 'encendida',
  fire: 'en llamas',
  purple: 'fuego morado',
};

/**
 * La racha del reto en grande, bajo el título: los días forjados con la llama
 * que sube de verde a fuego amarillo y a fuego morado, el día del reto y la
 * llama de supervivencia. Sólo con el reto activo: es lo que invita a volver a
 * cumplir hoy. Lee el mismo grid que el horario, así que se enciende al
 * sincronizar.
 */
export function WinterArcForgedStreak({ grid }: { grid: UseWinterArcGrid }) {
  if (!grid.data) {
    return grid.error ? null : <Skeleton className="h-40 w-full rounded-2xl" aria-label="Cargando tus días forjados" />;
  }
  if (grid.data.status !== 'active') return null;

  const { days, today, consecutive_failed_days: consecutiveFailedDays } = grid.data;
  const forged = countForgedDays(grid.data);
  const todayForged = isTodayForged(grid.data);
  const todayDay = days.find((day) => day.date === today);
  const tier = tierFor(forged);
  const nextTier = TIER_FROM.find((step) => step.days > forged);

  return (
    <section
      aria-label="Días forjados"
      className={cn('grid gap-4 rounded-2xl border p-5 transition-colors duration-500 sm:p-6', FIRE_BOX_CLASS[tier])}
    >
      <p className={cn('text-[0.62rem] font-semibold tracking-[0.22em] uppercase', FIRE_TEXT_CLASS[tier])}>
        Tu racha · {TIER_LABEL[tier]}
      </p>

      <div className="flex items-center gap-4 sm:gap-5">
        <Flame
          aria-hidden="true"
          className={cn('size-20 shrink-0 transition-[color,fill] duration-500 sm:size-24', FIRE_FLAME_CLASS[tier])}
        />
        <div className="min-w-0">
          <p className={cn('font-mono text-6xl leading-none font-black tabular-nums sm:text-7xl', FIRE_TEXT_CLASS[tier])}>
            {forged}
          </p>
          <p className="mt-1 text-lg font-semibold tracking-[-0.02em]">{forged === 1 ? 'día forjado' : 'días forjados'}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {todayDay && (
          <span className="font-semibold">
            Día {todayDay.day_number} de {days.length}
          </span>
        )}
        <SurvivalFlame consecutiveFailedDays={consecutiveFailedDays} />
      </div>

      <p className="text-sm text-pretty text-muted-foreground">
        {todayForged
          ? `Hoy ya está forjado. Vuelve mañana y van ${forged + 1}.`
          : `Cumple hoy todas tus reglas: van ${forged + 1}.`}
        {nextTier &&
          ` ${nextTier.days - forged === 1 ? 'Falta 1 día' : `Faltan ${nextTier.days - forged} días`} para ${nextTier.name}.`}
      </p>
    </section>
  );
}

function tierFor(forged: number): FireTier {
  let tier: FireTier = 'off';
  for (const step of TIER_FROM) {
    if (forged >= step.days) tier = step.tier;
  }
  return tier;
}
