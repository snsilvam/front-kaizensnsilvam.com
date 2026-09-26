import { useState, type ReactNode } from 'react';
import { WinterArcCountdown } from './WinterArcCountdown';
import { WinterArcLayout } from './WinterArcLayout';
import { isWinterArcOpen, WINTER_ARC_OPENS_AT, WINTER_ARC_OPENS_ON } from '../lib/winterArcOpening';

/**
 * Cierra el modulo Winter Arc hasta que llegue su fecha de apertura.
 *
 * Envuelve las paginas en App.tsx y no dentro de ellas: si todavia no abre, las
 * paginas ni se montan y sus hooks no llegan a pedir nada al backend.
 */
export function WinterArcGate({ children }: { children: ReactNode }) {
  // Es estado y no una constante para que, si la cuenta atrás llega a cero con
  // la pagina abierta, el modulo se abra sin recargar.
  const [open, setOpen] = useState(() => isWinterArcOpen());

  if (open) return children;

  return (
    <WinterArcLayout>
      <WinterArcCountdown
        opensOn={WINTER_ARC_OPENS_ON}
        opensAt={WINTER_ARC_OPENS_AT}
        onOpen={() => setOpen(true)}
      />
    </WinterArcLayout>
  );
}
