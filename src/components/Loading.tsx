import KaizenLogo from './KaizenLogo';
import { Skeleton } from './ui/skeleton';
import { cn } from '../lib/utils';
import { pathOf, type PathId } from '../lib/paths';

/** Esqueleto del resumen financiero: la misma forma que el Home ya cargado. */
export function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando resumen financiero">
      <div className="space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-64 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Mientras Firebase resuelve la sesion. Toma la piel del camino de la URL: quien
 * entra al dojo o al Winter Arc no ve un destello verde de finanzas antes.
 */
export function AppSplash() {
  return <PathSplash path={pathOf(window.location.pathname)} />;
}

interface PathSplashProps {
  path: PathId;
  /** Verbo del aria-label: "Cargando" en el splash, "Entrando a" en la cortina. */
  action?: string;
  className?: string;
}

/**
 * Pantalla completa con la piel de un camino y su sello latiendo, y nada que
 * parpadee de mas. La usan el splash de arranque y la cortina del selector de
 * caminos, asi el color no salta mientras se cambia de pagina.
 */
export function PathSplash({ path, action = 'Cargando', className }: PathSplashProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={`${action} ${SPLASH_NAME[path]}`}
      className={cn('relative isolate grid min-h-screen place-items-center', SPLASH_CLASS[path], className)}
    >
      <div className="relative flex flex-col items-center gap-4">
        {path === 'finanzas' && (
          <KaizenLogo
            width={72}
            height={72}
            className="size-18 animate-pulse rounded-3xl object-cover shadow-lg shadow-primary/25"
            alt=""
          />
        )}
        {path === 'habitos' && (
          <span
            lang="ja"
            aria-hidden="true"
            className="grid size-18 animate-pulse place-items-center rounded-full bg-[#c8362d] text-3xl font-bold text-[#f4efe4] shadow-lg shadow-[#c8362d]/40"
          >
            道
          </span>
        )}
        {path === 'winter-arc' && (
          <span
            lang="ja"
            aria-hidden="true"
            className="grid size-18 animate-pulse place-items-center rounded-full bg-[#cfe8f5] text-3xl font-bold text-[#0b1624] shadow-lg shadow-[#7cc4e8]/40"
          >
            侍
          </span>
        )}
        <p className={cn('text-sm font-medium tracking-wide', SPLASH_TEXT_CLASS[path])}>{SPLASH_NAME[path]}</p>
      </div>
    </div>
  );
}

const SPLASH_NAME: Record<PathId, string> = {
  finanzas: 'Kaizen',
  habitos: 'Kaizen Habits',
  'winter-arc': 'Winter Arc',
};

const SPLASH_CLASS: Record<PathId, string> = {
  finanzas: 'bg-background',
  habitos: 'sumi-band sumi-seigaiha',
  'winter-arc': 'bg-[#0b1624] bg-[radial-gradient(120%_90%_at_50%_0%,rgba(124,196,232,0.28)_0%,rgba(124,196,232,0)_60%)]',
};

const SPLASH_TEXT_CLASS: Record<PathId, string> = {
  finanzas: 'text-muted-foreground',
  habitos: 'tracking-[0.22em] text-[#f4efe4]/70 uppercase',
  'winter-arc': 'tracking-[0.22em] text-[#eef7fc]/70 uppercase',
};
