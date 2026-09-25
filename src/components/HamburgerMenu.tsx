import { useEffect, useId, useRef, useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { ModeSwitch } from './ModeSwitch';
import { useAuth } from '../auth/useAuth';

export interface NavLink {
  href: string;
  label: string;
}

interface HamburgerMenuProps {
  links: NavLink[];
  currentPath: string;
}

/**
 * Navegacion del modo finanzas en pantallas pequenas.
 *
 * En movil el header no tiene espacio para los enlaces, el conmutador de modo
 * y el boton de salir; se agrupan en un panel que se despliega bajo el header.
 * Se cierra con Escape o tocando fuera. Los enlaces recargan la pagina (no hay
 * router), asi que no hace falta cerrarlo al navegar.
 */
export function HamburgerMenu({ links, currentPath }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const { signOut, user } = useAuth();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="md:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
      </Button>

      {open && (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-50 border-b bg-background px-4 pt-2 pb-4 shadow-lg shadow-primary/10 sm:px-6"
        >
          {user && (
            <div className="mb-3 border-b pb-3">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.displayName?.trim() || 'Tu cuenta'}
              </p>
              {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
            </div>
          )}

          {links.length > 0 && (
          <nav className="mb-3 flex flex-col gap-1 border-b pb-3" aria-label="Navegación principal">
            {links.map((link) => {
              const active = currentPath === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-3 py-3 text-base font-semibold no-underline transition-colors ${
                    active ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted hover:text-primary'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
          )}

          <div className="flex items-center justify-between gap-2">
            <ModeSwitch currentPath={currentPath} />

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              onClick={signOut}
            >
              <LogOut aria-hidden="true" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
