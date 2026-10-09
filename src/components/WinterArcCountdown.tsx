import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CalendarClock, Flame, Sparkles } from 'lucide-react';
import { Snowfall } from './Snowfall';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatDayKey } from '../lib/habitDates';
import { cn } from '../lib/utils';
import { WINTER_ARC_MAX_CONSECUTIVE_FAILURES, WINTER_ARC_MIN_RULES } from '../types/winterArc';

interface WinterArcCountdownProps {
  /** Día de apertura, YYYY-MM-DD, para mostrarlo en texto. */
  opensOn: string;
  /** Instante de apertura en milisegundos desde epoch. */
  opensAt: number;
  /** Se llama una sola vez, cuando la cuenta atrás llega a cero. */
  onOpen: () => void;
}

/**
 * Lo que se ve mientras Winter Arc sigue cerrado: nieve cayendo, la cuenta
 * atrás hasta la apertura, una llama congelada que se puede golpear y los pasos
 * para llegar preparado al día 1.
 */
export function WinterArcCountdown({ opensOn, opensAt, onOpen }: WinterArcCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      const current = Date.now();
      if (current >= opensAt) {
        window.clearInterval(id);
        onOpen();
        return;
      }
      setNow(current);
    }, 1000);

    return () => window.clearInterval(id);
  }, [opensAt, onOpen]);

  const remaining = splitRemaining(opensAt - now);
  const opensOnLabel = formatDayKey(opensOn);

  return (
    <div className="grid gap-6">
      <section aria-labelledby="winter-arc-about-title" className="grid gap-2 border-l-2 border-[#7cc4e8] pl-4">
        <h1
          id="winter-arc-about-title"
          className="text-xs font-semibold tracking-[0.2em] text-[#2b7fa8] uppercase"
        >
          ¿Qué es el Winter Arc?
        </h1>
        <p className="text-base text-pretty text-foreground/80">
          Un reto de 90 días para forjar un samurái. Tu cuerpo deja de ser una máquina de placer y obedece a un solo
          código: tus hábitos, cumplidos cada día, sin excusas. Mientras el resto espera la primavera, tú te forjas en
          el invierno.
        </p>
      </section>

      <section
        aria-labelledby="winter-arc-soon-title"
        className="relative isolate overflow-hidden rounded-2xl bg-[#0b1624] bg-[radial-gradient(110%_130%_at_90%_-30%,rgba(124,196,232,0.3)_0%,rgba(124,196,232,0)_60%)] text-[#eef7fc] shadow-soft"
      >
        <Snowfall />

        <div className="grid items-center gap-8 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
          <div className="grid gap-5">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#7cc4e8]/40 bg-[#7cc4e8]/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.18em] text-[#7cc4e8] uppercase">
              <CalendarClock aria-hidden="true" className="size-3.5" />
              Disponible en octubre
            </span>

            <div className="grid gap-2">
              <h2 id="winter-arc-soon-title" className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                Se acerca el invierno
              </h2>
              <p className="text-sm text-pretty text-[#eef7fc]/70">
                El módulo Winter Arc solo estará disponible a partir del {opensOnLabel}. Hasta entonces, la
                llama se queda congelada.
              </p>
            </div>

            <div role="timer" className="grid grid-cols-4 gap-2 sm:gap-3">
              <CountdownTile value={String(remaining.days)} label={remaining.days === 1 ? 'Día' : 'Días'} />
              <CountdownTile value={pad(remaining.hours)} label="Horas" />
              <CountdownTile value={pad(remaining.minutes)} label="Min" />
              <CountdownTile value={pad(remaining.seconds)} label="Seg" />
            </div>

            <p className="text-xs text-[#eef7fc]/55">Se descongela a las 00:00, hora de Bogotá.</p>
          </div>

          <FrozenFlame />
        </div>

        {/* Linea de escarcha, la misma que cierra el header. */}
        <div
          aria-hidden="true"
          className="h-0.5 w-full bg-linear-to-r from-transparent via-[#7cc4e8]/80 to-transparent"
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-[-0.03em]">Mientras se descongela</CardTitle>
          <CardDescription>Llega al día 1 con todo listo.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <ol className="grid gap-4">
            <PrepStep number={1} title={`Crea al menos ${WINTER_ARC_MIN_RULES} hábitos en Kaizen Habits`}>
              Serán tus Reglas Inquebrantables: el reto los revisa cada noche.
            </PrepStep>
            <PrepStep number={2} title="Elige hábitos que puedas cumplir todos los días">
              {WINTER_ARC_MAX_CONSECUTIVE_FAILURES} días fallados seguidos apagan la llama. Sin excepciones.
            </PrepStep>
            <PrepStep number={3} title={`Vuelve el ${opensOnLabel} y arma tu reto`}>
              90 días. Uno a la vez.
            </PrepStep>
          </ol>

          <Button
            type="button"
            size="lg"
            className="w-full sm:w-fit"
            onClick={() => { window.location.href = '/habits'; }}
          >
            <Sparkles aria-hidden="true" />
            Preparar mis hábitos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CountdownTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="grid gap-1 rounded-xl border border-[#7cc4e8]/25 bg-[#eef7fc]/5 px-1 py-3 text-center backdrop-blur-sm">
      <span className="font-mono text-2xl font-bold text-[#eef7fc] tabular-nums sm:text-4xl">{value}</span>
      <span className="text-[0.6rem] font-semibold tracking-[0.18em] text-[#7cc4e8] uppercase">{label}</span>
    </div>
  );
}

