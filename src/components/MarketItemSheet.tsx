import { useEffect, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MarketSheet } from './MarketSheet';
import { MoneyInput, parseMoney } from './MoneyInput';
import { QuantityStepper } from './QuantityStepper';
import { itemNameError, unitPriceError } from '../lib/marketList';
import type { MarketItem, MarketItemInput } from '../types/market';

interface MarketItemSheetProps {
  /** El producto a editar; null cierra la hoja. */
  item: MarketItem | null;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (input: MarketItemInput) => void | Promise<void>;
  /** Abre la confirmacion de quitar el producto de la lista. */
  onDelete: () => void;
}

function moneyText(amount: number): string {
  return amount > 0 ? amount.toLocaleString('es-CO') : '';
}

/**
 * Corregir un producto: nombre, cantidad y precio estimado. Si ya esta en el
 * carro tambien su precio real, que es el que cuenta en lo gastado.
 */
export function MarketItemSheet({ item, saving, error, onCancel, onSave, onDelete }: MarketItemSheetProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [estimated, setEstimated] = useState('');
  const [price, setPrice] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!item) return;
    setName(item.name);
    setQuantity(item.quantity);
    setEstimated(moneyText(item.estimatedUnitPrice));
    setPrice(moneyText(item.price));
    setFormError('');
  }, [item]);

  if (!item) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;

    const estimatedValue = parseMoney(estimated);
    const priceValue = parseMoney(price);
    const problem =
      itemNameError(name) ??
      unitPriceError(estimatedValue, false) ??
      (item.purchased ? unitPriceError(priceValue, true) : null);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError('');

    void onSave({
      name: name.trim(),
      quantity,
      estimatedUnitPrice: Number.isNaN(estimatedValue) ? 0 : estimatedValue,
      // En uno pendiente el backend ignora el precio real; se manda el que
      // tenia para no inventar nada.
      price: item.purchased ? priceValue : item.price,
    });
  }

  return (
    <MarketSheet
      open
      title="Editar producto"
      description={item.purchased ? 'Está en el carro.' : 'Está por comprar.'}
      busy={saving}
      onClose={onCancel}
    >
      <form className="grid gap-4" onSubmit={submit} noValidate>
        <div className="grid gap-2">
          <Label htmlFor="market-item-name">Producto</Label>
          <Input
            id="market-item-name"
            className="h-11"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="market-item-quantity">Cantidad</Label>
            <QuantityStepper id="market-item-quantity" value={quantity} onChange={setQuantity} disabled={saving} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="market-item-estimated">Estimado c/u</Label>
            <MoneyInput id="market-item-estimated" className="h-11" value={estimated} onChange={setEstimated} placeholder="Opcional" />
          </div>
        </div>

        {item.purchased && (
          <div className="grid gap-2">
            <Label htmlFor="market-item-price">Precio real por unidad</Label>
            <MoneyInput id="market-item-price" className="h-11" value={price} onChange={setPrice} required />
          </div>
        )}

        {(formError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{formError || error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="h-12 w-full" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={saving}
          onClick={onDelete}
        >
          <Trash2 aria-hidden="true" />
          Quitar de la lista
        </Button>
      </form>
    </MarketSheet>
  );
}
