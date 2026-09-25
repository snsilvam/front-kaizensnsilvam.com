import { Fragment, useState, type FormEvent } from 'react';
import { ArrowLeft, Check, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { ConfirmPaymentDialog } from './ConfirmPaymentDialog';
import { MoneyInput, parseMoney } from './MoneyInput';
import { ErrorMessage } from './ErrorMessage';
import { formatMoney } from '../services/format';
import { MARKET_CURRENCY } from '../services/market';
import { markPendingPaymentAsPaid } from '../services/pendingPayments';
import { useMarket } from '../hooks/useMarket';
import type { MarketStatus } from '../types/market';

/**
 * Colores del semaforo. El estado lo decide el backend; aqui solo se traduce
 * a clases para que la cifra grande y la barra digan lo mismo.
 */
const STATUS_STYLES: Record<MarketStatus, { amount: string; bar: string; note: string }> = {
  ok: { amount: 'text-hero-foreground', bar: 'bg-hero-accent', note: 'bg-white/[0.07] ring-white/10' },
  warning: { amount: 'text-amber-200', bar: 'bg-amber-300', note: 'bg-amber-300/15 ring-amber-300/30' },
  exceeded: { amount: 'text-red-200', bar: 'bg-red-300', note: 'bg-red-300/15 ring-red-300/30' },
};

interface MarketCartProps {
  budgetId: string;
}

/** Pantalla de compra: el presupuesto a la vista y el carro que lo consume. */
export function MarketCart({ budgetId }: MarketCartProps) {
  const { summary, loading, error, actionError, adding, removingId, reload, addItem, removeItem } =
    useMarket(budgetId);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const numericPrice = parseMoney(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setFormError('Ingresa un precio mayor que cero.');
      return;
    }

    if (await addItem(name.trim(), numericPrice)) {
      setName('');
      setPrice('');
    }
  }

  /**
   * Cerrar la compra es marcar el gasto pendiente como pagado: el modulo no
   * inventa un estado propio y el dashboard no cuenta la plata dos veces.
   */
  async function close() {
    setClosing(true);
    setCloseError(null);

    try {
      await markPendingPaymentAsPaid(budgetId);
      window.location.href = '/';
    } catch (requestError) {
      setCloseError(
        requestError instanceof Error ? requestError.message : 'No fue posible cerrar la compra.',
      );
      setClosing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Cargando tu mercado">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="No pudimos cargar tu mercado" message={error} onRetry={reload} />;
  }

  if (!summary) return null;

  const styles = STATUS_STYLES[summary.status] ?? STATUS_STYLES.ok;
  // La barra se satura en 100%: pasado el tope el dato que importa es la cifra
  // negativa de "Te queda", no cuanto sobresale la barra.
  const spentPercent =
    summary.budget > 0 ? Math.min(100, Math.round((summary.spent * 100) / summary.budget)) : 100;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 gap-1.5 text-muted-foreground"
        onClick={() => {
          window.location.href = '/mercado';
        }}
      >
        <ArrowLeft aria-hidden="true" />
        Cambiar presupuesto
      </Button>

      <div className="hero-surface overflow-hidden rounded-2xl p-6 shadow-lg shadow-hero/20 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{summary.name}</p>
            <p className="mt-0.5 text-sm text-hero-foreground/70">
              {summary.itemsCount === 1
                ? '1 producto en el carro'
                : `${summary.itemsCount} productos en el carro`}
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10" aria-hidden="true">
            <ShoppingCart className="size-5" />
          </span>
        </div>

        <p className="mt-6 text-sm text-hero-foreground/75">Te queda</p>
        <p className={`mt-1 text-5xl font-bold tracking-[-0.045em] tabular-nums ${styles.amount}`}>
          {formatMoney(summary.remaining, MARKET_CURRENCY)}
        </p>

        <div
          className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/15"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={spentPercent}
          aria-label="Presupuesto consumido"
        >
          <div className={`h-full rounded-full transition-[width] ${styles.bar}`} style={{ width: `${spentPercent}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-hero-foreground/70 tabular-nums">
          <span>Gastado {formatMoney(summary.spent, MARKET_CURRENCY)}</span>
          <span>de {formatMoney(summary.budget, MARKET_CURRENCY)}</span>
        </div>

        <p className={`mt-5 rounded-xl px-4 py-3 text-sm ring-1 ${styles.note}`} role="status">
          {summary.message}
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Agregar producto</CardTitle>
          <CardDescription>El nombre y el precio que ves en el estante.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={submit}>
            <div className="grid flex-1 gap-2">
              <Label htmlFor="market-item-name">Producto</Label>
              <Input
                id="market-item-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Arroz"
                required
              />
            </div>

            <div className="grid gap-2 sm:w-44">
              <Label htmlFor="market-item-price">Precio</Label>
              <MoneyInput id="market-item-price" value={price} onChange={setPrice} placeholder="4.500" required />
            </div>

            <Button type="submit" className="gap-1.5" disabled={adding}>
              <Plus aria-hidden="true" />
              {adding ? 'Agregando...' : 'Agregar'}
            </Button>
          </form>

          {formError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {actionError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">En el carro</CardTitle>
          <CardDescription>Quita lo que devuelvas al estante.</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.items.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">Todavía no has agregado productos. Empieza por lo que ya tienes en la mano.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {summary.items.map((item, index) => (
                <Fragment key={item.id}>
                  <li className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-foreground">{item.name}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold whitespace-nowrap text-foreground tabular-nums">
                        {formatMoney(item.price, MARKET_CURRENCY)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        size="icon-sm"
                        aria-label={`Quitar ${item.name}`}
                        title="Quitar del carro"
                        disabled={removingId === item.id}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </span>
                  </li>
                  {index < summary.items.length - 1 && <Separator />}
                </Fragment>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {closeError && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{closeError}</AlertDescription>
        </Alert>
      )}

      <div className="mt-10 flex justify-center">
        <Button type="button" size="lg" className="w-full sm:w-auto" disabled={closing} onClick={() => setConfirmingClose(true)}>
          <Check aria-hidden="true" />
          Terminar compra
        </Button>
      </div>

      <ConfirmPaymentDialog
        open={confirmingClose}
        itemName={summary.name}
        isPaying={closing}
        onCancel={() => setConfirmingClose(false)}
        onConfirm={close}
      />
    </>
  );
}
