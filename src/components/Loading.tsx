import KaizenLogo from './KaizenLogo';
import { Skeleton } from './ui/skeleton';

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

/** Mientras Firebase resuelve la sesion: el Pastor, y nada que parpadee de mas. */
export function AppSplash() {
  return (
    <div className="grid min-h-screen place-items-center bg-background" aria-busy="true" aria-label="Cargando Kaizen">
      <div className="flex flex-col items-center gap-4">
        <KaizenLogo
          width={72}
          height={72}
          className="size-18 animate-pulse rounded-3xl object-cover shadow-lg shadow-primary/25"
          alt=""
        />
        <p className="text-sm font-medium tracking-wide text-muted-foreground">Kaizen</p>
      </div>
    </div>
  );
}
