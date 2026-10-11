import { useRef, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MoneyInput, parseMoney } from './MoneyInput';
import { QuantityStepper } from './QuantityStepper';
import { formatPesos, itemNameError, unitPriceError } from '../lib/marketList';
import type { MarketItemInput } from '../types/market';

interface MarketQuickAddProps {
  adding: boolean;
  /** `true` si el producto quedo guardado: entonces el formulario se limpia. */
  onAdd: (input: MarketItemInput) => Promise<boolean>;
}

/**
 * Agregar en el menor numero de pasos: escribir el nombre y Enter ya lo deja
 * en la lista. Cantidad, precio y "ya esta en el carro" aparecen solo cuando
 * hay un nombre, para que el formulario ocupe una linea mientras se compra.
 *
 * "Ya esta en el carro" es para lo que se lleva sin estar en la lista: entra
 * comprado con su precio real, sin pasar por la lista.
 */
export function MarketQuickAdd({ adding, onAdd }: MarketQuickAddProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [inCart, setInCart] = useState(false);
  const [formError, setFormError] = useState('');

  const expanded = name.trim() !== '';
  const unitPrice = parseMoney(price);
  const lineTotal = Number.isFinite(unitPrice) ? unitPrice * quantity : 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const problem = itemNameError(name) ?? unitPriceError(unitPrice, inCart);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError('');

    const known = Number.isNaN(unitPrice) ? 0 : unitPrice;
    const added = await onAdd(
      inCart
        ? { name: name.trim(), quantity, estimatedUnitPrice: 0, price: known }
        : { name: name.trim(), quantity, estimatedUnitPrice: known },
    );
    if (added) {
      // "Ya esta en el carro" se conserva: quien agrega lo que no estaba en
      // la lista suele agregar varios seguidos.
      setName('');
      setQuantity(1);
      setPrice('');
      nameRef.current?.focus();
    }
  }

  return (
    <form className="rounded-2xl border border-border bg-card p-3 shadow-xs" onSubmit={submit} noValidate>
      <div className="flex gap-2">
        <Label htmlFor="market-quick-name" className="sr-only">
          Producto
        </Label>
        <Input
          ref={nameRef}
          id="market-quick-name"
          className="h-11 flex-1 text-base md:text-base"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setFormError('');
          }}
          placeholder="Agregar producto, ej. arroz"
          autoComplete="off"
          autoCapitalize="sentences"
          enterKeyHint="done"
        />
        <Button
          type="submit"
          size="icon-lg"
          className="size-11"
          aria-label={inCart ? 'Agregar al carro' : 'Agregar a la lista'}
          disabled={adding || !expanded}
        >
          <Plus aria-hidden="true" className="size-5" />
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 grid animate-in gap-3 fade-in duration-150">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="market-quick-quantity" className="text-xs text-muted-foreground">
                Cantidad
              </Label>
              <QuantityStepper id="market-quick-quantity" value={quantity} onChange={setQuantity} disabled={adding} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="market-quick-price" className="text-xs text-muted-foreground">
                {inCart ? 'Precio real c/u' : 'Precio estimado c/u'}
              </Label>
              <MoneyInput
                id="market-quick-price"
                className="h-11"
                value={price}
                onChange={setPrice}
                placeholder={inCart ? '0' : 'Opcional'}
              />
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={inCart}
            onClick={() => setInCart((value) => !value)}
            className="flex h-11 w-full items-center justify-between gap-3 rounded-lg px-1 text-left text-sm font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Ya lo tengo en el carro
            <span
              aria-hidden="true"
              className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${inCart ? 'bg-primary' : 'bg-input'}`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-[left] ${inCart ? 'left-[1.125rem]' : 'left-0.5'}`}
              />
            </span>
          </button>

          {lineTotal > 0 && quantity > 1 && (
            <p className="-mt-1 text-xs text-muted-foreground tabular-nums">
              {quantity} × {formatPesos(unitPrice)} = <span className="font-semibold text-foreground">{formatPesos(lineTotal)}</span>
            </p>
          )}
        </div>
      )}

      {formError && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
