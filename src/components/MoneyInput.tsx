import { cn } from '@/lib/utils';

interface MoneyInputProps {
  id: string;
  /** El monto ya formateado con puntos de miles ("2.500.000"). */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  /** "lg" es la cifra protagonista de un formulario; "default" va en linea. */
  size?: 'default' | 'lg';
}

/**
 * Campo de pesos: solo acepta digitos y los muestra con puntos de miles
 * mientras se escribe. Quien lo usa recupera el numero con
 * `parseMoney(value)`.
 */
export function MoneyInput({
  id,
  value,
  onChange,
  placeholder = '0',
  required,
  autoFocus,
  size = 'default',
}: MoneyInputProps) {
  const large = size === 'lg';

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 font-semibold text-muted-foreground',
          large ? 'left-4 text-2xl' : 'left-3 text-sm',
        )}
      >
        $
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '');
          onChange(digits ? Number(digits).toLocaleString('es-CO') : '');
        }}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className={cn(
          'w-full min-w-0 rounded-lg border border-input bg-card font-semibold tabular-nums text-foreground shadow-xs transition-colors outline-none placeholder:font-normal placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          large ? 'h-16 rounded-xl pr-16 pl-10 text-3xl tracking-[-0.03em]' : 'h-10 pr-12 pl-7 text-base md:text-sm',
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 font-medium text-muted-foreground',
          large ? 'text-sm' : 'text-xs',
        )}
      >
        COP
      </span>
    </div>
  );
}

/** "2.500.000" -> 2500000. NaN si el campo esta vacio o no es un numero. */
export function parseMoney(value: string): number {
  return value ? Number(value.replace(/\./g, '')) : Number.NaN;
}
