import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, CalendarClock, Compass, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import KaizenLogo from '../components/KaizenLogo';
import { PathSplash } from '../components/Loading';
import { PathMark } from '../components/PathSwitcher';
import { Snowfall } from '../components/Snowfall';
import { UserAvatar } from '../components/UserAvatar';
import { Button } from '../components/ui/button';
import { formatDayKey } from '../lib/habitDates';
import { PATH_HOME, type PathId } from '../lib/paths';
import { cn } from '../lib/utils';
import { isWinterArcOpen, WINTER_ARC_OPENS_ON } from '../lib/winterArcOpening';
import { firstNameOf } from '../services/format';

/** Lo que tarda en cubrir la pantalla la cortina del camino elegido. */
const CURTAIN_MS = 320;

/**
 * Selector de caminos. Aparece solo despues de cada login y vive en /caminos,
 * a donde lleva el boton "Caminos" de cualquier header.
 *
 * Cada tarjeta ya lleva la piel de su camino. Al elegir una cae una cortina
 * del mismo color que empalma con el splash de la pagina siguiente, asi el
 * usuario sabe a donde va antes de llegar.
 */
export function SelectApp() {
  const { completeAppSelection, user, signOut } = useAuth();
  const name = firstNameOf(user?.displayName, user?.email);
  const [entering, setEntering] = useState<PathId | null>(null);
  const timer = useRef<number | null>(null);
  const winterArcOpen = isWinterArcOpen();

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function enter(path: PathId) {
    if (entering) return;
    setEntering(path);

    const target = PATH_HOME[path];
    const go = () => {
      // Recien hecho el login la URL puede ser ya la del camino: basta con
      // cerrar el selector. Si no, se navega (no hay router).
      if (window.location.pathname === target) completeAppSelection();
      else window.location.href = target;
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) go();
    else timer.current = window.setTimeout(go, CURTAIN_MS);
  }

  const greeting = `${greetingFor(new Date().getHours())}${name ? `, ${name}` : ''}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <span className="inline-flex items-center gap-2.5">
          <KaizenLogo
            width={36}
            height={36}
            className="size-9 rounded-xl object-cover shadow-md shadow-primary/20"
            alt="Pastor, mascota de Kaizen"
          />
          <span className="text-base font-bold tracking-tight">Kaizen</span>
        </span>

        <div className="flex items-center gap-2">
          <UserAvatar />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={signOut}
          >
            <LogOut aria-hidden="true" />
            Salir
          </Button>
        </div>
      </header>

      <main
        aria-labelledby="select-app-title"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pt-4 pb-12 sm:px-6"
      >
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-sm font-semibold text-primary">{greeting}</p>
          <h1 id="select-app-title" className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            ¿Qué camino tomas hoy?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
            Cada camino tiene su propio espacio. Cambia cuando quieras con el botón{' '}
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Compass aria-hidden="true" className="size-4" />
              Caminos
            </span>
            , arriba a la derecha.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          <PathCard
            path="finanzas"
            eyebrow="Finanzas"
            title="Kaizen"
            tagline="¿Cuánto puedo gastar hoy?"
            features={['Tu disponible del día y si vas bien con tu plan', 'Ingresos, gastos pendientes y mercado']}
            cta="Entrar a Finanzas"
            disabled={entering !== null}
            onEnter={enter}
          />

          <PathCard
            path="habitos"
            eyebrow="Hábitos"
            title="Kaizen Habits"
            tagline="Un día más, una repetición más."
            features={['Marca las repeticiones de tus hábitos', 'Calendario, rachas y metas para no soltar']}
            cta="Entrar al dojo"
            disabled={entering !== null}
            onEnter={enter}
          />

          <PathCard
            path="winter-arc"
            eyebrow="Reto de 90 días"
            title="Winter Arc"
            tagline="Se apaga el placer. Se enciende el samurái."
            features={['Cada repetición de tus hábitos forja al samurái', 'Tres días cedidos al placer apagan la llama']}
            cta={winterArcOpen ? 'Activar modo samurái' : 'Ver la cuenta atrás'}
            badge={winterArcOpen ? undefined : `Abre el ${formatDayKey(WINTER_ARC_OPENS_ON)}`}
            disabled={entering !== null}
            onEnter={enter}
          >
            <Snowfall count={10} />
          </PathCard>
        </div>
      </main>

      {entering && (
        <PathSplash path={entering} action="Entrando a" className="path-curtain fixed inset-0 z-50 min-h-0" />
      )}
    </div>
  );
}

interface PathCardProps {
  path: PathId;
  eyebrow: string;
  title: string;
  /** La promesa del camino en una frase. */
  tagline: string;
  /** Lo que se puede hacer dentro, en dos lineas cortas. */
  features: string[];
  cta: string;
  /** Aviso en la esquina, p. ej. que todavia no abre. */
  badge?: string;
  disabled: boolean;
  onEnter: (path: PathId) => void;
  /** Decoracion de fondo, detras del contenido. */
  children?: ReactNode;
}

/**
 * Tarjeta de un camino con su piel completa. Toda la tarjeta es el boton; la
 * pastilla de abajo solo lo hace evidente.
 */
function PathCard({ path, eyebrow, title, tagline, features, cta, badge, disabled, onEnter, children }: PathCardProps) {
  const theme = CARD_THEME[path];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onEnter(path)}
      className={cn(
        'group relative isolate flex flex-col overflow-hidden rounded-3xl p-6 text-left shadow-soft ring-1 transition-[translate,box-shadow] duration-200 outline-none hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 disabled:pointer-events-none sm:p-7',
        theme.card,
      )}
    >
      {children}

      <span className="relative flex items-start justify-between gap-3">
        <PathMark path={path} size="lg" />
        {badge && (
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold', theme.badge)}>
            <CalendarClock aria-hidden="true" className="size-3.5" />
            {badge}
          </span>
        )}
      </span>

      <span className={cn('relative mt-6 text-xs font-semibold tracking-[0.14em] uppercase', theme.eyebrow)}>
        {eyebrow}
      </span>
      <span className={cn('relative mt-1 text-2xl font-bold tracking-tight', theme.title)}>{title}</span>
      <span className={cn('relative mt-2 text-base font-medium', theme.title)}>{tagline}</span>

      <span className="relative mt-5 grid gap-2.5">
        {features.map((feature) => (
          <span key={feature} className={cn('flex items-start gap-2.5 text-sm leading-snug', theme.body)}>
            <span aria-hidden="true" className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', theme.dot)} />
            {feature}
          </span>
        ))}
      </span>

      {/* mt-auto: las pastillas quedan alineadas abajo aunque los textos midan distinto. */}
      <span className="relative mt-auto pt-7">
        <span
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold shadow-sm transition-[gap] group-hover:gap-3',
            theme.cta,
          )}
        >
          {cta}
          <ArrowRight aria-hidden="true" className="size-4" />
        </span>
      </span>
    </button>
  );
}

interface CardTheme {
  card: string;
  eyebrow: string;
  title: string;
  body: string;
  dot: string;
  cta: string;
  badge: string;
}

const CARD_THEME: Record<PathId, CardTheme> = {
  // La misma superficie de la tarjeta "cuanto puedo gastar hoy" del Home.
  finanzas: {
    card: 'hero-surface ring-hero-accent/15 hover:ring-hero-accent/45 focus-visible:ring-hero-accent/50',
    eyebrow: 'text-hero-accent',
    title: 'text-hero-foreground',
    body: 'text-hero-foreground/75',
    dot: 'bg-hero-accent',
    cta: 'bg-hero-accent text-hero',
    badge: 'bg-hero-accent/15 text-hero-accent',
  },
  // El dojo: tinta sumi, olas seigaiha, oro y bermellon.
  habitos: {
    card: 'sumi-band sumi-seigaiha ring-[#c9a227]/25 hover:ring-[#c9a227]/60 focus-visible:ring-[#c9a227]/60',
    eyebrow: 'text-[#c9a227]',
    title: 'text-[#f4efe4]',
    body: 'text-[#f4efe4]/70',
    dot: 'bg-[#c9a227]',
    cta: 'bg-[#c8362d] text-[#f4efe4]',
    badge: 'bg-[#c9a227]/15 text-[#c9a227]',
  },
  // Noche polar con escarcha, como el header del modulo.
  'winter-arc': {
    card: 'bg-[#0b1624] bg-[radial-gradient(120%_120%_at_100%_0%,rgba(124,196,232,0.3)_0%,rgba(124,196,232,0)_60%)] ring-[#7cc4e8]/25 hover:ring-[#7cc4e8]/60 focus-visible:ring-[#7cc4e8]/60',
    eyebrow: 'text-[#7cc4e8]',
    title: 'text-[#eef7fc]',
    body: 'text-[#eef7fc]/70',
    dot: 'bg-[#7cc4e8]',
    cta: 'bg-[#cfe8f5] text-[#0b1624]',
    badge: 'border border-[#7cc4e8]/40 bg-[#7cc4e8]/10 text-[#7cc4e8]',
  },
};

function greetingFor(hour: number): string {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
