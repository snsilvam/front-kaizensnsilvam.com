import { useState } from 'react';
import { ChevronRight, Plus, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ConfirmMarketBudgetDialog } from './ConfirmMarketBudgetDialog';
import { ErrorMessage } from './ErrorMessage';
import { MarketListDialog } from './MarketListDialog';
import { Skeleton } from './ui/skeleton';
import { formatDate, formatShortDate } from '../services/format';
import { useMarketBudgets } from '../hooks/useMarketBudgets';
import { formatPesos } from '../lib/marketList';
import type { PendingPayment } from '../services/pendingPayments';
import type { MarketBudget, MarketListInput, MarketStatus } from '../types/market';

const BAR_COLORS: Record<MarketStatus, string> = {
  ok: 'bg-primary',
  warning: 'bg-warning',
  exceeded: 'bg-destructive',
};

function openBudget(budgetId: string) {
  window.location.href = `/mercado?id=${encodeURIComponent(budgetId)}`;
}

/** Una lista con su avance: se ve cómo va sin tener que entrar. */
function MarketBudgetCard({ budget }: { budget: MarketBudget }) {
  const spentPercent =
    budget.budget > 0 ? Math.min(100, Math.round((budget.spent * 100) / budget.budget)) : 100;

  return (
    <button
      type="button"
      className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-xs transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-primary/5"
      onClick={() => openBudget(budget.id)}
    >
      <span className="flex w-full items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
        >
          <ShoppingCart className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-foreground">{budget.name}</span>
          <span className="block text-xs text-muted-foreground">
            Mercado del {formatShortDate(budget.dueDate)} ·{' '}
            {budget.itemsCount === 0
              ? 'sin productos'
              : `${budget.purchasedCount} de ${budget.itemsCount} en el carro`}
          </span>
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      </span>

      <span className="block w-full">
        <span className="block h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <span
            className={`block h-full rounded-full ${BAR_COLORS[budget.status] ?? BAR_COLORS.ok}`}
            style={{ width: `${spentPercent}%` }}
          />
        </span>
        <span className="mt-1.5 flex justify-between gap-3 text-xs text-muted-foreground tabular-nums">
          <span>
            Gastado <span className="font-semibold text-foreground">{formatPesos(budget.spent)}</span>
          </span>
          <span>de {formatPesos(budget.budget)}</span>
        </span>
      </span>
    </button>
  );
}

/**
 * Primera pantalla del modulo: las listas de mercado y como va cada una.
 *
 * Arriba van las listas, que entran directo a la compra, y el boton para
 * crear una. Abajo el resto de gastos abiertos: elegir uno lo convierte en
 * lista y entra a la misma pantalla, para no obligar a registrarlo otra vez
 * solo por la categoria.
 */
export function MarketBudgetPicker() {
  const {
    budgets,
    otherExpenses,
    loading,
    error,
    actionError,
    choosingId,
    reload,
    chooseExpense,
    creating,
    createList,
  } = useMarketBudgets();

  // El gasto elegido espera aqui hasta que el usuario confirme: la categoria
  // "mercado" no se puede deshacer, asi que no se escribe con un solo clic.
  const [expenseToChoose, setExpenseToChoose] = useState<PendingPayment | null>(null);
  const [creatingOpen, setCreatingOpen] = useState(false);

  async function confirmChoice() {
    if (!expenseToChoose) return;

    if (await chooseExpense(expenseToChoose.id)) {
      openBudget(expenseToChoose.id);
      return;
    }
    // Fallo la peticion: se cierra el dialogo para que se vea el actionError
    // que ya quedo pintado sobre la lista.
    setExpenseToChoose(null);
  }

  async function submitNewList(input: MarketListInput) {
    const id = await createList(input);
    if (id) openBudget(id);
  }

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Cargando tus listas">
        <Skeleton className="h-12 rounded-xl" />
        {[0, 1].map((item) => (
          <Skeleton key={item} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="No pudimos cargar tus listas" message={error} onRetry={reload} />;
  }

  const marketBudgets = budgets ?? [];
  const expenses = otherExpenses ?? [];

  return (
    <>
      {actionError && !creatingOpen && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <Button type="button" size="lg" className="h-12 w-full gap-2 sm:w-auto" onClick={() => setCreatingOpen(true)}>
        <Plus aria-hidden="true" className="size-5" />
        Nueva lista de mercado
      </Button>

      {marketBudgets.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Aún no tienes listas de mercado</CardTitle>
            <CardDescription>
              Crea una con tu presupuesto, agrega lo que necesitas y márcalo mientras compras. Verás
              cuánto te queda en todo momento.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <section aria-labelledby="market-budgets-title" className="mt-6">
          <h2
            id="market-budgets-title"
            className="mb-3 text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase"
          >
            Tus listas
          </h2>
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {marketBudgets.map((budget) => (
              <li key={budget.id}>
                <MarketBudgetCard budget={budget} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {expenses.length > 0 && (
        <section aria-labelledby="other-expenses-title" className="mt-8">
          <h2
            id="other-expenses-title"
            className="mb-1 text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase"
          >
            Tus otros gastos
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            ¿Ya registraste el mercado como gasto? Úsalo como presupuesto de una lista.
          </p>
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-foreground">
                    {expense.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatPesos(expense.amount)} · hasta el {formatDate(expense.dueDate)}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0"
                  disabled={choosingId !== null}
                  onClick={() => setExpenseToChoose(expense)}
                >
                  {choosingId === expense.id ? 'Preparando...' : 'Usar'}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <MarketListDialog
        open={creatingOpen}
        saving={creating}
        error={creatingOpen ? actionError : null}
        onCancel={() => setCreatingOpen(false)}
        onSubmit={submitNewList}
      />

      <ConfirmMarketBudgetDialog
        open={expenseToChoose !== null}
        itemName={expenseToChoose?.name ?? 'este gasto'}
        isChoosing={choosingId !== null}
        onCancel={() => setExpenseToChoose(null)}
        onConfirm={confirmChoice}
      />
    </>
  );
}
