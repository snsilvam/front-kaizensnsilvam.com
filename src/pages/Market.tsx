import { MarketBudgetPicker } from '../components/MarketBudgetPicker';
import { MarketCart } from '../components/MarketCart';
import { PageHeader } from '../components/PageHeader';

/**
 * Modulo de mercado. Una sola ruta con dos pantallas:
 * `/mercado` elige el presupuesto y `/mercado?id=<id>` es la compra.
 *
 * El id va en query y no en un segmento (`/mercado/<id>`) porque App.tsx
 * enruta comparando `pathname` exacto: asi el modulo entra sin meter un router
 * en el proyecto.
 */
export function Market() {
  const budgetId = new URLSearchParams(window.location.search).get('id');

  return (
    <section className="mx-auto max-w-3xl" aria-labelledby="market-title">
      <PageHeader
        id="market-title"
        eyebrow="Compra con el presupuesto a la vista"
        title="Hacer mercado"
        description={
          budgetId
            ? 'Agrega lo que echas al carro y mira cuánto te queda.'
            : 'Elige contra cuál de tus gastos vas a comprar.'
        }
      />

      {budgetId ? <MarketCart budgetId={budgetId} /> : <MarketBudgetPicker />}
    </section>
  );
}
