import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { ModeSwitch } from './ModeSwitch';
import { UserAvatar } from './UserAvatar';
import { PastorBark } from './PastorBark';
import { useAuth } from '../auth/useAuth';

interface HabitsHeaderProps {
  /** Ruta actual, para que el conmutador de modo sepa donde esta. */
  currentPath: string;
}

/**
 * Header del modo habitos, con el tema samurai.
 *
 * El modo finanzas es claro y calmado; el de habitos es el dojo: tinta sumi,
 * el disco del hinomaru y las olas seigaiha. El cambio de piel es la senal de
 * que estas en otro sitio de la app, y engancha con el camino del Bushido que
 * mide las repeticiones mas abajo.
 */
export function HabitsHeader({ currentPath }: HabitsHeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="sumi-band sumi-seigaiha relative isolate w-full overflow-hidden">
      <div className="relative mx-auto flex min-h-24 w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="inline-flex items-center gap-3.5">
          {/* El sello es el Pastor sobre el disco del hinomaru, y ladra. */}
          <PastorBark />

          <a
            className="flex flex-col leading-none no-underline"
            href="/habits"
            aria-label="Kaizen Hábitos, ir al inicio del modo hábitos"
          >
            <span lang="ja" className="text-[0.6rem] font-medium tracking-[0.42em] text-[#c9a227]">
              カイゼン
            </span>
            <span className="mt-1.5 text-lg font-bold tracking-[0.22em] text-[#f4efe4] sm:text-xl">
              KAIZEN
            </span>
            <span className="mt-1.5 text-[0.62rem] font-semibold tracking-[0.26em] text-[#f4efe4]/45 uppercase">
              <span lang="ja">道</span> · El camino
            </span>
          </a>
        </div>

        {/* Sello central: el ideograma del Bushido, como el kakemono del dojo. */}
        <p
          lang="ja"
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 text-3xl font-bold tracking-[0.35em] text-[#f4efe4]/8 select-none lg:block"
        >
          武士道
        </p>

        <div className="flex items-center gap-2.5">
          <p className="mr-1 hidden text-right text-[0.62rem] leading-tight font-semibold tracking-[0.22em] text-[#c9a227] uppercase md:block">
            Construye
            <br />
            tu identidad
          </p>

          <ModeSwitch currentPath={currentPath} tone="sumi" />

          <span className="grid place-items-center rounded-full p-0.5 ring-1 ring-[#c9a227]/50">
            <UserAvatar />
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-[#f4efe4]/15 bg-[#f4efe4]/5 text-[#f4efe4]/70 hover:border-[#c8362d]/60 hover:bg-[#c8362d]/20 hover:text-[#f4efe4]"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            onClick={signOut}
          >
            <LogOut aria-hidden="true" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>

      {/* Trazo de pincel: cierra el header en vez de un borde recto. */}
      <div aria-hidden="true" className="sumi-brush h-0.5 w-full" />
    </header>
  );
}
