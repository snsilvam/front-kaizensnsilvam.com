import { ArrowRight, Wallet } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import KaizenLogo from '../components/KaizenLogo';
import { firstNameOf } from '../services/format';

export function SelectApp() {
  const { completeAppSelection, user } = useAuth();
  const name = firstNameOf(user?.displayName, user?.email);

  function useKaizen() {
    completeAppSelection();
  }

  function useKaizenHabits() {
    completeAppSelection();
    window.location.href = '/habits';
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />

      <main className="relative w-full max-w-3xl" aria-labelledby="select-app-title">
        <div className="mb-8 flex flex-col items-center text-center">
          <KaizenLogo
            width={64}
            height={64}
            className="size-16 rounded-2xl object-cover shadow-lg shadow-primary/20"
            alt="Pastor, mascota de Kaizen"
          />
          <h1 id="select-app-title" className="mt-5 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
            {name ? `Hola, ${name}. ¿Qué hacemos hoy?` : '¿Qué hacemos hoy?'}
          </h1>
          <p className="mt-2 text-muted-foreground">Elige una aplicación. Puedes cambiar cuando quieras.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={useKaizen}
            className="group flex flex-col rounded-3xl bg-card p-6 text-left shadow-soft ring-1 ring-border transition-all outline-none hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-7"
          >
            <span aria-hidden="true" className="grid size-12 place-items-center rounded-2xl bg-accent text-primary">
              <Wallet className="size-6" />
            </span>
            <span className="mt-6 text-xs font-semibold tracking-[0.12em] text-primary uppercase">Finanzas</span>
            <span className="mt-1 text-2xl font-bold tracking-tight text-foreground">Kaizen</span>
            <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Cuánto puedes gastar hoy, cuántos días faltan para tu ingreso y si vas bien con tu plan.
            </span>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Entrar
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={useKaizenHabits}
            className="sumi-band sumi-seigaiha group relative isolate flex flex-col overflow-hidden rounded-3xl p-6 text-left shadow-soft ring-1 ring-[#c9a227]/25 transition-all outline-none hover:-translate-y-0.5 hover:shadow-lg hover:ring-[#c9a227]/60 focus-visible:ring-3 focus-visible:ring-[#c9a227]/60 sm:p-7"
          >
            <span
              aria-hidden="true"
              lang="ja"
              className="relative grid size-12 place-items-center rounded-full bg-[#c8362d] text-lg font-bold text-[#f4efe4] shadow-lg shadow-[#c8362d]/30"
            >
              道
            </span>
            <span className="relative mt-6 text-xs font-semibold tracking-[0.12em] text-[#c9a227] uppercase">Hábitos</span>
            <span className="relative mt-1 text-2xl font-bold tracking-tight text-[#f4efe4]">Kaizen Habits</span>
            <span className="relative mt-2 text-sm leading-relaxed text-[#f4efe4]/65">
              Construye tu identidad con pequeñas repeticiones. Un día más, una repetición más.
            </span>
            <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9a227]">
              Entrar al dojo
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
