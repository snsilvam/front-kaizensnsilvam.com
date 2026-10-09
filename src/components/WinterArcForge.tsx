import { cn } from '../lib/utils';
import { FORGE_STAGES, forgeProgress, type ForgeStage } from '../lib/samuraiForge';
import type { WinterArcStatus } from '../types/winterArc';

interface WinterArcForgeProps {
  /** Días del reto con todas las reglas cumplidas. */
  forgedDays: number;
  status: WinterArcStatus;
}

/**
 * La forja del samurái: en qué etapa va el reto según sus días forjados.
 *
 * No pide nada al backend: cuenta los mismos días del grid. Un reto perdido
 * conserva la etapa que alcanzó; uno completado es siempre un samurái.
 */
export function WinterArcForge({ forgedDays, status }: WinterArcForgeProps) {
  const { current, index, next, missing, percent } = forgeProgress(forgedDays, status === 'completed');
  const failed = status === 'failed';

  return (
    <div className="grid gap-5">
      <div className="flex items-start gap-4">
        <span
          lang="ja"
          aria-hidden="true"
          className={cn(
            'grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-bold shadow-lg',
            failed ? 'bg-muted text-muted-foreground shadow-none' : 'bg-[#0b1624] text-[#cfe8f5] shadow-[#7cc4e8]/30',
          )}
        >
          {current.mark}
        </span>
        <div className="grid min-w-0 gap-1">
          <p className="text-[0.62rem] font-semibold tracking-[0.22em] text-[#1d6a8f] uppercase">
            {failed ? 'La forja se detuvo en' : 'La forja del samurái'}
          </p>
          <p className="text-xl font-bold tracking-[-0.03em]">
            {current.name}{' '}
            <span className="text-sm font-medium tracking-normal text-muted-foreground">
              <span lang="ja">{current.kanji}</span> · {current.romaji}
            </span>
          </p>
          <p className="text-sm text-pretty text-muted-foreground">
            {failed ? 'El acero que trabajaste no se pierde. Vuelve a la forja cuando estés listo.' : current.precept}
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-7 gap-1" aria-label="Etapas de la forja">
        {FORGE_STAGES.map((stage, i) => {
          const reached = i <= index;
          const isCurrent = i === index;
          return (
            <li key={stage.romaji} title={`${stage.name} · ${requirement(stage)}`} className="grid justify-items-center gap-1">
              <span
                lang="ja"
                aria-hidden="true"
                className={cn(
                  'grid size-8 place-items-center rounded-full border text-sm font-semibold transition-colors sm:size-9',
                  isCurrent && !failed && 'border-[#0b1624] bg-[#0b1624] text-[#cfe8f5] shadow-md shadow-[#7cc4e8]/40',
                  isCurrent && failed && 'border-muted-foreground/40 bg-muted text-foreground',
                  reached && !isCurrent && 'border-[#2b7fa8]/30 bg-[#2b7fa8]/10 text-[#1d6a8f]',
                  !reached && 'border-dashed border-border text-muted-foreground/45',
                )}
              >
                {stage.mark}
              </span>
              <span aria-hidden="true" className="font-mono text-[0.6rem] text-muted-foreground">
                {stage.days ?? 90}
              </span>
              <span className="sr-only">
                {stage.name}: {reached ? 'alcanzada' : requirement(stage)}
              </span>
            </li>
          );
        })}
      </ol>

      {next && !failed && (
        <div>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              Siguiente: <span className="font-semibold text-foreground">{next.name}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {missing === null ? 'llega vivo al día 90' : missing === 1 ? 'falta 1 día forjado' : `faltan ${missing} días forjados`}
            </span>
          </div>
          {percent !== null && (
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label={`Avance hacia ${next.name}`}
            >
              <div className="h-full rounded-full bg-[#2b7fa8] transition-[width] duration-700" style={{ width: `${percent}%` }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function requirement(stage: ForgeStage): string {
  if (stage.days === null) return 'completa los 90 días';
  if (stage.days === 0) return 'el punto de partida';
  return stage.days === 1 ? '1 día forjado' : `${stage.days} días forjados`;
}
