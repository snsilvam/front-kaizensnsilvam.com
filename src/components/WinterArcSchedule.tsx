import { useEffect, useState, type ReactNode } from 'react';
import { Check, Clock, Plus, Swords } from 'lucide-react';
import { HabitRepetitionDialog } from './HabitRepetitionDialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { useKaizenHabits } from '../hooks/useKaizenHabits';
import type { UseWinterArcGrid } from '../hooks/useWinterArcGrid';
import { bogotaMinutesNow, clockMinutes, formatClock, formatDuration } from '../lib/dayClock';
import { cn } from '../lib/utils';
import { ApiError } from '../services/api';
import { registerKaizenHabitRepetition } from '../services/kaizenHabits';
import type { WinterArcScheduleItem } from '../types/winterArc';

/** Cada cuánto se mueve el marcador de "ahora". */
const TICK_MS = 30_000;

type SlotState = 'done' | 'overdue' | 'next' | 'upcoming';

interface Slot {
  item: WinterArcScheduleItem;
  minutes: number;
  state: SlotState;
}

/**
 * La orden de hoy: las Reglas Inquebrantables en el orden del día, como una
 * línea de tiempo de la mañana a la noche con un marcador de "ahora".
 *
 * El orden y el "cumplido hoy" los da el backend en el grid; aquí sólo se
 * decide, con la hora de Bogotá, qué toca ahora, qué ya pasó y cuánto falta.
 * Sólo se muestra con el reto activo: es una agenda, no un registro.
 *
 * Cada regla pendiente se registra aquí mismo con el modal del dojo, siempre
 * para el `today` del servidor; al guardar se recarga el grid.
 */
