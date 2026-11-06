import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { CoachDialog } from './CoachDialog';

/**
 * El sello 侍 en los headers de Hábitos y Winter Arc: abre el coach de la
 * forja. Como SleepButton, no lleva a otra página: el coach es una consulta
 * rápida sobre lo de hoy.
 *
 * El diálogo va en un portal a <body>: los headers son `isolate` y dentro de
 * ellos su z-50 no le gana a lo que viene después.
 */
export function CoachButton() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        aria-label="Preguntarle al coach"
        aria-haspopup="dialog"
        title="Coach de la forja"
        onClick={() => setOpen(true)}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0b1624] font-serif text-base text-[#eef7fc] shadow-md shadow-[#0b1624]/25 ring-1 ring-[#2b7fa8]/50 transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-[#2b7fa8] active:scale-95"
      >
        <span aria-hidden="true">侍</span>
      </button>

      {open && createPortal(<CoachDialog onClose={close} />, document.body)}
    </>
  );
}
