import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { PathMark, PathSwitcher } from './PathSwitcher';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '../auth/useAuth';

/**
 * Marco del modulo de sueno, el cuarto camino. Es claro como el de finanzas,
 * para no estrenar otra piel, con el sello 💤 y el boton Caminos de siempre.
 */
export function SleepLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a className="inline-flex min-w-0 items-center gap-2.5 text-foreground no-underline" href="/sleep" aria-label="Sueño, ir al registro de hoy">
            <PathMark path="sleep" />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="text-base font-bold tracking-tight">Sueño</span>
              <span className="mt-1 truncate text-[0.68rem] font-medium text-muted-foreground">Despertar 5AM</span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <PathSwitcher current="sleep" />
            <UserAvatar />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              onClick={signOut}
            >
              <LogOut aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 sm:px-6">
        <main className="flex-1 py-8 sm:py-12">{children}</main>

        <footer className="pb-5">
          <Separator />
          <p className="py-5 text-xs text-muted-foreground">Sueño · Habito 01: Despertar 5AM</p>
        </footer>
      </div>
    </div>
  );
}
