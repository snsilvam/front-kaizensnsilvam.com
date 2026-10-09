import { useState } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { SurvivalFlame } from './SurvivalFlame';
import { WinterArcForge } from './WinterArcForge';
import type { UseWinterArcGrid } from '../hooks/useWinterArcGrid';
import { cn } from '../lib/utils';
import { ApiError } from '../services/api';
import { syncWinterArcToday } from '../services/winterArc';
import type { WinterArcDay } from '../types/winterArc';

type DayState = 'future' | 'today' | 'success' | 'failed';

interface WinterArcGridProps {
  winterArcId: string;
  /**
   * El grid lo carga la página (useWinterArcGrid) para compartirlo con el
   * horario del día: al sincronizar se recargan los dos.
   */
  grid: UseWinterArcGrid;
}

/**
 * Los 90 días del reto al estilo GitHub contributions: una columna por semana,
 * de lunes a domingo. Pasado y futuro se deciden con el `today` del servidor,
 * no con el reloj del navegador. Encima va la etapa de la forja del samurái,
 * que cuenta los mismos días cumplidos.
 *
 * Si el reto se perdió (3 días fallados seguidos, lo decide el backend) la
 * llama queda en cenizas, el grid pasa a grises y ya no se puede sincronizar.
 */
export function WinterArcGrid({ winterArcId, grid }: WinterArcGridProps) {
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

  const {
    days,
    today,
    start_date: startDate,
    end_date: endDate,
    consecutive_failed_days: consecutiveFailedDays,
    failed_on_day: failedOnDay,
  } = grid.data;
  const failed = grid.data.status === 'failed';
  const todayDay = days.find((day) => day.date === today);
  const successes = days.filter((day) => day.is_successful).length;
  // Con el reto perdido el error de sincronizar ya no aporta nada: lo dice la pantalla.
  const alertMessage = failed ? grid.error : (syncError ?? grid.error);

  async function syncToday() {
    setSyncing(true);
    setSyncError(null);
    try {
      await syncWinterArcToday(winterArcId);
      grid.reload();
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : 'No pudimos sincronizar el día.');
      // 409: el reto pudo perderse con la vista abierta (p. ej. pasó la
      // medianoche). Recargar trae el estado real del backend.
      if (err instanceof ApiError && err.status === 409) grid.reload();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className="grid gap-6" aria-label="Progreso del Winter Arc">
      <WinterArcForge forgedDays={successes} status={grid.data.status} />

      <div aria-hidden="true" className="h-px w-full bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="grid gap-4">
        {failed ? (
          <div className="grid gap-1">
            <p className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em]">
              <SurvivalFlame consecutiveFailedDays={consecutiveFailedDays} extinguished />
              {failedOnDay ? `El Winter Arc terminó en el Día ${failedOnDay}.` : 'El Winter Arc terminó.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Tres días seguidos cedidos al placer apagaron la llama.{' '}
              <span className="font-mono">
                {successes} de {days.length} días forjados
              </span>
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em]">
              {todayDay ? `Día ${todayDay.day_number} de ${days.length}` : `${startDate} → ${endDate}`}
              <SurvivalFlame consecutiveFailedDays={consecutiveFailedDays} />
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              {successes === 1 ? '1 día forjado' : `${successes} días forjados`}
            </p>
          </div>
        )}

        {/* El cementerio: al perder el reto todo el grid queda en grises. */}
        <div className={cn('grid gap-4 transition-[filter,opacity] duration-700', failed && 'opacity-60 grayscale')}>
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
                      day.date === today && !failed && 'ring-2 ring-foreground ring-offset-1 ring-offset-background',
                    )}
                  />
                );
              })}
            </ol>
          </div>

          <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Legend className={STATE_CLASS.future} label="por forjar" />
            <Legend className={STATE_CLASS.success} label="forjado" />
            <Legend className={STATE_CLASS.failed} label="cedido al placer" />
          </ul>
        </div>

        {alertMessage && (
          <Alert variant="destructive">
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={syncToday}
          disabled={failed || syncing || !todayDay}
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar hoy'}
        </Button>
      </div>
    </section>
  );
}

const STATE_CLASS: Record<DayState, string> = {
  future: 'bg-muted',
  // Hoy sin cumplir todavía no es un fallo: el día no ha terminado.
  today: 'bg-muted',
  // Acero templado: el azul de la escarcha, no el verde de finanzas.
  success: 'bg-[#2b7fa8]',
  failed: 'bg-destructive',
};

const STATE_LABEL: Record<DayState, string> = {
  future: 'por forjar',
  today: 'hoy, por forjar',
  success: 'forjado',
  failed: 'cedido al placer',
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
