import { PowerOff } from 'lucide-react';
import { Snowfall } from './Snowfall';
import { cn } from '../lib/utils';

/**
 * El manifiesto del Winter Arc: durante 90 días se desactiva el cuerpo como
 * máquina de placer y se activa como samurái, enfocado en cumplir los hábitos.
 *
 * Los interruptores se accionan solos al aparecer (ver .winter-switch-* en
 * index.css): primero se apaga el placer y después se enciende el samurái.
 * Sin movimiento se ven ya en su estado final.
 */
export function WinterArcManifesto() {
  return (
    <section
      aria-labelledby="winter-arc-manifesto-title"
      className="relative isolate overflow-hidden rounded-2xl bg-[#0b1624] bg-[radial-gradient(110%_130%_at_90%_-30%,rgba(124,196,232,0.3)_0%,rgba(124,196,232,0)_60%)] text-[#eef7fc] shadow-soft"
    >
      <Snowfall count={12} />

      {/* El sello del samurái, como un kakemono al fondo. */}
      <span
        lang="ja"
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -bottom-12 -z-10 text-[10rem] leading-none font-bold text-[#eef7fc]/5 select-none sm:text-[13rem]"
      >
        侍
      </span>

      <div className="grid gap-6 p-6 sm:p-8">
        <div className="grid gap-2">
          <p className="text-[0.62rem] font-semibold tracking-[0.26em] text-[#7cc4e8] uppercase">
            <span lang="ja">冬の侍</span> · El samurái del invierno
          </p>
          <h2 id="winter-arc-manifesto-title" className="text-3xl font-bold tracking-[-0.04em] text-balance sm:text-4xl">
            Se apaga el placer. Se enciende el samurái.
          </h2>
          <p className="max-w-prose text-sm text-pretty text-[#eef7fc]/70">
            Durante 90 días tu cuerpo deja de ser una máquina de placer y se convierte en un samurái, enfocado en una
            sola cosa: cumplir tus hábitos. Cada repetición es un golpe sobre el acero. Ninguna sola forja la espada;
            todas juntas, sí.
          </p>
        </div>

        <dl className="grid gap-2.5">
          <BodyMode on={false} title="Cuerpo · máquina de placer" detail="Scroll infinito, antojos, la cama, la excusa." />
          <BodyMode on title="Cuerpo · samurái" detail="Un solo código: tus hábitos, cumplidos cada día." />
        </dl>
      </div>

      {/* Línea de escarcha, la misma que cierra el header. */}
      <div aria-hidden="true" className="h-0.5 w-full bg-linear-to-r from-transparent via-[#7cc4e8]/80 to-transparent" />
    </section>
  );
}

function BodyMode({ on, title, detail }: { on: boolean; title: string; detail: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border px-4 py-3',
        on ? 'border-[#7cc4e8]/45 bg-[#7cc4e8]/10' : 'border-[#eef7fc]/10 bg-[#eef7fc]/3',
      )}
    >
      <div className="grid min-w-0 gap-0.5">
        <dt
          className={cn(
            'text-sm font-semibold',
            !on && 'winter-mode-off line-through decoration-[#c8362d] decoration-2 opacity-50',
          )}
        >
          {title}
        </dt>
        <dd className="text-xs text-[#eef7fc]/55">{detail}</dd>
      </div>
      <dd className="flex shrink-0 items-center gap-2.5">
        <span
          className={cn(
            'hidden text-[0.62rem] font-semibold tracking-[0.18em] uppercase sm:inline',
            on ? 'winter-mode-status-on text-[#7cc4e8]' : 'winter-mode-status-off text-[#eef7fc]/45',
          )}
        >
          {on ? 'Activado' : 'Desactivado'}
        </span>
        <span className="sr-only sm:hidden">{on ? 'Activado' : 'Desactivado'}</span>
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex h-6 w-11 shrink-0 items-center rounded-full p-1',
            on ? 'winter-switch-on bg-[#7cc4e8]' : 'winter-switch-off bg-[#eef7fc]/10',
          )}
        >
          <span
            className={cn(
              'winter-switch-knob size-4 rounded-full',
              on ? 'translate-x-5 bg-[#0b1624]' : 'translate-x-0 bg-[#eef7fc]/40',
            )}
          />
        </span>
      </dd>
    </div>
  );
}

/**
 * El manifiesto en una línea, para tenerlo presente mientras el reto está en
 * curso.
 */
export function WinterArcBodyStatus() {
  return (
    <ul aria-label="Estado del cuerpo durante el reto" className="flex flex-wrap gap-2 text-xs">
      <li className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-muted-foreground">
        <PowerOff aria-hidden="true" className="size-3.5" />
        <span className="line-through decoration-[#c8362d] decoration-2">Máquina de placer</span>
        <span className="text-[0.6rem] font-semibold tracking-[0.14em] uppercase">desactivada</span>
      </li>
      <li className="inline-flex items-center gap-1.5 rounded-full bg-[#0b1624] px-3 py-1.5 text-[#eef7fc]">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-[#7cc4e8] shadow-[0_0_8px_#7cc4e8]" />
        <span className="font-semibold">Modo samurái</span>
        <span className="text-[0.6rem] font-semibold tracking-[0.14em] text-[#7cc4e8] uppercase">activado</span>
      </li>
    </ul>
  );
}
