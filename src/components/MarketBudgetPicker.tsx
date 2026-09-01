import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ConfirmMarketBudgetDialog } from './ConfirmMarketBudgetDialog';
import { ErrorMessage } from './ErrorMessage';
import { Skeleton } from './ui/skeleton';
import { formatDate, formatMoney } from '../services/format';
import { useMarketBudgets } from '../hooks/useMarketBudgets';
import { MARKET_CURRENCY } from '../services/market';
import type { PendingPayment } from '../services/pendingPayments';

/**
 * Primera pantalla del modulo: contra cual gasto voy a comprar.
 *
 * Arriba van los gastos que ya son presupuesto de mercado, que entran directo
 * a la compra. Abajo el resto de gastos abiertos: elegir uno lo convierte en
 * presupuesto y entra a la misma pantalla, para no obligar a registrarlo otra
 * vez solo por la categoria.
 */
export function MarketBudgetPicker() {
  const { budgets, otherExpenses, loading, error, actionError, choosingId, reload, chooseExpense } =
    useMarketBudgets();

  // El gasto elegido espera aqui hasta que el usuario confirme: la categoria
  // "mercado" no se puede deshacer, asi que no se escribe con un solo clic.
  const [expenseToChoose, setExpenseToChoose] = useState<PendingPayment | null>(null);

  function openBudget(budgetId: string) {
    window.location.href = `/mercado?id=${encodeURIComponent(budgetId)}`;
  }

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

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Cargando tus gastos">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="No pudimos cargar tus gastos" message={error} onRetry={reload} />;
  }

  const marketBudgets = budgets ?? [];
  const expenses = otherExpenses ?? [];

  if (marketBudgets.length === 0 && expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aún no tienes gastos pendientes</CardTitle>
          <CardDescription>
            Registra un gasto y aparecerá aquí para que compres contra él.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => { window.location.href = '/gastos'; }}>
            Registrar un gasto
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {actionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {marketBudgets.length > 0 && (
        <section aria-labelledby="market-budgets-title">
          <h2
            id="market-budgets-title"
            className="mb-3 text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase"
          >
            Presupuestos de mercado
          </h2>
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {marketBudgets.map((budget) => (
              <li key={budget.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  onClick={() => openBudget(budget.id)}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
                  >
                    <ShoppingCart className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-foreground">
                      {budget.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Hasta el {formatDate(budget.dueDate)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-base font-bold tracking-tight text-foreground">
                    {formatMoney(budget.budget, MARKET_CURRENCY)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {expenses.length > 0 && (
        <section
          aria-labelledby="other-expenses-title"
          className={marketBudgets.length > 0 ? 'mt-8' : undefined}
        >
          <h2
            id="other-expenses-title"
            className="mb-1 text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase"
          >
            Tus otros gastos
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Elige uno y lo usamos como presupuesto de esta compra.
          </p>
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-foreground">
                    {expense.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatMoney(expense.amount, MARKET_CURRENCY)} · hasta el{' '}
                    {formatDate(expense.dueDate)}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={choosingId !== null}
                  onClick={() => setExpenseToChoose(expense)}
                >
                  {choosingId === expense.id ? 'Preparando...' : 'Comprar con este'}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

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
