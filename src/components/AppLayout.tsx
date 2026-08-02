import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  currentPath: string;
}

export function AppLayout({ children, currentPath }: AppLayoutProps) {
  const isDashboard = currentPath === '/';

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Kaizen, ir al inicio">
          <span className="brand-mark" aria-hidden="true">K</span>
          <span>Kaizen</span>
        </a>

        <nav className="main-nav" aria-label="Navegacion principal">
          <a className={isDashboard ? 'nav-link nav-link-active' : 'nav-link'} href="/">
            Resumen
          </a>
        </nav>
      </header>

      <main className="app-content">{children}</main>

      <footer className="app-footer">
        <span>Kaizen</span>
        <span>Tu dinero, con calma.</span>
      </footer>
    </div>
  );
}
