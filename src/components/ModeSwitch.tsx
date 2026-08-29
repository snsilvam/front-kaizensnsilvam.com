import { ArrowLeftRight, Sparkles, WalletCards } from 'lucide-react';
import { Button } from './ui/button';

interface ModeSwitchProps {
  currentPath: string;
  /**
   * Piel del boton. "sumi" es la del header samurai del modo habitos, donde
   * los colores del tema claro no tendrian contraste sobre la tinta.
   */
  tone?: 'default' | 'sumi';
}

export function ModeSwitch({ currentPath, tone = 'default' }: ModeSwitchProps) {
  const isHabitsMode = currentPath === '/habits' || currentPath === '/habito-1';
  const targetPath = isHabitsMode ? '/' : '/habits';
  const targetLabel = isHabitsMode ? 'Finanzas' : 'Hábitos';
  const isSumi = tone === 'sumi';

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={
        isSumi
          ? 'gap-2 border-[#c9a227]/40 bg-[#f4efe4]/5 text-[#f4efe4]/80 hover:border-[#c9a227]/70 hover:bg-[#f4efe4]/10 hover:text-[#f4efe4]'
          : 'gap-2 text-muted-foreground'
      }
      onClick={() => { window.location.href = targetPath; }}
      aria-label={`Cambiar al modo ${targetLabel.toLowerCase()}`}
      title={`Cambiar a ${targetLabel}`}
    >
      <span
        aria-hidden="true"
        className={`grid size-7 place-items-center rounded-full ${
          isHabitsMode
            ? isSumi
              ? 'bg-[#c9a227] text-[#0f141b]'
              : 'bg-primary text-primary-foreground'
            : 'bg-amber-400 text-amber-950'
        }`}
      >
        {isHabitsMode ? <WalletCards className="size-4" /> : <Sparkles className="size-4" />}
      </span>
      <span className="hidden sm:inline">{targetLabel}</span>
      <ArrowLeftRight aria-hidden="true" className="size-3.5" />
    </Button>
  );
}
