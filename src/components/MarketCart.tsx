import { Fragment, useState, type FormEvent } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { ConfirmPaymentDialog } from './ConfirmPaymentDialog';
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
const STATUS_STYLES: Record<MarketStatus, { amount: string; bar: string }> = {
  ok: { amount: 'text-primary', bar: 'bg-primary' },
  warning: { amount: 'text-amber-600', bar: 'bg-amber-500' },
  exceeded: { amount: 'text-destructive', bar: 'bg-destructive' },
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

    const numericPrice = Number(price.replace(/\./g, ''));
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

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>{summary.name}</CardTitle>
          <CardDescription>
            {summary.itemsCount === 1
              ? '1 producto en el carro'
              : `${summary.itemsCount} productos en el carro`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">Te queda</p>
            <p className={`text-4xl font-bold tracking-tight ${styles.amount}`}>
              {formatMoney(summary.remaining, MARKET_CURRENCY)}
            </p>
          </div>

          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={spentPercent}
            aria-label="Presupuesto consumido"
          >
            <div className={`h-full ${styles.bar}`} style={{ width: `${spentPercent}%` }} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Presupuesto</p>
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {formatMoney(summary.budget, MARKET_CURRENCY)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Llevas gastado</p>
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {formatMoney(summary.spent, MARKET_CURRENCY)}
              </p>
            </div>
          </div>

          <Alert variant={summary.status === 'exceeded' ? 'destructive' : 'default'}>
            <AlertDescription>{summary.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

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
              <Input
                id="market-item-price"
                type="text"
                value={price}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '');
                  setPrice(digits ? Number(digits).toLocaleString('es-CO') : '');
                }}
                inputMode="numeric"
                placeholder="Ej. 4.500"
                required
              />
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
            <p className="text-sm text-muted-foreground">Todavía no has agregado productos.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {summary.items.map((item, index) => (
                <Fragment key={item.id}>
                  <li className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-foreground">{item.name}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="whitespace-nowrap text-muted-foreground">
                        {formatMoney(item.price, MARKET_CURRENCY)}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
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
        <Button type="button" disabled={closing} onClick={() => setConfirmingClose(true)}>
          TERMINAR COMPRA
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
