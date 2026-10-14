// El fuego de la racha del Winter Arc: apagado, verde, fuego amarillo y fuego
// morado. Lo comparten la racha de hoy (WinterArcSchedule) y los días forjados
// (WinterArcForgedStreak); cada uno decide cuándo sube de tramo.

export type FireTier = 'off' | 'green' | 'fire' | 'purple';

export type LitFireTier = Exclude<FireTier, 'off'>;

export const LIT_FIRE_TIERS: LitFireTier[] = ['green', 'fire', 'purple'];

export const FIRE_BOX_CLASS: Record<FireTier, string> = {
  off: 'border-border bg-muted/40',
  green: 'border-emerald-200 bg-emerald-50',
  fire: 'border-amber-200 bg-amber-50',
  purple: 'border-purple-300 bg-purple-50',
};

export const FIRE_FLAME_CLASS: Record<FireTier, string> = {
  off: 'fill-none text-muted-foreground/50',
  green: 'fill-emerald-300 text-emerald-600 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] winter-flame-burning',
  fire: 'fill-yellow-300 text-orange-500 drop-shadow-[0_0_12px_rgba(251,146,60,0.75)] winter-flame-burning',
  purple: 'fill-fuchsia-400 text-purple-700 drop-shadow-[0_0_14px_rgba(168,85,247,0.8)] winter-flame-burning',
};

export const FIRE_TEXT_CLASS: Record<FireTier, string> = {
  off: 'text-muted-foreground',
  green: 'text-emerald-700',
  fire: 'text-orange-600',
  purple: 'text-purple-700',
};

export const FIRE_SEGMENT_CLASS: Record<LitFireTier, string> = {
  green: 'bg-linear-to-r from-emerald-400 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]',
  fire: 'bg-linear-to-r from-yellow-300 to-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.6)]',
  purple: 'bg-linear-to-r from-fuchsia-500 to-violet-600 shadow-[0_0_10px_rgba(168,85,247,0.65)]',
};
