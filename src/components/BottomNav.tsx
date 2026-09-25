import type { LucideIcon } from 'lucide-react';

export interface FinanceLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  links: FinanceLink[];
  currentPath: string;
}

/**
 * Pestañas del modo finanzas en movil, abajo, donde llega el pulgar.
 * En escritorio la misma lista vive en el header.
 */
export function BottomNav({ links, currentPath }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md list-none p-0" style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = currentPath === href;
          return (
            <li key={href}>
              <a
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 pt-2 pb-2.5 text-[0.7rem] font-semibold no-underline transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${
                    active ? 'bg-accent' : ''
                  }`}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
