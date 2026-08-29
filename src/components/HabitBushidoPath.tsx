import { Swords } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { BUSHIDO_VIRTUES, bushidoProgress } from '../lib/bushido';
import type { KaizenHabitStats } from '../types/kaizenHabit';

interface HabitBushidoPathProps {
  stats: KaizenHabitStats | null;
  loading: boolean;
}

/**
 * El camino del Bushido: las siete virtudes del codigo samurai como etapas del
 * habito.
 *
 * No agrega datos nuevos, lee las repeticiones que ya trae GET
 * /kaizen-habits/:id/stats. Es la misma cifra contada de otra forma: cuanto
 * camino llevas andado y que falta para la siguiente virtud.
 */
export function HabitBushidoPath({ stats, loading }: HabitBushidoPathProps) {
  if (loading || !stats) {
    return <Skeleton className="h-56 rounded-xl" />;
  }

  const total = stats.totalRepetitions;
  const { current, next, missing, percent } = bushidoProgress(total);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-accent/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords aria-hidden="true" className="size-5 text-primary" />
          El camino del Bushidō
        </CardTitle>
        <CardDescription>
          Las siete virtudes del código de los samuráis. Cada una se abre repitiendo.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <ol className="m-0 flex list-none flex-wrap justify-between gap-2 p-0">
          {BUSHIDO_VIRTUES.map((virtue) => {
            const reached = total >= virtue.repetitions;
            const isCurrent = current?.romaji === virtue.romaji;

            return (
              <li key={virtue.romaji} className="flex flex-1 basis-16 flex-col items-center gap-1.5">
                <span
                  lang="ja"
                  aria-hidden="true"
                  className={`grid size-11 place-items-center rounded-full border text-lg font-semibold transition-colors ${
                    isCurrent
                      ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : reached
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-dashed border-border bg-card text-muted-foreground/50'
                  }`}
                >
                  {virtue.kanji}
                </span>
                <span
                  className={`text-center text-[0.7rem] leading-tight font-semibold ${
                    reached ? 'text-foreground' : 'text-muted-foreground/60'
                  }`}
                >
                  {virtue.romaji}
                  <span className="sr-only"> · {virtue.name}</span>
                </span>
                <span className="text-[0.65rem] text-muted-foreground">{virtue.repetitions}</span>
              </li>
            );
          })}
        </ol>

        <div className="rounded-xl border border-primary/15 bg-background/70 px-4 py-3.5">
          {current ? (
            <>
              <p className="text-xs font-bold tracking-[0.08em] text-primary uppercase">
                {current.romaji} · {current.name}
              </p>
              <p className="mt-1.5 text-sm text-foreground">{current.precept}</p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold tracking-[0.08em] text-primary uppercase">
                El camino empieza
              </p>
              <p className="mt-1.5 text-sm text-foreground">
                Registra tu primera repetición y alcanzarás {BUSHIDO_VIRTUES[0].romaji} ·{' '}
                {BUSHIDO_VIRTUES[0].name}.
              </p>
            </>
          )}
        </div>

        {next ? (
          <div>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Siguiente: <span className="font-semibold text-foreground">{next.romaji}</span> ·{' '}
                {next.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {missing === 1 ? 'falta 1 repetición' : `faltan ${missing} repeticiones`}
              </span>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label={`Avance hacia ${next.name}`}
            >
              <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-primary">
            Recorriste las siete virtudes. Un samurái no llega al final del camino: lo sostiene.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
