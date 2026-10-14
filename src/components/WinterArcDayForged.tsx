import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Button } from './ui/button';
import { burst, cannons } from '../lib/confetti';
import { vibrate } from '../lib/winterArcCelebration';
import { syncWinterArcToday } from '../services/winterArc';

interface WinterArcDayForgedProps {
  winterArcId: string;
  /** Número del día de hoy en el reto, si se conoce. */
  dayNumber?: number;
  /** Se llama tras sellar el día en el backend, para recargar el grid. */
  onSealed: () => void;
  onClose: () => void;
}

/**
 * La celebración de un día completo: todas las reglas de hoy cumplidas.
 *
 * El sello 侍 cae estampado con dos cañones de confeti y cada toque en la
 * pantalla lanza más escarcha desde donde se tocó. "Sellar en el grid" hace
 * el mismo sync que el botón del grid, para no tener que bajar a buscarlo.
 */
export function WinterArcDayForged({ winterArcId, dayNumber, onSealed, onClose }: WinterArcDayForgedProps) {
  const sealButton = useRef<HTMLButtonElement>(null);
  const [strikes, setStrikes] = useState(0);
  const [sealing, setSealing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    sealButton.current?.focus();
    cannons();
    // El golpe del sello: vibra cuando toca el papel, no al aparecer.
    const stamp = window.setTimeout(() => vibrate([45, 60, 110]), 380);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(stamp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  function strikeAt(event: PointerEvent<HTMLDivElement>) {
    // Los botones hacen lo suyo; el resto de la pantalla es el yunque.
    if ((event.target as HTMLElement).closest('button')) return;
    burst({ x: event.clientX, y: event.clientY, count: 28, spread: Math.PI * 2, speed: 9, embers: 0.35 });
    vibrate(12);
    setStrikes((n) => n + 1);
  }

  async function seal() {
    setSealing(true);
    setError('');
    try {
      await syncWinterArcToday(winterArcId);
      onSealed();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No pudimos sellar el día.');
    } finally {
      setSealing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex cursor-pointer touch-manipulation items-center justify-center bg-[#0b1624]/85 p-4 backdrop-blur-sm select-none"
      onPointerDown={strikeAt}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="winter-day-forged-title"
        aria-describedby="winter-day-forged-description"
        className="grid w-full max-w-sm justify-items-center gap-6 text-center"
      >
        <div className="relative grid size-36 place-items-center">
          <span aria-hidden="true" className="winter-seal-ink absolute inset-0 rounded-3xl border-4 border-[#c8302c]" />
          <span
            aria-hidden="true"
            className="winter-seal-stamp grid size-36 place-items-center rounded-3xl border-4 border-[#c8302c] bg-[#fbf3e6] text-7xl font-bold text-[#c8302c] shadow-2xl shadow-black/40"
          >
            侍
          </span>
        </div>

        <div className="winter-forged-in grid gap-2">
          <p className="text-[0.62rem] font-semibold tracking-[0.28em] text-[#7cc4e8] uppercase">
            {dayNumber ? `Día ${dayNumber} del Winter Arc` : 'Winter Arc'}
          </p>
          <h2 id="winter-day-forged-title" className="text-3xl font-bold tracking-[-0.04em] text-[#eef7fc]">
            Día forjado
          </h2>
          <p id="winter-day-forged-description" className="text-sm leading-relaxed text-[#cfe8f5]">
            Cumpliste todas tus Reglas Inquebrantables de hoy. El placer no mandó.
          </p>
          <p aria-live="polite" className="font-mono text-xs text-[#7cc4e8]">
            {strikes === 0
              ? 'Toca la pantalla para golpear el acero.'
              : strikes === 1
                ? '1 golpe extra al acero'
                : `${strikes} golpes extra al acero`}
          </p>
        </div>

        {error && <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-[#fecaca]">{error}</p>}

        <div className="winter-forged-in flex flex-wrap justify-center gap-3">
          <Button
            ref={sealButton}
            type="button"
            size="lg"
            className="bg-[#eef7fc] text-[#0b1624] hover:bg-[#cfe8f5]"
            onClick={seal}
            disabled={sealing}
          >
            {sealing ? 'Sellando...' : 'Sellar en el grid'}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            className="text-[#cfe8f5] hover:bg-white/10 hover:text-[#eef7fc]"
            onClick={onClose}
            disabled={sealing}
          >
            Seguir
          </Button>
        </div>
      </div>
    </div>
  );
}
