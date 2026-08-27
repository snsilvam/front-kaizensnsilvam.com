import { CalendarCheck, Flame, Timer, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import type { KaizenHabitStats } from '../types/kaizenHabit';

interface HabitStatsProps {
  stats: KaizenHabitStats | null;
  loading: boolean;
}

/** Racha y totales del habito seleccionado (GET /kaizen-habits/:id/stats). */
export function HabitStats({ stats, loading }: HabitStatsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        icon={Flame}
        label="Racha actual"
        value={stats.currentStreak}
        detail={stats.currentStreak === 1 ? 'día seguido' : 'días seguidos'}
        highlight
      />
      <StatTile
        icon={Trophy}
        label="Racha más larga"
        value={stats.longestStreak}
        detail={stats.longestStreak === 1 ? 'día' : 'días'}
      />
      <StatTile
        icon={CalendarCheck}
        label="Completas"
        value={stats.completeRepetitions}
        detail={`de ${stats.totalRepetitions} repeticiones`}
      />
      <StatTile
        icon={Timer}
        label="Mínimas"
        value={stats.minimumRepetitions}
        detail="versión de 2 minutos"
      />
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  detail,
  highlight = false,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3.5 py-3 ${
        highlight ? 'border-primary/25 bg-accent' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.06em] uppercase text-muted-foreground">
        <Icon aria-hidden="true" className="size-3.5" />
        {label}
      </div>
      <p className={`mt-2 text-2xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
