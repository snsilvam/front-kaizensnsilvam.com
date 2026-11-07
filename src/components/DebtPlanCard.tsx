import { Flag } from 'lucide-react';
import { Button } from './ui/button';
import { formatMonth, money } from '../lib/debts';
import type { DebtSummary } from '../types/debt';

interface DebtPlanCardProps {
  summary: DebtSummary;
  onChangeAmount: () => void;
}

/**
 * El plan de avalancha en una tarjeta: cuando queda libre, cuanto paga en
 * intereses (estimado), con que monto al mes y como va el avance.
 */
export function DebtPlanCard({ summary, onChangeAmount }: DebtPlanCardProps) {
  const { plan, progress } = summary;
  const stuckNames = summary.debts.filter((debt) => debt.stuck).map((debt) => debt.displayName);

  return (
    <section aria-labelledby="debt-plan-title" className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <h2 id="debt-plan-title" className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-primary uppercase">
        <Flag aria-hidden="true" className="size-3.5" />
        Tu plan (avalancha)
      </h2>

      {plan.debtFreeMonth ? (
        <p className="mt-2 text-lg leading-snug text-foreground">
          Libre de deudas en <strong className="font-bold">{formatMonth(plan.debtFreeMonth)}</strong>
        </p>
      ) : (
        stuckNames.length > 0 && (
          <p className="mt-2 text-sm leading-relaxed text-destructive">
            Con este monto, {stuckNames.join(', ')} no baja: la cuota no cubre los intereses. Sube el monto o revisa la
            cuota.
          </p>
        )
      )}
      {plan.totalInterest !== null && (
        <p className="mt-1 text-sm text-muted-foreground">
          Pagarías unos <span className="font-semibold text-foreground">{money(plan.totalInterest)}</span> en intereses
          (estimado).
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted/60 px-4 py-3">
        <p className="text-sm text-foreground">
          <span className="font-semibold tabular-nums">{money(plan.monthlyAmount)}</span> al mes
          {plan.onlyMinimums && <span className="text-muted-foreground"> · solo los mínimos</span>}
        </p>
        <Button type="button" size="sm" variant="outline" onClick={onChangeAmount}>
          {summary.monthlyAmount === null ? 'Poner más plata' : 'Cambiar monto'}
        </Button>
      </div>
      {plan.amountTooLow && (
        <p className="mt-2 text-xs text-destructive">
          Tu monto ya no alcanza para las cuotas mínimas ({money(plan.minimumsTotal)}); el plan usa los mínimos.
        </p>
      )}
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        La plata que sobra después de los mínimos va a la deuda de mayor tasa. Al saldarla, su cuota pasa a la siguiente.
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-border px-2 py-3">
          <dt className="text-[0.7rem] text-muted-foreground">Debes</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">{money(progress.totalBalance)}</dd>
        </div>
        <div className="rounded-2xl border border-border px-2 py-3">
          <dt className="text-[0.7rem] text-muted-foreground">Has pagado</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">{money(progress.totalPaid)}</dd>
        </div>
        <div className="rounded-2xl border border-border px-2 py-3">
          <dt className="text-[0.7rem] text-muted-foreground">Saldadas</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">
            {progress.paidOffCount} de {progress.debtsCount}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[0.7rem] leading-relaxed text-muted-foreground">
        Es una estimación: el banco cobra intereses por días y suma seguros y cuota de manejo. Actualiza el saldo con tu
        extracto para afinarla.
      </p>
    </section>
  );
}
