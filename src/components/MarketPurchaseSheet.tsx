import { useEffect, useState, type FormEvent } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { MarketSheet } from './MarketSheet';
import { MoneyInput, parseMoney } from './MoneyInput';
import { QuantityStepper } from './QuantityStepper';
import { formatPesos, unitPriceError } from '../lib/marketList';
import type { MarketItem, MarketPurchaseInput } from '../types/market';

interface MarketPurchaseSheetProps {
  /** El producto que se va a echar al carro; null cierra la hoja. */
  item: MarketItem | null;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (input: MarketPurchaseInput) => void | Promise<void>;
}

/** El precio que se propone: el ultimo real si lo hubo, si no el estimado. */
function suggestedPrice(item: MarketItem): string {
  const price = item.price > 0 ? item.price : item.estimatedUnitPrice;
  return price > 0 ? price.toLocaleString('es-CO') : '';
}

/**
 * Echar al carro: confirmar cuanto costo de verdad. El precio llega propuesto,
 * asi que si coincide con el estimado son dos toques; si no, se corrige ahi
 * mismo, con la diferencia contra el estimado a la vista.
 */
export function MarketPurchaseSheet({ item, saving, error, onCancel, onConfirm }: MarketPurchaseSheetProps) {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!item) return;
    setPrice(suggestedPrice(item));
    setQuantity(item.quantity);
    setFormError('');
  }, [item]);

  if (!item) return null;

  const unitPrice = parseMoney(price);
  const lineTotal = Number.isFinite(unitPrice) ? unitPrice * quantity : 0;
  const estimatedLine = item.estimatedUnitPrice * quantity;
  const difference = item.estimatedUnitPrice > 0 && lineTotal > 0 ? lineTotal - estimatedLine : 0;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = unitPriceError(unitPrice, true);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError('');
    void onConfirm({ price: unitPrice, quantity });
  }

  return (
    <MarketSheet open title="¿Cuánto costó?" description={item.name} busy={saving} onClose={onCancel}>
      <form className="grid gap-4" onSubmit={submit} noValidate>
        <div className="grid gap-2">
          <Label htmlFor="market-purchase-price">Precio real por unidad</Label>
          <MoneyInput
            id="market-purchase-price"
            size="lg"
            value={price}
            onChange={setPrice}
            placeholder="0"
            autoFocus={price === ''}
            aria-describedby="market-purchase-estimate"
            required
          />
          <p id="market-purchase-estimate" className="text-xs text-muted-foreground">
            {item.estimatedUnitPrice > 0
              ? `Estimaste ${formatPesos(item.estimatedUnitPrice)} por unidad.`
              : 'No tenía precio estimado.'}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="market-purchase-quantity">Cantidad que llevas</Label>
          <QuantityStepper id="market-purchase-quantity" value={quantity} onChange={setQuantity} disabled={saving} />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/70 px-4 py-3" aria-live="polite">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-right">
            <span className="block text-xl font-bold tracking-tight text-foreground tabular-nums">
              {formatPesos(lineTotal)}
            </span>
            {difference !== 0 && (
              <span className={`block text-xs font-medium ${difference > 0 ? 'text-warning' : 'text-success'}`}>
                {difference > 0 ? '+' : '−'}
                {formatPesos(Math.abs(difference))} vs. lo estimado
              </span>
            )}
          </span>
        </div>

        {(formError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{formError || error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="h-12 w-full" disabled={saving}>
          <ShoppingCart aria-hidden="true" />
          {saving ? 'Guardando...' : 'Al carro'}
        </Button>
      </form>
    </MarketSheet>
  );
}
