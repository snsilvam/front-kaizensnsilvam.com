import { useEffect, useRef, useState } from 'react';
import { PartyPopper, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { DebtBalanceSheet } from '../components/DebtBalanceSheet';
import { DebtFormSheet } from '../components/DebtFormSheet';
import { DebtHistorySheet } from '../components/DebtHistorySheet';
import { DebtMonthlyAmountSheet } from '../components/DebtMonthlyAmountSheet';
import { DebtNextPayment } from '../components/DebtNextPayment';
import { DebtPaymentSheet } from '../components/DebtPaymentSheet';
import { DebtPlanCard } from '../components/DebtPlanCard';
import { DebtRow } from '../components/DebtRow';
import { ErrorMessage } from '../components/ErrorMessage';
import { PageHeader } from '../components/PageHeader';
import { useDebts } from '../hooks/useDebts';
import { cannons } from '../lib/confetti';
import {
  addDebtPayment,
  createDebt,
  deleteDebt,
  deleteDebtPayment,
  setDebtMonthlyAmount,
  updateDebt,
  updateDebtBalance,
} from '../services/debts';
import type { Debt, DebtInput } from '../types/debt';

/** Los colores de la celebración: el verde de "saldada" y el oro de la meta. */
const PAID_OFF_COLORS = ['#16a34a', '#4ade80', '#facc15', '#0ea5e9', '#ffffff'];

type Sheet =
  | { type: 'form'; debt?: Debt }
  | { type: 'pay'; debt: Debt }
  | { type: 'balance'; debt: Debt }
  | { type: 'history'; debt: Debt }
  | { type: 'monthly' }
  | { type: 'delete'; debt: Debt }
  | null;

/**
 * Deudas (spec 005), dentro de Finanzas. Primero la acción: el estado del mes,
 * el próximo pago con "Pagar con PSE" y "Ya pagué". Después el plan
 * (avalancha), las deudas en su orden y las saldadas.
 *
 * Kaizen no mueve plata: el botón PSE abre la página de pagos de la entidad y
 * la persona vuelve a registrar lo que pagó. Deudas no cambia el disponible
 * del inicio de Finanzas.
 */
export function Debts() {
  const { summary, entities, loading, error, reload, busy, run } = useDebts();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);

  // Celebra cuando una deuda pasa a saldada (FR-014), no al cargar la página.
  const paidOffIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!summary) return;
    const now = new Set(summary.paidOff.map((debt) => debt.id));
    const before = paidOffIds.current;
    paidOffIds.current = now;
    if (!before) return;
    const fresh = summary.paidOff.find((debt) => !before.has(debt.id));
    if (fresh) {
      setCelebration(`¡Saldaste ${fresh.displayName}! Una deuda menos.`);
      cannons(80, PAID_OFF_COLORS);
    }
  }, [summary]);

  function open(next: Sheet) {
    setSheetError(null);
    setSheet(next);
  }

  async function save(action: () => Promise<Awaited<ReturnType<typeof createDebt>>>) {
    const message = await run(action);
    if (message) setSheetError(message);
    else setSheet(null);
  }

  const debtFor = (id: string) => summary?.debts.find((debt) => debt.id === id);

  if (loading && !summary) {
    return <p className="mx-auto max-w-3xl text-muted-foreground">Cargando tus deudas…</p>;
  }
  if (error || !summary) {
    return <ErrorMessage title="No pudimos cargar tus deudas" message={error ?? ''} onRetry={reload} />;
  }

  const empty = summary.progress.debtsCount === 0;
  const free = !empty && summary.debts.length === 0;

  return (
    <section className="mx-auto max-w-3xl space-y-5" aria-labelledby="debts-title">
      <PageHeader
        id="debts-title"
        eyebrow="Una cuota a la vez"
        title="Deudas"
        description="Tu plan para salir de deudas con bancos y entidades de Colombia."
        actions={
          <Button type="button" onClick={() => open({ type: 'form' })}>
            <Plus aria-hidden="true" />
            Registrar deuda
          </Button>
        }
      />

      {celebration && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          <span className="flex items-center gap-2">
            <PartyPopper aria-hidden="true" className="size-4" />
            {celebration}
          </span>
          <Button type="button" size="xs" variant="ghost" onClick={() => setCelebration(null)}>
            Cerrar
          </Button>
        </div>
      )}

      {empty && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center">
          <p className="text-lg font-semibold">Registra tu primera deuda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tarjeta, libre inversión, libranza… Kaizen te dice a cuál pagarle primero y cuándo quedas libre.
          </p>
          <Button type="button" className="mt-4" onClick={() => open({ type: 'form' })}>
            <Plus aria-hidden="true" />
            Registrar deuda
          </Button>
        </div>
      )}

      {free && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <p className="text-2xl font-bold">¡Libre de deudas!</p>
          <p className="mt-1 text-sm text-muted-foreground">Saldaste todo. Si aparece una nueva, regístrala aquí.</p>
        </div>
      )}

      {!empty && !free && (
        <>
          <DebtNextPayment
            summary={summary}
            onPaid={(id) => {
              const debt = debtFor(id);
              if (debt) open({ type: 'pay', debt });
            }}
          />
          <DebtPlanCard summary={summary} onChangeAmount={() => open({ type: 'monthly' })} />

          <section aria-labelledby="debts-list-title">
            <h2 id="debts-list-title" className="mb-3 text-sm font-semibold text-muted-foreground">
              Tus deudas, en el orden del plan
            </h2>
            <ul className="space-y-3">
              {summary.debts.map((debt) => (
                <DebtRow
                  key={debt.id}
                  debt={debt}
                  onPay={() => open({ type: 'pay', debt })}
                  onBalance={() => open({ type: 'balance', debt })}
                  onHistory={() => open({ type: 'history', debt })}
                  onEdit={() => open({ type: 'form', debt })}
                />
              ))}
            </ul>
          </section>
        </>
      )}

      {summary.paidOff.length > 0 && (
        <section aria-labelledby="debts-paid-title">
          <h2 id="debts-paid-title" className="mb-3 text-sm font-semibold text-muted-foreground">
            Deudas saldadas
          </h2>
          <ul className="space-y-3">
            {summary.paidOff.map((debt) => (
              <DebtRow
                key={debt.id}
                debt={debt}
                onPay={() => undefined}
                onBalance={() => open({ type: 'balance', debt })}
                onHistory={() => open({ type: 'history', debt })}
                onEdit={() => open({ type: 'form', debt })}
              />
            ))}
          </ul>
        </section>
      )}

      <DebtFormSheet
        open={sheet?.type === 'form'}
        debt={sheet?.type === 'form' ? sheet.debt : undefined}
        entities={entities}
        saving={busy}
        error={sheetError}
        onCancel={() => setSheet(null)}
        onSubmit={(input: DebtInput) => {
          const editing = sheet?.type === 'form' ? sheet.debt : undefined;
          return save(() => (editing ? updateDebt(editing.id, input) : createDebt(input)));
        }}
        onDelete={() => {
          if (sheet?.type === 'form' && sheet.debt) open({ type: 'delete', debt: sheet.debt });
        }}
      />
      <DebtPaymentSheet
        debt={sheet?.type === 'pay' ? sheet.debt : null}
        saving={busy}
        error={sheetError}
        onCancel={() => setSheet(null)}
        onSubmit={(amount, paidOn) => {
          if (sheet?.type !== 'pay') return;
          return save(() => addDebtPayment(sheet.debt.id, amount, paidOn));
        }}
      />
      <DebtBalanceSheet
        debt={sheet?.type === 'balance' ? sheet.debt : null}
        saving={busy}
        error={sheetError}
        onCancel={() => setSheet(null)}
        onSubmit={(balance) => {
          if (sheet?.type !== 'balance') return;
          return save(() => updateDebtBalance(sheet.debt.id, balance));
        }}
      />
      <DebtHistorySheet
        debt={sheet?.type === 'history' ? sheet.debt : null}
        saving={busy}
        onClose={() => setSheet(null)}
        onDelete={(payment) => {
          if (sheet?.type !== 'history') return Promise.resolve(null);
          return run(() => deleteDebtPayment(sheet.debt.id, payment.id));
        }}
      />
      <DebtMonthlyAmountSheet
        open={sheet?.type === 'monthly'}
        summary={summary}
        saving={busy}
        error={sheetError}
        onCancel={() => setSheet(null)}
        onSubmit={(amount) => save(() => setDebtMonthlyAmount(amount))}
      />
      <ConfirmDeleteDialog
        open={sheet?.type === 'delete'}
        itemType="deuda"
        itemName={sheet?.type === 'delete' ? `${sheet.debt.displayName} y sus pagos` : ''}
        isDeleting={busy}
        onCancel={() => setSheet(null)}
        onConfirm={() => {
          if (sheet?.type !== 'delete') return;
          return save(() => deleteDebt(sheet.debt.id));
        }}
      />
    </section>
  );
}
