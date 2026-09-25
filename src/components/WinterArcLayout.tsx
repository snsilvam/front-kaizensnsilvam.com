import type { ReactNode } from 'react';
import { LogOut, Snowflake, Sparkles, WalletCards } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '../auth/useAuth';

/**
 * Marco del modulo Winter Arc, la tercera app junto a finanzas y habitos.
 *
 * Igual que el dojo de habitos, cambia de piel para que se note que estas en
 * otro sitio: noche polar y escarcha. Desde aqui se salta a Habitos (donde se
 * registran las repeticiones que el reto evalua) o a Finanzas.
 */
export function WinterArcLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="relative isolate w-full overflow-hidden bg-[#0b1624] bg-[radial-gradient(120%_150%_at_85%_-40%,rgba(124,196,232,0.32)_0%,rgba(124,196,232,0)_58%)]">
        <div className="relative mx-auto flex min-h-24 w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a
            className="inline-flex items-center gap-3.5 no-underline"
            href="/winter-arc"
            aria-label="Winter Arc, ir al inicio del reto"
          >
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full bg-[#cfe8f5] text-[#0b1624] shadow-lg shadow-[#7cc4e8]/30"
            >
              <Snowflake className="size-6" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-[0.22em] text-[#eef7fc] sm:text-xl">WINTER ARC</span>
              <span className="mt-1.5 text-[0.62rem] font-semibold tracking-[0.26em] text-[#7cc4e8] uppercase">
                90 días de disciplina
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={SWITCH_CLASS}
              aria-label="Ir al modo hábitos"
              title="Ir a Hábitos"
              onClick={() => { window.location.href = '/habits'; }}
            >
              <Sparkles aria-hidden="true" />
              <span className="hidden sm:inline">Hábitos</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className={SWITCH_CLASS}
              aria-label="Ir al modo finanzas"
              title="Ir a Finanzas"
              onClick={() => { window.location.href = '/'; }}
            >
              <WalletCards aria-hidden="true" />
              <span className="hidden sm:inline">Finanzas</span>
            </Button>

            <span className="grid place-items-center rounded-full p-0.5 ring-1 ring-[#7cc4e8]/50">
              <UserAvatar />
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-[#eef7fc]/15 bg-[#eef7fc]/5 text-[#eef7fc]/70 hover:border-destructive/60 hover:bg-destructive/20 hover:text-[#eef7fc]"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              onClick={signOut}
            >
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>

        {/* Linea de escarcha: cierra el header en vez de un borde recto. */}
        <div
          aria-hidden="true"
          className="h-0.5 w-full bg-linear-to-r from-transparent via-[#7cc4e8]/80 to-transparent"
        />
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
        <main className="flex-1 py-10 sm:py-14">{children}</main>

        <footer className="pb-5">
          <Separator />
          <div className="flex flex-col gap-1 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <span>Winter Arc</span>
            <span>Tres fallos seguidos y se apaga la llama.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

const SWITCH_CLASS =
  'gap-2 border-[#7cc4e8]/40 bg-[#eef7fc]/5 text-[#eef7fc]/80 hover:border-[#7cc4e8]/70 hover:bg-[#eef7fc]/10 hover:text-[#eef7fc]';
