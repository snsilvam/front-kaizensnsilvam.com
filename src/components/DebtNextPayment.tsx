import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { PsePayButton } from './PsePayButton';
import { dueText, money } from '../lib/debts';
import type { DebtSummary } from '../types/debt';

interface DebtNextPaymentProps {
  summary: DebtSummary;
  onPaid: (debtId: string) => void;
}

/**
 * Lo primero que se ve en Deudas (FR-017): si va al dia, el proximo pago con
 * su cuenta atras y las dos acciones, pagar con PSE y "Ya pague". Cabe en una
 * pantalla de 360 px sin desplazarse.
 */
export function DebtNextPayment({ summary, onPaid }: DebtNextPaymentProps) {
  const next = summary.nextPayment;
  if (!next) return null;
  const late = next.daysUntil < 0;

  return (
    <section
      aria-labelledby="debt-next-title"
      className={`rounded-3xl border p-5 shadow-sm ${
        summary.upToDate ? 'border-border bg-card' : 'border-destructive/40 bg-destructive/5'
      }`}
    >
      <p
        className={`flex items-center gap-2 text-sm font-semibold ${
          summary.upToDate ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'
        }`}
      >
        {summary.upToDate ? (
          <CheckCircle2 aria-hidden="true" className="size-4" />
        ) : (
          <AlertTriangle aria-hidden="true" className="size-4" />
        )}
        {summary.upToDate
          ? 'Vas al día este mes'
          : `Tienes ${summary.lateCount} ${summary.lateCount === 1 ? 'pago atrasado' : 'pagos atrasados'}`}
      </p>

      <h2 id="debt-next-title" className="mt-4 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        Próximo pago
      </h2>
      <p className="mt-1 truncate text-base font-semibold text-foreground">{next.displayName}</p>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-heading text-3xl font-bold tracking-[-0.03em] tabular-nums text-foreground">
          {money(next.amount)}
        </span>
        <span className={`text-sm font-semibold ${late ? 'text-destructive' : 'text-muted-foreground'}`}>
          {dueText(next.daysUntil, next.dueDate)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {next.paymentUrl ? (
          <PsePayButton url={next.paymentUrl} size="lg" />
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground sm:self-center">
            Paga en la app o la banca de tu entidad y vuelve a registrarlo.
          </p>
        )}
        <Button type="button" size="lg" variant="outline" className="w-full" onClick={() => onPaid(next.debtId)}>
          Ya pagué
        </Button>
      </div>
    </section>
  );
}
