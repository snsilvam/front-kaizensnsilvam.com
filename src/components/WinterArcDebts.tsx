import { useState } from 'react';
import { Check, Plus, Scale } from 'lucide-react';
import { HabitRepetitionDialog } from './HabitRepetitionDialog';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useKaizenHabits } from '../hooks/useKaizenHabits';
import type { UseWinterArcGrid } from '../hooks/useWinterArcGrid';
import { formatDayMonth } from '../lib/habitDates';
import { cn } from '../lib/utils';
import { strike } from '../lib/winterArcCelebration';
import { ApiError } from '../services/api';
import { registerKaizenHabitRepetition } from '../services/kaizenHabits';
import { WINTER_ARC_DEBT_PAYMENT_DAYS, type WinterArcDebt, type WinterArcDebtHabit } from '../types/winterArc';

const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

interface Paying {
  debt: WinterArcDebt;
  habit: WinterArcDebtHabit;
}

/**
 * Las deudas del samurái: los días fallados que todavía se pueden salvar.
 *
 * Pagar es hacer, además de lo de hoy, la repetición de cada hábito que faltó,
 * registrada con la fecha del día fallado. Cuando todas están, el backend
 * marca el día como pagado y deja de contar para la racha; aquí sólo se
 * registra la repetición y se recarga el grid. Sólo con el reto activo y
 * alguna deuda vigente.
 */
export function WinterArcDebts({ grid }: { grid: UseWinterArcGrid }) {
  const [feedback, setFeedback] = useState('');
  const debts = grid.data?.status === 'active' ? (grid.data.debts ?? []) : [];

  if (debts.length === 0 && !feedback) return null;

  return (
    <Card className="border-warning/40">
      <CardHeader>
        <p className="text-[0.62rem] font-semibold tracking-[0.22em] text-warning uppercase">La deuda del samurái</p>
        <CardTitle className="text-xl font-bold tracking-[-0.03em]">
          {debts.length > 0 ? 'Días por saldar' : 'Deuda saldada'}
        </CardTitle>
        <CardDescription>
          Un día cedido se salva si pagas su deuda: haz hoy, además de lo de hoy, la repetición de cada hábito que
          faltó. Tienes {WINTER_ARC_DEBT_PAYMENT_DAYS} días. Salva la racha y cuenta como día forjado.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        {feedback && (
          <Alert>
            <Check aria-hidden="true" />
            <AlertDescription>{feedback}</AlertDescription>
          </Alert>
        )}

        {debts.length > 0 && grid.data && (
          <DebtList debts={debts} today={grid.data.today} reload={grid.reload} onSettled={setFeedback} />
        )}
      </CardContent>
    </Card>
  );
}

/** Va aparte para pedir los hábitos (la acción mínima del modal) sólo si hay deudas. */
function DebtList({
  debts,
  today,
  reload,
  onSettled,
}: {
  debts: WinterArcDebt[];
  today: string;
  reload: () => void;
  onSettled: (message: string) => void;
}) {
  const habits = useKaizenHabits();
  const [paying, setPaying] = useState<Paying | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function openPay(debt: WinterArcDebt, habit: WinterArcDebtHabit) {
    setSaveError('');
    setPaying({ debt, habit });
  }

  async function pay({ debt, habit }: Paying, input: { isMinimum: boolean; description: string }) {
    setSaving(true);
    setSaveError('');

    try {
      await registerKaizenHabitRepetition(habit.habit_id, {
        occurredOn: debt.date,
        isMinimum: input.isMinimum,
        description: input.description,
      });
      setPaying(null);
      strike(document.querySelector(`[data-strike-origin="${CSS.escape(`${debt.date}:${habit.habit_id}`)}"]`));
      if (debt.habits.every((h) => h.paid || h.habit_id === habit.habit_id)) {
        onSettled(`Deuda del ${dayLabel(debt.date)} saldada: ese día queda forjado.`);
      }
      reload();
    } catch (requestError) {
      // 409: ese día ya tenía repetición de ese hábito; basta con refrescar.
      if (requestError instanceof ApiError && requestError.status === 409) {
        setPaying(null);
        reload();
        return;
      }
      setSaveError(requestError instanceof Error ? requestError.message : 'No fue posible pagar la deuda.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ul className="grid gap-4">
        {debts.map((debt) => {
          const paid = debt.habits.filter((h) => h.paid).length;
          const dueToday = debt.due_date === today;

          return (
            <li key={debt.day_number} className="grid gap-3 rounded-xl border px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="flex items-center gap-2 font-semibold">
                  <Scale aria-hidden="true" className="size-4 text-warning" />
                  {capitalize(dayLabel(debt.date))}
                  <span className="font-mono text-xs font-normal text-muted-foreground">Día {debt.day_number}</span>
                </p>
                <p className={cn('text-xs', dueToday ? 'font-semibold text-warning' : 'text-muted-foreground')}>
                  {dueToday ? 'Vence hoy a las 23:59' : `Vence el ${dayLabel(debt.due_date)}`}
                </p>
              </div>

              <ul className="grid gap-2">
                {debt.habits.map((habit) => (
                  <li key={habit.habit_id} className="flex items-center gap-2 text-sm">
                    <span
                      aria-hidden="true"
                      data-strike-origin={`${debt.date}:${habit.habit_id}`}
                      className={cn(
                        'grid size-4 shrink-0 place-items-center rounded-full border-2',
                        habit.paid ? 'border-[#2b7fa8] bg-[#2b7fa8] text-[#eef7fc]' : 'border-warning bg-warning-soft',
                      )}
                    >
                      {habit.paid && <Check className="size-2.5" strokeWidth={3} />}
                    </span>
                    <span className={cn('min-w-0 font-medium break-words', habit.paid && 'text-muted-foreground')}>
                      {habit.name}
                    </span>
                    {habit.paid ? (
                      <span className="ml-auto text-xs text-[#1d6a8f]">pagada</span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className="ml-auto"
                        onClick={() => openPay(debt, habit)}
                        aria-label={`Pagar la deuda de ${habit.name} del ${dayLabel(debt.date)}`}
                      >
                        <Plus aria-hidden="true" />
                        Pagar
                      </Button>
                    )}
                  </li>
                ))}
              </ul>

              {debt.habits.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  {paid} de {debt.habits.length} pagadas. El día se salva con todas.
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {paying && (
        <HabitRepetitionDialog
          habitName={paying.habit.name}
          minimumAction={habits.data?.find((habit) => habit.id === paying.habit.habit_id)?.minimumAction2min ?? ''}
          dayKey={paying.debt.date}
          saving={saving}
          error={saveError}
          onClose={() => setPaying(null)}
          onConfirm={(input) => pay(paying, input)}
        />
      )}
    </>
  );
}

/** "2026-10-11" -> "domingo 11 de octubre". En UTC para no depender de la zona del navegador. */
function dayLabel(dayKey: string): string {
  const weekday = WEEKDAY_NAMES[new Date(`${dayKey}T00:00:00Z`).getUTCDay()] ?? '';
  return `${weekday} ${formatDayMonth(dayKey)}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
