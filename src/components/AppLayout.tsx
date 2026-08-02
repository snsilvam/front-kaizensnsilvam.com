import type { ReactNode } from 'react';
import { Separator } from './ui/separator';

interface AppLayoutProps {
  children: ReactNode;
  currentPath: string;
}

export function AppLayout({ children, currentPath }: AppLayoutProps) {
  const isDashboard = currentPath === '/';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6">
      <header className="flex min-h-20 items-center justify-between border-b">
        <a
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground no-underline"
          href="/"
          aria-label="Kaizen, ir al inicio"
        >
          <span className="grid size-8 place-items-center rounded-[10px_10px_10px_2px] bg-primary font-serif text-lg text-primary-foreground" aria-hidden="true">
            K
          </span>
          <span>Kaizen</span>
        </a>

        <nav className="flex gap-2" aria-label="Navegación principal">
          <a
            className={`rounded-md px-3 py-2 text-sm font-semibold no-underline transition-colors ${
              isDashboard
                ? 'bg-accent text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-primary'
            }`}
            href="/"
          >
            Resumen
          </a>
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
