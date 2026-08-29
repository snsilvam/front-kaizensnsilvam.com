import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ErrorMessage } from './ErrorMessage';
import { Skeleton } from './ui/skeleton';
import { formatDate, formatMoney } from '../services/format';
import { useMarketBudgets } from '../hooks/useMarketBudgets';
import { MARKET_CURRENCY } from '../services/market';

/**
 * Primera pantalla del modulo: contra cual presupuesto voy a comprar.
 * Solo aparecen los gastos pendientes registrados con categoria "mercado" y
 * todavia sin pagar.
 */
export function MarketBudgetPicker() {
  const { budgets, loading, error, reload } = useMarketBudgets();

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Cargando presupuestos de mercado">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="No pudimos cargar tus presupuestos" message={error} onRetry={reload} />;
  }

  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aún no tienes presupuestos de mercado</CardTitle>
          <CardDescription>
            Registra un gasto pendiente con la categoría <strong>Mercado</strong> y aparecerá aquí
            para que compres contra él.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => { window.location.href = '/gastos'; }}>
            Crear un presupuesto
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
      {budgets.map((budget) => (
        <li key={budget.id}>
          <button
            type="button"
            className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            onClick={() => { window.location.href = `/mercado?id=${encodeURIComponent(budget.id)}`; }}
          >
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
            >
              <ShoppingCart className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-foreground">{budget.name}</span>
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
  );
}
