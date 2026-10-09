import type { ReactNode } from 'react';
import { House, LogOut, Receipt, ScanText, ShoppingCart, Wallet } from 'lucide-react';
import KaizenLogo from './KaizenLogo';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useAuth } from '../auth/useAuth';
import { PathSwitcher } from './PathSwitcher';
import { UserAvatar } from './UserAvatar';
import { HabitsHeader } from './HabitsHeader';
import { HamburgerMenu } from './HamburgerMenu';
import { BottomNav, type FinanceLink } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  currentPath: string;
}

// Enlaces del modo finanzas: los mismos en el header de escritorio y en las
// pestañas de movil.
const NAV_LINKS: FinanceLink[] = [
  { href: '/', label: 'Inicio', icon: House },
  { href: '/ingresos', label: 'Ingresos', icon: Wallet },
  { href: '/gastos', label: 'Gastos', icon: Receipt },
  { href: '/mercado', label: 'Mercado', icon: ShoppingCart },
  { href: '/facturas', label: 'Facturas', icon: ScanText },
];

export function AppLayout({ children, currentPath }: AppLayoutProps) {
  // El modo habitos tiene su propio header (tema samurai); el de finanzas no aplica ahi.
  const isHabitsMode = currentPath === '/habito-1';
  const { signOut } = useAuth();

  if (isHabitsMode) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <HabitsHeader />

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6">
          <main className="flex-1 py-12 sm:py-16">{children}</main>

          <footer className="pb-5">
            <Separator />
            <div className="flex flex-col gap-1 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
              <span lang="ja">改善</span>
              <span>Un día más, una repetición más.</span>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            className="inline-flex items-center gap-2.5 text-foreground no-underline"
            href="/"
            aria-label="Kaizen, ir al inicio"
          >
            <KaizenLogo
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-xl object-cover shadow-md shadow-primary/20"
              alt="Pastor, mascota de Kaizen"
            />
            <span className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight">Kaizen</span>
              <span className="mt-1 text-[0.68rem] font-medium text-muted-foreground">Finanzas</span>
            </span>
          </a>

          {/* Escritorio: navegacion en linea, al centro. */}
          <nav
            className="hidden items-center gap-1 rounded-xl bg-muted/70 p-1 md:flex"
            aria-label="Navegación principal"
          >
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = currentPath === href;
              return (
                <a
                  key={href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold no-underline transition-colors ${
                    active
                      ? 'bg-card text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                  }`}
                  href={href}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </a>
              );
            })}
          </nav>

          {/* En movil las secciones van en las pestañas de abajo y salir, en el menu. */}
          <div className="flex items-center gap-2">
            <PathSwitcher current="finanzas" />
            <UserAvatar />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:inline-flex"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              onClick={signOut}
            >
              <LogOut aria-hidden="true" />
            </Button>
            <HamburgerMenu links={[]} currentPath={currentPath} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6">
        <main className="flex-1 py-8 sm:py-12">{children}</main>

        <footer className="hidden pb-5 md:block">
          <Separator />
          <div className="flex flex-col gap-1 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <span>Kaizen · <span lang="ja">改善</span></span>
            <span>Tu dinero, con calma.</span>
          </div>
        </footer>
      </div>

      <BottomNav links={NAV_LINKS} currentPath={currentPath} />
    </div>
  );
}
