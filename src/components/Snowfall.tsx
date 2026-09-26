import type { CSSProperties } from 'react';

/**
 * Nieve cayendo detras del contenido de una tarjeta del Winter Arc. El padre
 * debe ser `relative isolate overflow-hidden` para que los copos queden dentro
 * y por debajo del texto. Sin movimiento no nieva (ver .winter-snowflake).
 */
export function Snowfall({ count = SNOWFLAKES.length }: { count?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {SNOWFLAKES.slice(0, count).map((flake, index) => (
        <span key={index} className="winter-snowflake" style={flake} />
      ))}
    </div>
  );
}

/**
 * Copos con valores fijos (no aleatorios) para que el render sea puro. El
 * retraso negativo hace que al entrar ya esté nevando, sin esperar al primero.
 */
const SNOWFLAKES: CSSProperties[] = Array.from({ length: 22 }, (_, i) => {
  const size = 2 + (i % 3);
  return {
    left: `${(i * 37 + 11) % 100}%`,
    width: size,
    height: size,
    animationDuration: `${7 + ((i * 13) % 7)}s`,
    animationDelay: `-${(i * 7) % 11}s`,
    '--snow-drift': `${(i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 6)}px`,
  } as CSSProperties;
});
