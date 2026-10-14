import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { SleepDialog } from './SleepDialog';

/**
 * El sello 💤 en los headers de Habitos y Winter Arc. El sueno no es un camino:
 * es un registro rapido del dia, asi que abre el modal en el sitio en vez de
 * llevar a otra pagina. Solo pide datos al abrirse: GET /sleep/today crea el
 * habito "Habito 01: Despertar 5AM" y eso no debe pasar por solo entrar al camino.
 *
 * El modal va en un portal a <body>: los headers son `isolate` y dentro de
 * ellos su z-50 no le gana a lo que viene despues, como el manifiesto.
 */
export function SleepButton() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        aria-label="Registrar mi sueño de hoy"
        aria-haspopup="dialog"
        title="Registrar mi sueño"
        onClick={() => setOpen(true)}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e0e7ff] text-lg shadow-md shadow-[#6366f1]/25 ring-1 ring-[#a5b4fc]/60 transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-[#a5b4fc] active:scale-95"
      >
        <span aria-hidden="true">💤</span>
      </button>

      {open && createPortal(<SleepDialog onClose={close} />, document.body)}
    </>
  );
}