export function WinterArcSchedule({ grid }: { grid: UseWinterArcGrid }) {
  const now = useBogotaMinutes();
  // Sólo para mostrar la acción mínima de cada hábito en el modal.
  const habits = useKaizenHabits();
  const [registering, setRegistering] = useState<WinterArcScheduleItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!grid.data) {
    return grid.error ? null : <Skeleton className="h-64 w-full rounded-xl" aria-label="Cargando la orden de hoy" />;
  }
  if (grid.data.status !== 'active') return null;

  const schedule = grid.data.schedule ?? [];
  const slots = toSlots(schedule, now);
  const unscheduled = schedule.filter((item) => clockMinutes(item.time) === null);
  const done = schedule.filter((item) => item.done_today).length;
  const allDone = schedule.length > 0 && done === schedule.length;
  // El marcador va antes de la primera regla que todavía no llega a su hora.
  const nowIndex = slots.findIndex((slot) => slot.minutes > now);
  const markerAt = nowIndex === -1 ? slots.length : nowIndex;
  const today = grid.data.today;

  function openRegister(item: WinterArcScheduleItem) {
    setSaveError('');
    setRegistering(item);
  }

  async function saveRepetition(item: WinterArcScheduleItem, input: { isMinimum: boolean; description: string }) {
    setSaving(true);
    setSaveError('');

    try {
      await registerKaizenHabitRepetition(item.habit_id, {
        occurredOn: today,
        isMinimum: input.isMinimum,
        description: input.description,
      });
      setRegistering(null);
      grid.reload();
    } catch (requestError) {
      // 409: ya tenía repetición hoy (una por día); basta con refrescar el horario.
      if (requestError instanceof ApiError && requestError.status === 409) {
        setRegistering(null);
        grid.reload();
        return;
      }
      setSaveError(requestError instanceof Error ? requestError.message : 'No fue posible registrar la repetición.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-[0.62rem] font-semibold tracking-[0.22em] text-[#1d6a8f] uppercase">
          El horario del samurái
        </p>
        <CardTitle className="text-xl font-bold tracking-[-0.03em]">La orden de hoy</CardTitle>
        <CardDescription>
          {allDone
            ? 'Cumpliste todo tu código. Sincroniza el día para sellarlo en el grid.'
            : 'Un samurái no negocia con el placer: cumple, a su hora. Todo lo de hoy cuenta hasta las 23:59.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {schedule.length > 0 && <DayProgress done={done} total={schedule.length} />}

        {slots.length > 0 && (
          <ol className="grid" aria-label="Reglas de hoy en orden del día">
            {slots.map((slot, index) => (
              <SlotRow
                key={slot.item.habit_id}
                slot={slot}
                now={now}
                marker={index === markerAt ? <NowMarker now={now} position={index === 0 ? 'first' : 'middle'} /> : null}
                connector={index < slots.length - 1 || markerAt === slots.length}
                onRegister={openRegister}
              />
            ))}
            {markerAt === slots.length && <NowMarker now={now} position="last" />}
          </ol>
        )}

        {unscheduled.length > 0 && (
          <div className="grid gap-2 rounded-xl border border-dashed px-4 py-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Sin hora</p>
            <ul className="grid gap-1.5">
              {unscheduled.map((item) => (
                <li key={item.habit_id} className="flex items-center gap-2 text-sm">
                  <StateDot state={item.done_today ? 'done' : 'upcoming'} small />
                  <span className={cn('font-medium', item.done_today && 'text-muted-foreground')}>{item.name}</span>
                  {item.done_today ? (
                    <span className="text-xs text-[#1d6a8f]">cumplido</span>
                  ) : (
                    <RegisterButton item={item} onRegister={openRegister} className="ml-auto" />
                  )}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Ponles una hora en el dojo para que ocupen su lugar en tu día.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button type="button" variant={allDone ? 'outline' : 'default'} onClick={goToDojo}>
            <Swords aria-hidden="true" />
            Entrenar en el dojo
          </Button>
          <span className="text-xs text-muted-foreground">Lo que registres allí aparece aquí al volver.</span>
        </div>
      </CardContent>

      {registering && (
        <HabitRepetitionDialog
          habitName={registering.name}
          minimumAction={habits.data?.find((habit) => habit.id === registering.habit_id)?.minimumAction2min ?? ''}
          dayKey={today}
          saving={saving}
          error={saveError}
          onClose={() => setRegistering(null)}
          onConfirm={(input) => saveRepetition(registering, input)}
        />
      )}
    </Card>
  );
}

/** Las reglas con hora, en el orden en que llegan del backend, con su estado respecto de `now`. */
function toSlots(schedule: WinterArcScheduleItem[], now: number): Slot[] {
  const slots: Slot[] = [];
  let nextTaken = false;
  for (const item of schedule) {
    const minutes = clockMinutes(item.time);
    if (minutes === null) continue;

    let state: SlotState = 'upcoming';
    if (item.done_today) state = 'done';
    else if (minutes <= now) state = 'overdue';
    else if (!nextTaken) {
      state = 'next';
      nextTaken = true;
    }
    slots.push({ item, minutes, state });
  }
  return slots;
}

function SlotRow({
  slot,
  now,
  marker,
  connector,
  onRegister,
}: {
  slot: Slot;
  now: number;
  marker: ReactNode;
  connector: boolean;
  onRegister: (item: WinterArcScheduleItem) => void;
}) {
  const { time, period } = formatClock(slot.minutes);

  return (
    <>
      {marker}
      <li className="grid grid-cols-[3.5rem_1.75rem_1fr] gap-x-3">
        <div className="pt-0.5 text-right leading-none">
          <span className={cn('block font-mono text-base font-semibold tabular-nums', slot.state === 'done' && 'text-muted-foreground')}>
            {time}
          </span>
          <span className="mt-1 block text-[0.6rem] tracking-[0.08em] text-muted-foreground uppercase">{period}</span>
        </div>

        <div className="relative flex justify-center">
          {connector && <span aria-hidden="true" className="absolute top-7 bottom-0 w-px bg-border" />}
          <StateDot state={slot.state} />
        </div>

        <div className="min-w-0 pb-6">
          <p className={cn('font-medium break-words', slot.state === 'done' && 'text-muted-foreground line-through decoration-[#2b7fa8]/60')}>
            {slot.item.name}
          </p>
          <p className={cn('mt-0.5 text-xs', STATE_TEXT_CLASS[slot.state])}>{stateLabel(slot, now)}</p>
          {slot.state !== 'done' && <RegisterButton item={slot.item} onRegister={onRegister} className="mt-2" />}
        </div>
      </li>
    </>
  );
}

/**
 * La línea de "ahora" entre las reglas. `position` dice qué tramo de la línea
 * de tiempo la cruza: el primero sólo sigue hacia abajo y el último sólo
 * viene de arriba.
 */
function NowMarker({ now, position }: { now: number; position: 'first' | 'middle' | 'last' }) {
  const { time, period } = formatClock(now);

  return (
    <li aria-label={`Ahora, ${time} ${period}`} className="grid grid-cols-[3.5rem_1.75rem_1fr] items-center gap-x-3 py-2">
      <span className="text-right text-[0.62rem] font-semibold tracking-[0.18em] text-[#1d6a8f] uppercase">Ahora</span>
      <span className="relative flex justify-center self-stretch">
        <span
          aria-hidden="true"
          className={cn(
            'absolute w-px bg-border',
            position === 'first' && '-bottom-2 top-1/2',
            position === 'middle' && '-inset-y-2',
            position === 'last' && '-top-2 bottom-1/2',
          )}
        />
        <span aria-hidden="true" className="relative size-2.5 self-center rotate-45 bg-[#2b7fa8] shadow-[0_0_10px_rgba(43,127,168,0.7)]" />
      </span>
      <span aria-hidden="true" className="flex items-center gap-2 font-mono text-xs text-[#1d6a8f]">
        {time} {period}
        <span className="h-px flex-1 bg-linear-to-r from-[#2b7fa8]/60 to-transparent" />
      </span>
    </li>
  );
}

function RegisterButton({
  item,
  onRegister,
  className,
}: {
  item: WinterArcScheduleItem;
  onRegister: (item: WinterArcScheduleItem) => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      className={className}
      onClick={() => onRegister(item)}
      aria-label={`Registrar repetición de ${item.name}`}
    >
      <Plus aria-hidden="true" />
      Registrar
    </Button>
  );
}

function StateDot({ state, small = false }: { state: SlotState; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full border-2',
        small ? 'size-4' : 'size-7',
        state === 'done' && 'border-[#2b7fa8] bg-[#2b7fa8] text-[#eef7fc]',
        state === 'next' && 'border-[#0b1624] bg-[#0b1624] text-[#cfe8f5] shadow-md shadow-[#7cc4e8]/50',
        state === 'overdue' && 'border-warning bg-warning-soft',
        state === 'upcoming' && 'border-border bg-card',
      )}
    >
      {state === 'done' && <Check className={small ? 'size-2.5' : 'size-4'} strokeWidth={3} />}
      {state === 'next' && !small && <Clock className="size-3.5" />}
    </span>
  );
}

function DayProgress({ done, total }: { done: number; total: number }) {
  return (
    <div className="grid gap-2">
      <p className="text-sm">
        <span className="font-semibold">
          {done} de {total}
        </span>{' '}
        <span className="text-muted-foreground">{total === 1 ? 'regla cumplida hoy' : 'reglas cumplidas hoy'}</span>
      </p>
      <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Reglas cumplidas hoy">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn('h-1.5 flex-1 rounded-full', i < done ? 'bg-[#2b7fa8]' : 'bg-muted')} />
        ))}
      </div>
    </div>
  );
}

const STATE_TEXT_CLASS: Record<SlotState, string> = {
  done: 'text-[#1d6a8f]',
  next: 'font-medium text-foreground',
  overdue: 'text-warning',
  upcoming: 'text-muted-foreground',
};

function stateLabel(slot: Slot, now: number): string {
  switch (slot.state) {
    case 'done':
      return 'Cumplido';
    case 'overdue':
      return 'Su hora pasó. Aún cuenta hasta las 23:59.';
    case 'next':
      return `Lo siguiente · en ${formatDuration(slot.minutes - now)}`;
    case 'upcoming':
      return `En ${formatDuration(slot.minutes - now)}`;
  }
}

/** La hora de Bogotá en minutos, al ritmo de TICK_MS. */
function useBogotaMinutes(): number {
  const [now, setNow] = useState(() => bogotaMinutesNow());

  useEffect(() => {
    const id = window.setInterval(() => setNow(bogotaMinutesNow()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

function goToDojo() {
  window.location.href = '/habits';
}
