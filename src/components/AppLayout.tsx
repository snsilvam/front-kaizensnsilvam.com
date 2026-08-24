import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import KaizenLogo from './KaizenLogo';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useAuth } from '../auth/useAuth';

interface AppLayoutProps {
  children: ReactNode;
  currentPath: string;
}

export function AppLayout({ children, currentPath }: AppLayoutProps) {
  const isIncomePage = currentPath === '/ingresos';
  const { user, signOut } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6">
      <header className="flex min-h-20 items-center justify-between border-b">
        <a
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground no-underline"
          href="/"
          aria-label="Kaizen, ir al inicio"
        >
          <KaizenLogo
            width={58}
            height={58}
            className="size-14 shrink-0 rounded-2xl object-cover shadow-md shadow-primary/20"
            alt="Pastor, mascota de Kaizen"
          />
          <span>Kaizen</span>
        </a>

        <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3" aria-label="Navegación principal">
          <a
            className={`rounded-md px-3 py-2 text-sm font-semibold no-underline transition-colors ${
              isIncomePage
                ? 'bg-accent text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-primary'
            }`}
            href="/ingresos"
          >
            Ingresos
          </a>

          {user && (
            <span className="max-w-40 truncate text-sm text-muted-foreground">
              {user.displayName ?? user.email}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-1 text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            onClick={signOut}
          >
            <LogOut aria-hidden="true" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </nav>
      </header>

      <main className="flex-1 py-12 sm:py-16">{children}</main>

      <footer className="pb-5">
        <Separator />
        <div className="flex flex-col gap-1 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>Kaizen</span>
          <span>Tu dinero, con calma.</span>
        </div>
      </footer>
    </div>
  );
}
