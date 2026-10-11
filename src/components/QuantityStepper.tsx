import { Minus, Plus } from 'lucide-react';
import { MAX_QUANTITY } from '../lib/marketList';

interface QuantityStepperProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function clamp(value: number): number {
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(value)));
}

/**
 * Cantidad con botones de - y + del tamano de un dedo, y el numero editable en
 * medio para cuando son muchas unidades. Siempre es un entero entre 1 y el
 * tope: vaciar el campo vuelve a 1.
 */
export function QuantityStepper({ id, value, onChange, disabled = false }: QuantityStepperProps) {
  const buttonClass =
    'grid w-11 shrink-0 place-items-center text-foreground transition-colors outline-none hover:bg-muted focus-visible:bg-muted active:bg-muted disabled:opacity-35';

  return (
    <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-input bg-card shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <button
        type="button"
        className={buttonClass}
        aria-label="Una unidad menos"
        disabled={disabled || value <= 1}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={String(value)}
        disabled={disabled}
        onFocus={(event) => event.target.select()}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '');
          onChange(digits ? clamp(Number(digits)) : 1);
        }}
        className="w-12 min-w-0 flex-1 border-x border-input bg-transparent text-center text-base font-semibold text-foreground tabular-nums outline-none"
      />
      <button
        type="button"
        className={buttonClass}
        aria-label="Una unidad más"
        disabled={disabled || value >= MAX_QUANTITY}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
