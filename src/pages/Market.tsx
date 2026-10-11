import { MarketBudgetPicker } from '../components/MarketBudgetPicker';
import { MarketCart } from '../components/MarketCart';
import { PageHeader } from '../components/PageHeader';

/**
 * Modulo de lista de mercado. Una sola ruta con dos pantallas:
 * `/mercado` elige o crea la lista y `/mercado?id=<id>` es la lista, que se
 * arma antes de salir y se marca mientras se compra.
 *
 * El id va en query y no en un segmento (`/mercado/<id>`) porque App.tsx
 * enruta comparando `pathname` exacto: asi el modulo entra sin meter un router
 * en el proyecto.
 */
export function Market() {
  const budgetId = new URLSearchParams(window.location.search).get('id');

  return (
    <section className="mx-auto max-w-3xl" aria-labelledby="market-title">
      {budgetId ? (
        // La lista trae su propio encabezado, corto: en el celular el espacio
        // es para el presupuesto y los productos.
        <MarketCart budgetId={budgetId} />
      ) : (
        <>
          <PageHeader
            id="market-title"
            eyebrow="Compra con el presupuesto a la vista"
            title="Lista de mercado"
            description="Arma tu lista, ponle presupuesto y márcala mientras compras."
          />
          <MarketBudgetPicker />
        </>
      )}
    </section>
  );
}
