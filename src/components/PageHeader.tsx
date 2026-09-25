import type { ReactNode } from 'react';

interface PageHeaderProps {
  id: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /** Botones a la derecha en escritorio, debajo del texto en movil. */
  actions?: ReactNode;
}

/** Encabezado comun de las pantallas de finanzas: la misma voz en todas. */
export function PageHeader({ id, eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            {eyebrow}
          </p>
        )}
        <h1
          id={id}
          className="font-heading text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl"
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2 *:flex-1 sm:*:flex-none">{actions}</div>}
    </header>
  );
}
