import { Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import { WINTER_ARC_MAX_CONSECUTIVE_FAILURES } from '../types/winterArc';

type FlameLevel = 'burning' | 'weak' | 'dying' | 'ashes';

interface SurvivalFlameProps {
  /** Días fallados seguidos, tal como los calcula el backend. */
  consecutiveFailedDays: number;
  /** El reto se perdió: la llama queda en cenizas. */
  extinguished?: boolean;
}

/**
 * La llama del Winter Arc: arde con 0 fallos seguidos, se debilita con 1 y
 * parpadea en rojo con 2. Al perderse el reto queda gris y sin fuego.
 */
export function SurvivalFlame({ consecutiveFailedDays, extinguished = false }: SurvivalFlameProps) {
  const level = flameLevel(consecutiveFailedDays, extinguished);
  const showCount = level === 'weak' || level === 'dying';

  return (
    <span role="img" aria-label={FLAME_LABEL[level]} title={FLAME_LABEL[level]} className="inline-flex items-center gap-1">
      <Flame aria-hidden="true" className={cn('size-5 transition-[scale,color,fill] duration-500', FLAME_CLASS[level])} />
      {showCount && (
        <span aria-hidden="true" className={cn('font-mono text-xs', COUNT_CLASS[level])}>
          {consecutiveFailedDays}/{WINTER_ARC_MAX_CONSECUTIVE_FAILURES}
        </span>
      )}
    </span>
  );
}

function flameLevel(consecutiveFailedDays: number, extinguished: boolean): FlameLevel {
  if (extinguished) return 'ashes';
  if (consecutiveFailedDays >= 2) return 'dying';
  if (consecutiveFailedDays === 1) return 'weak';
  return 'burning';
}

const FLAME_CLASS: Record<FlameLevel, string> = {
  burning: 'fill-orange-400 text-orange-500 winter-flame-burning',
  weak: 'scale-90 fill-amber-300/60 text-amber-500 opacity-80',
  dying: 'scale-75 fill-red-500/30 text-red-600 winter-flame-dying',
  ashes: 'fill-none text-muted-foreground/50',
};

const COUNT_CLASS: Record<FlameLevel, string> = {
  burning: '',
  weak: 'text-amber-600',
  dying: 'text-red-600',
  ashes: '',
};

const FLAME_LABEL: Record<FlameLevel, string> = {
  burning: 'Llama encendida: ningún día fallado seguido',
  weak: 'Llama débil: 1 día fallado',
  dying: 'Llama casi apagada: 2 días fallados seguidos. Un fallo más termina el reto',
  ashes: 'Llama apagada: el reto terminó',
};
