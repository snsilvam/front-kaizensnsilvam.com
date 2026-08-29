import { MarketBudgetPicker } from '../components/MarketBudgetPicker';
import { MarketCart } from '../components/MarketCart';

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
    <section aria-labelledby="market-title">
      <div className="mb-8">
        <p className="mb-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase">
          Compra con el presupuesto a la vista
        </p>
        <h1
          id="market-title"
          className="font-heading text-3xl font-bold tracking-[-0.055em] text-foreground sm:text-4xl"
        >
          Hacer mercado
        </h1>
        <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
          {budgetId
            ? 'Agrega lo que echas al carro y mira cuánto te queda.'
            : 'Elige contra cuál presupuesto vas a comprar.'}
        </p>
      </div>

      {budgetId ? <MarketCart budgetId={budgetId} /> : <MarketBudgetPicker />}
    </section>
  );
}
