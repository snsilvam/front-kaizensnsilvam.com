import { useState } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { useWinterArcGrid } from '../hooks/useWinterArcGrid';
import { cn } from '../lib/utils';
import { syncWinterArcToday } from '../services/winterArc';
import type { WinterArcDay } from '../types/winterArc';

type DayState = 'future' | 'today' | 'success' | 'failed';

interface WinterArcGridProps {
  winterArcId: string;
}

/**
 * Los 90 días del reto al estilo GitHub contributions: una columna por semana,
 * de lunes a domingo. Pasado y futuro se deciden con el `today` del servidor,
 * no con el reloj del navegador.
 */
export function WinterArcGrid({ winterArcId }: WinterArcGridProps) {
  const grid = useWinterArcGrid(winterArcId);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Sólo el primer fetch muestra el esqueleto: al recargar tras sincronizar,
  // el grid anterior sigue en pantalla hasta que llega el nuevo.
  if (!grid.data) {
    if (grid.error) {
      return <ErrorMessage title="No pudimos cargar tu Winter Arc" message={grid.error} onRetry={grid.reload} />;
    }
    return <Skeleton className="h-36 w-full rounded-lg" aria-label="Cargando Winter Arc" />;
  }

  const { days, today, start_date: startDate } = grid.data;
  const todayDay = days.find((day) => day.date === today);
  const successes = days.filter((day) => day.is_successful).length;

  async function syncToday() {
    setSyncing(true);
    setSyncError(null);
    try {
      await syncWinterArcToday(winterArcId);
      grid.reload();
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : 'No pudimos sincronizar el día.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className="grid gap-4" aria-label="Progreso del Winter Arc">
      <p className="font-mono text-sm text-muted-foreground">
        {todayDay ? `día ${todayDay.day_number}/${days.length}` : `${startDate} → ${grid.data.end_date}`} · {successes} cumplidos
      </p>

      <div className="overflow-x-auto">
        <ol className="grid w-max grid-flow-col grid-rows-7 gap-1">
          {/* Huecos para que el día 1 caiga en su día de la semana. */}
          {Array.from({ length: mondayOffset(startDate) }, (_, i) => (
            <li key={`pad-${i}`} aria-hidden="true" className="size-4" />
          ))}
          {days.map((day) => {
            const state = dayState(day, today);
            return (
              <li
                key={day.day_number}
                title={`Día ${day.day_number} · ${day.date} · ${STATE_LABEL[state]}`}
                aria-label={`Día ${day.day_number}, ${day.date}: ${STATE_LABEL[state]}`}
                className={cn(
                  'size-4 rounded-[3px]',
                  STATE_CLASS[state],
                  day.date === today && 'ring-2 ring-foreground ring-offset-1 ring-offset-background',
                )}
              />
            );
          })}
        </ol>
      </div>

      <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend className={STATE_CLASS.future} label="futuro" />
        <Legend className={STATE_CLASS.success} label="cumplido" />
        <Legend className={STATE_CLASS.failed} label="fallado" />
      </ul>

      {(syncError ?? grid.error) && (
        <Alert variant="destructive">
          <AlertDescription>{syncError ?? grid.error}</AlertDescription>
        </Alert>
      )}

      <Button type="button" variant="outline" className="w-fit" onClick={syncToday} disabled={syncing || !todayDay}>
        {syncing ? 'Sincronizando...' : 'Sincronizar Hoy'}
      </Button>
    </section>
  );
}

const STATE_CLASS: Record<DayState, string> = {
  future: 'bg-muted',
  // Hoy sin cumplir todavía no es un fallo: el día no ha terminado.
  today: 'bg-muted',
  success: 'bg-primary',
  failed: 'bg-destructive',
};

const STATE_LABEL: Record<DayState, string> = {
  future: 'futuro',
  today: 'hoy, pendiente',
  success: 'cumplido',
  failed: 'fallado',
};

/** Las fechas son YYYY-MM-DD, así que se comparan como texto. */
function dayState(day: WinterArcDay, today: string): DayState {
  if (day.is_successful) return 'success';
  if (day.date > today) return 'future';
  if (day.date === today) return 'today';
  return 'failed';
}

/** Días entre el lunes de esa semana y `date` (lunes = 0). En UTC para no depender de la zona del navegador. */
function mondayOffset(date: string): number {
  return (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className={cn('size-3 rounded-[3px]', className)} />
      {label}
    </li>
  );
}
