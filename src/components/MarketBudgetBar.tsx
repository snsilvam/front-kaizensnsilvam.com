import { formatPesos, STATUS_LABELS } from '../lib/marketList';
import type { MarketStatus, MarketSummary } from '../types/market';

/**
 * Colores del semaforo sobre la superficie oscura. El estado lo decide el
 * backend; aqui solo se traduce a clases para que la cifra, la barra y la
 * etiqueta digan lo mismo.
 */
const STATUS_STYLES: Record<MarketStatus, { amount: string; bar: string; chip: string; text: string }> = {
  ok: {
    amount: 'text-hero-foreground',
    bar: 'bg-hero-accent',
    chip: 'bg-hero-accent/20 text-hero-accent',
    text: 'text-hero-foreground/80',
  },
  warning: {
    amount: 'text-amber-200',
    bar: 'bg-amber-300',
    chip: 'bg-amber-300/20 text-amber-200',
    text: 'text-amber-200',
  },
  exceeded: {
    amount: 'text-red-200',
    bar: 'bg-red-300',
    chip: 'bg-red-300/20 text-red-200',
    text: 'text-red-200',
  },
};

/** Porcentaje del presupuesto, saturado en 100: pasado el tope manda la cifra. */
function percentOf(amount: number, budget: number): number {
  if (budget <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((amount * 100) / budget)));
}

interface MarketBudgetBarProps {
  summary: MarketSummary;
}

/**
 * El presupuesto siempre a la vista: queda pegado bajo el header mientras se
 * baja por la lista, que es lo que uno mira entre estante y estante.
 *
 * La barra tiene dos capas: lo ya gastado, solido, y lo que costaria lo que
 * falta, tenue. Asi se ve de un vistazo si la lista todavia cabe.
 */
export function MarketBudgetBar({ summary }: MarketBudgetBarProps) {
  const styles = STATUS_STYLES[summary.status] ?? STATUS_STYLES.ok;
  const projected = STATUS_STYLES[summary.projectedStatus] ?? STATUS_STYLES.ok;
  const spentPercent = percentOf(summary.spent, summary.budget);
  const projectedPercent = percentOf(summary.estimatedTotal, summary.budget);
  const pendingEstimate = summary.estimatedTotal - summary.spent;

  return (
    <div className="sticky top-16 z-30 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-md sm:mx-0 sm:px-0">
      <section
        className="hero-surface rounded-2xl p-4 shadow-lg shadow-hero/20 sm:p-5"
        aria-label="Presupuesto de la lista"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-hero-foreground/75">Te queda</p>
            <p
              className={`text-[2rem] leading-tight font-bold tracking-[-0.045em] tabular-nums sm:text-4xl ${styles.amount}`}
              aria-live="polite"
            >
              {formatPesos(summary.remaining)}
            </p>
          </div>
          <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles.chip}`}>
            {STATUS_LABELS[summary.status] ?? STATUS_LABELS.ok}
          </span>
        </div>

        <div
          className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/15"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={spentPercent}
          aria-label="Presupuesto gastado"
        >
          <div
            className={`absolute inset-y-0 left-0 rounded-full opacity-35 transition-[width] ${projected.bar}`}
            style={{ width: `${projectedPercent}%` }}
          />
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-[width] ${styles.bar}`}
            style={{ width: `${spentPercent}%` }}
          />
        </div>

        <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs text-hero-foreground/75 tabular-nums">
          <span>
            Gastado <span className="font-semibold text-hero-foreground">{formatPesos(summary.spent)}</span> de{' '}
            {formatPesos(summary.budget)}
          </span>
          <span>
            <span className="font-semibold text-hero-foreground">
              {summary.purchasedCount}/{summary.itemsCount}
            </span>{' '}
            en el carro
          </span>
        </div>

        {pendingEstimate > 0 && (
          <p className={`mt-2.5 border-t border-white/10 pt-2.5 text-xs tabular-nums ${projected.text}`}>
            Lo que falta ≈ {formatPesos(pendingEstimate)} ·{' '}
            {summary.projectedRemaining >= 0 ? (
              <>
                quedarías con <span className="font-semibold">{formatPesos(summary.projectedRemaining)}</span>
              </>
            ) : (
              <>
                te pasarías por <span className="font-semibold">{formatPesos(-summary.projectedRemaining)}</span>
              </>
            )}
          </p>
        )}
      </section>
    </div>
  );
}