function PrepStep({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-full bg-[#cfe8f5] font-mono text-xs font-bold text-[#0b1624]"
      >
        {number}
      </span>
      <div className="grid gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{children}</span>
      </div>
    </li>
  );
}

/**
 * La llama del reto, atrapada en un bloque de hielo. Cada golpe lo sacude, le
 * abre una grieta más (hasta tres) y suelta una frase. No se rompe: eso lo
 * hace la fecha.
 */
function FrozenFlame() {
  const [hits, setHits] = useState(0);
  const [shaking, setShaking] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function hit() {
    setHits((count) => count + 1);
    setShaking(true);

    // Un golpe sobre otro reinicia la sacudida en vez de cortarla a medias.
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShaking(false), 450);
  }

  const cracks = Math.min(hits, CRACKS.length);
  const message = hits === 0 ? 'Toca el hielo' : ICE_MESSAGES[(hits - 1) % ICE_MESSAGES.length];

  return (
    <div className="grid justify-items-center gap-3 sm:w-44">
      <button
        type="button"
        onClick={hit}
        aria-label="Llama congelada. Toca el hielo para intentar romperlo."
        className={cn(
          'relative grid size-28 place-items-center rounded-3xl border border-[#eef7fc]/60 bg-linear-to-br from-[#e6f5fc]/35 via-[#9fd3ec]/20 to-[#7cc4e8]/10 shadow-[inset_0_2px_10px_rgba(238,247,252,0.45),0_12px_40px_-12px_rgba(124,196,232,0.6)] backdrop-blur-[2px] transition-transform duration-200 outline-none hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#7cc4e8]',
          shaking && 'winter-ice-hit',
        )}
      >
        <Flame aria-hidden="true" className="winter-ember size-12 fill-orange-400 text-amber-200 drop-shadow-[0_0_14px_rgba(251,146,60,0.75)]" />

        {/* Brillo de la cara del cubo. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 left-3 h-7 w-2 -rotate-12 rounded-full bg-[#eef7fc]/60"
        />

        <svg
          aria-hidden="true"
          viewBox="0 0 112 112"
          className="pointer-events-none absolute inset-0 size-full"
          fill="none"
          stroke="#eef7fc"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {CRACKS.map((path, index) => (
            <path
              key={path}
              d={path}
              className="transition-opacity duration-300"
              opacity={index < cracks ? 0.85 : 0}
            />
          ))}
        </svg>
      </button>

      <p role="status" className="min-h-10 text-center text-xs text-balance text-[#eef7fc]/75">
        {message}
      </p>
    </div>
  );
}

function splitRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

const ICE_MESSAGES = [
  'Todavía no, guerrero. El hielo aguanta.',
  'Esto no se rompe a golpes: se rompe con días.',
  'La paciencia también cuenta como disciplina.',
  'Guarda esa energía para el día 1 de 90.',
  'El Juez Nocturno te está mirando… y se ríe.',
  'Vale, vale. Vuelve cuando el contador llegue a cero.',
];

/** Una grieta por golpe, de arriba a abajo del cubo. */
const CRACKS = [
  'M70 8 L63 28 L72 37 L60 54',
  'M8 64 L30 57 L37 68 L53 61',
  'M104 80 L82 75 L77 91 L63 84 M46 104 L50 88 L41 79',
];
