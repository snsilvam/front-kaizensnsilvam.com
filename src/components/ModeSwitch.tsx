import { ArrowLeftRight, Sparkles, WalletCards } from 'lucide-react';
import { Button } from './ui/button';

interface ModeSwitchProps {
  currentPath: string;
}

export function ModeSwitch({ currentPath }: ModeSwitchProps) {
  const isHabitsMode = currentPath === '/habits' || currentPath === '/habito-1';
  const targetPath = isHabitsMode ? '/' : '/habits';
  const targetLabel = isHabitsMode ? 'Finanzas' : 'Hábitos';

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2 text-muted-foreground"
      onClick={() => { window.location.href = targetPath; }}
      aria-label={`Cambiar al modo ${targetLabel.toLowerCase()}`}
      title={`Cambiar a ${targetLabel}`}
    >
      <span
        aria-hidden="true"
        className={`grid size-7 place-items-center rounded-full ${
          isHabitsMode ? 'bg-primary text-primary-foreground' : 'bg-amber-400 text-amber-950'
        }`}
      >
        {isHabitsMode ? <WalletCards className="size-4" /> : <Sparkles className="size-4" />}
      </span>
      <span className="hidden sm:inline">{targetLabel}</span>
      <ArrowLeftRight aria-hidden="true" className="size-3.5" />
    </Button>
  );
}
