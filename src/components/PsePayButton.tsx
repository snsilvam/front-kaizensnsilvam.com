import { ExternalLink } from 'lucide-react';
import { buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';
import { siteOf } from '../lib/debts';

interface PsePayButtonProps {
  /** Pagina oficial de pagos de la entidad; viene del catalogo del backend. */
  url: string;
  size?: 'default' | 'lg';
  /** En media columna (filas de deudas) dice solo "Pagar": la insignia ya dice PSE. */
  compact?: boolean;
  className?: string;
}

/**
 * Boton explicito de PSE. Abre la pagina de pagos de la propia entidad en otra
 * pestaña: la persona paga alla con PSE desde el banco que quiera y la plata va
 * directo de su cuenta a la entidad. Kaizen no cobra ni manda datos:
 * `noreferrer` evita incluso que la pagina sepa de donde llego.
 *
 * No usa el logo oficial de PSE (marca de ACH Colombia): dice "PSE" en texto.
 * Debajo muestra el sitio al que lleva, para ver que es el oficial.
 */
export function PsePayButton({ url, size = 'default', compact = false, className }: PsePayButtonProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ size: size === 'lg' ? 'lg' : 'default' }),
          'w-full bg-[#0b5394] text-white no-underline shadow-[#0b5394]/25 hover:bg-[#0b5394]/90',
        )}
        aria-label={`Pagar con PSE en ${siteOf(url)} (se abre en otra pestaña)`}
      >
        <span
          aria-hidden="true"
          className="rounded-md bg-white px-1.5 py-0.5 text-[0.7rem] leading-none font-black tracking-wider text-[#0b5394]"
        >
          PSE
        </span>
        {compact ? 'Pagar' : 'Pagar con PSE'}
        <ExternalLink aria-hidden="true" className="size-3.5 opacity-80" />
      </a>
      <span className="truncate text-center text-[0.7rem] text-muted-foreground">Se abre {siteOf(url)}</span>
    </div>
  );
}
