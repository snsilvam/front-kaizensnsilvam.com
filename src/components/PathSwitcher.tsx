import { Menu } from '@base-ui/react/menu';
import { Check, ChevronDown, Compass, LayoutGrid, Snowflake, WalletCards } from 'lucide-react';
import { buttonVariants } from './ui/button';
import { cn } from '../lib/utils';
import { CHOOSER_PATH, PATH_HOME, type PathId } from '../lib/paths';
import { formatDayMonth } from '../lib/habitDates';
import { isWinterArcOpen, WINTER_ARC_OPENS_ON } from '../lib/winterArcOpening';

/**
 * El sello de cada camino: billetera en verde bosque, el ideograma 道 sobre el
 * disco rojo del dojo y el copo sobre hielo. Se repite en el selector de
 * caminos, en el menu del header y en la cortina de entrada, para que cada
 * camino se reconozca de un vistazo.
 */
export function PathMark({ path, size = 'sm' }: { path: PathId; size?: 'sm' | 'lg' }) {
  const large = size === 'lg';

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full',
        large ? 'size-12 shadow-lg' : 'size-8',
        MARK_CLASS[path],
      )}
    >
      {path === 'finanzas' && <WalletCards className={large ? 'size-6' : 'size-4'} />}
      {path === 'habitos' && (
        <span lang="ja" className={cn('font-bold', large ? 'text-lg' : 'text-sm')}>
          道
        </span>
      )}
      {path === 'winter-arc' && <Snowflake className={large ? 'size-6' : 'size-4'} />}
    </span>
  );
}

const MARK_CLASS: Record<PathId, string> = {
  finanzas: 'bg-hero-accent text-hero shadow-hero/30',
  habitos: 'bg-[#c8362d] text-[#f4efe4] shadow-[#c8362d]/30',
  'winter-arc': 'bg-[#cfe8f5] text-[#0b1624] shadow-[#7cc4e8]/30',
};

interface PathSwitcherProps {
  /** Camino en el que esta el usuario. */
  current: PathId;
  /** Piel del boton, la del header donde vive: claro, tinta sumi o noche polar. */
  tone?: 'light' | 'sumi' | 'polar';
}

/**
 * Boton "Caminos" de los tres headers: abre un menu con los tres caminos, marca
 * en cual estas y deja volver al selector completo. Es el mismo en todos lados
 * para que cambiar de camino se aprenda una sola vez.
 */
export function PathSwitcher({ current, tone = 'light' }: PathSwitcherProps) {
  const winterArcOpen = isWinterArcOpen();

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Cambiar de camino"
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5', TRIGGER_CLASS[tone])}
      >
        <Compass aria-hidden="true" />
        Caminos
        <ChevronDown
          aria-hidden="true"
          className="size-3.5 opacity-70 transition-transform in-data-popup-open:rotate-180"
        />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50 outline-none">
          <Menu.Popup className="w-[min(22rem,calc(100vw-2rem))] origin-(--transform-origin) rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg shadow-[#14281f]/10 outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <p className="px-2.5 pt-1.5 pb-2 text-[0.65rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Cambiar de camino
            </p>

            {PATHS.map(({ id, label, hint }) => {
              const here = id === current;
              const locked = id === 'winter-arc' && !winterArcOpen;

              return (
                <Menu.LinkItem
                  key={id}
                  href={PATH_HOME[id]}
                  aria-current={here ? 'page' : undefined}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2 no-underline outline-none data-highlighted:bg-muted"
                >
                  <PathMark path={id} />
                  <span className="grid min-w-0 flex-1 leading-tight">
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    <span className="truncate text-xs text-muted-foreground">{hint}</span>
                  </span>
                  {here && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold text-accent-foreground">
                      <Check aria-hidden="true" className="size-3" />
                      Estás aquí
                    </span>
                  )}
                  {!here && locked && (
                    <span className="rounded-full bg-[#cfe8f5] px-2 py-0.5 text-[0.65rem] font-semibold text-[#0b1624]">
                      Abre el {formatDayMonth(WINTER_ARC_OPENS_ON)}
                    </span>
                  )}
                </Menu.LinkItem>
              );
            })}

            <Menu.Separator className="my-1.5 h-px bg-border" />

            <Menu.LinkItem
              href={CHOOSER_PATH}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground no-underline outline-none data-highlighted:bg-muted data-highlighted:text-foreground"
            >
              <span aria-hidden="true" className="grid size-8 place-items-center">
                <LayoutGrid className="size-4" />
              </span>
              Ver todos los caminos
            </Menu.LinkItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

const PATHS: { id: PathId; label: string; hint: string }[] = [
  { id: 'finanzas', label: 'Finanzas', hint: 'Cuánto puedes gastar hoy' },
  { id: 'habitos', label: 'Hábitos', hint: 'Un día más, una repetición más' },
  { id: 'winter-arc', label: 'Winter Arc', hint: 'El reto de 90 días' },
];

const TRIGGER_CLASS: Record<NonNullable<PathSwitcherProps['tone']>, string> = {
  light: 'text-muted-foreground data-popup-open:bg-muted data-popup-open:text-foreground',
  sumi: 'border-[#c9a227]/40 bg-[#f4efe4]/5 text-[#f4efe4]/85 hover:border-[#c9a227]/70 hover:bg-[#f4efe4]/10 hover:text-[#f4efe4] data-popup-open:border-[#c9a227]/70 data-popup-open:bg-[#f4efe4]/10',
  polar: 'border-[#7cc4e8]/40 bg-[#eef7fc]/5 text-[#eef7fc]/85 hover:border-[#7cc4e8]/70 hover:bg-[#eef7fc]/10 hover:text-[#eef7fc] data-popup-open:border-[#7cc4e8]/70 data-popup-open:bg-[#eef7fc]/10',
};
