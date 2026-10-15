import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from '../components/ui/skeleton';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { ErrorMessage } from '../components/ErrorMessage';
import { HabitDetail } from '../components/HabitDetail';
import { HabitRepetitionDialog } from '../components/HabitRepetitionDialog';
import { HabitWizard } from '../components/HabitWizard';
import { HabitsHeader } from '../components/HabitsHeader';
import { HabitsToday } from '../components/HabitsToday';
import { useHabitsToday } from '../hooks/useHabitsToday';
import { useKaizenHabitTracking } from '../hooks/useKaizenHabitTracking';
import { useKaizenHabits } from '../hooks/useKaizenHabits';
import { HABIT_COLORS, burst, cannons } from '../lib/confetti';
import { formatDayMonth, monthStart, shiftMonth, todayKey } from '../lib/habitDates';
import { byHabitTime, type HabitTemplate } from '../lib/habitTemplates';
import { cn } from '../lib/utils';
import { ApiError } from '../services/api';
import { deleteKaizenHabit, registerKaizenHabitRepetition } from '../services/kaizenHabits';
import type { KaizenHabit } from '../types/kaizenHabit';

/** `/habits?habito=<id>` abre el detalle; sin el parametro, el dia de hoy. */
const HABIT_PARAM = 'habito';

/**
 * Estado del asistente de habitos: cerrado, creando (quiza desde una
 * plantilla) o editando uno concreto. Es un union porque se excluyen.
 */
type HabitEditor =
  | null
  | { mode: 'create'; template: HabitTemplate | null }
  | { mode: 'edit'; habit: KaizenHabit };

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error';
}

function habitIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get(HABIT_PARAM);
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Kaizen Habits. Dos vistas en la misma ruta: "hoy" (que me falta y marcarlo
 * de un toque) y el detalle de un habito (su sistema, su cadena y su camino).
 * El detalle vive en la URL para que el boton atras del movil vuelva a hoy.
 */
export function Habits() {
  const habits = useKaizenHabits();
  const activeHabits = useMemo(
    () => (habits.data ?? []).filter((habit) => habit.active).sort(byHabitTime),
    [habits.data],
  );
  const pausedHabits = useMemo(
    () => (habits.data ?? []).filter((habit) => !habit.active).sort(byHabitTime),
    [habits.data],
  );
  const day = useHabitsToday(activeHabits);

  const [openHabitId, setOpenHabitId] = useState<string | null>(habitIdFromUrl);
  const openHabit = useMemo(
    () => habits.data?.find((habit) => habit.id === openHabitId) ?? null,
    [habits.data, openHabitId],
  );
  // El dia contable depende de la zona horaria del habito, no del navegador.
  const today = todayKey(openHabit?.timezone);
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(todayKey()));
  const tracking = useKaizenHabitTracking(openHabit?.id ?? null, visibleMonth);

  const [editor, setEditor] = useState<HabitEditor>(null);
  const [savingHabitId, setSavingHabitId] = useState<string | null>(null);
  const [dayDialog, setDayDialog] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState('');
  const [habitToDelete, setHabitToDelete] = useState<KaizenHabit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Atras / adelante del navegador mueven entre hoy y el detalle.
  useEffect(() => {
    function onPopState() {
      setOpenHabitId(habitIdFromUrl());
      setDayDialog(null);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Un id de la URL que no es de ningun habito (borrado, enlace viejo) cae en hoy.
  useEffect(() => {
    if (!openHabitId || !habits.data || openHabit) return;
    window.history.replaceState(null, '', '/habits');
    setOpenHabitId(null);
  }, [openHabitId, habits.data, openHabit]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function notify(message: string, tone: Toast['tone'] = 'success') {
    setToast({ id: Date.now(), message, tone });
  }

  function showHabit(habit: KaizenHabit) {
    window.history.pushState({ habitId: habit.id }, '', `/habits?${HABIT_PARAM}=${encodeURIComponent(habit.id)}`);
    setOpenHabitId(habit.id);
    setVisibleMonth(monthStart(todayKey(habit.timezone)));
    window.scrollTo({ top: 0 });
  }

  function showToday() {
    setOpenHabitId(null);
    // Si el detalle se abrio desde hoy, volver es "atras": asi el boton del
    // movil y el de la pantalla hacen lo mismo y el historial no crece.
    if ((window.history.state as { habitId?: string } | null)?.habitId) {
      window.history.back();
      return;
    }
    window.history.replaceState(null, '', '/habits');
    window.scrollTo({ top: 0 });
  }

  async function refresh(habit: KaizenHabit) {
    if (openHabit?.id === habit.id) tracking.reload();
    if (habit.active) await day.reloadHabit(habit).catch(() => day.reload());
  }

  /**
   * Registra la repeticion de un dia. Un 409 (ese dia ya tenia repeticion) no
   * es un error para el usuario: se refresca y listo. Los demas errores se
   * relanzan para que quien llamo los muestre donde corresponde.
   */
  async function registerRepetition(
    habit: KaizenHabit,
    dayKey: string,
    input: { isMinimum: boolean; description: string },
    origin: HTMLElement | null,
  ) {
    const isToday = dayKey === todayKey(habit.timezone);
    const completesDay =
      isToday &&
      habit.active &&
      activeHabits.every((other) => other.id === habit.id || day.entries[other.id]?.today.hasRepetition);

    setSavingHabitId(habit.id);
    try {
      await registerKaizenHabitRepetition(habit.id, { occurredOn: dayKey, ...input });
      celebrate(origin, completesDay);
      notify(
        completesDay
          ? '¡Día completo! Hoy fuiste la persona que quieres ser.'
          : !isToday
            ? `Registrado el ${formatDayMonth(dayKey)}.`
            : input.isMinimum
              ? 'Versión mínima hecha. La cadena sigue viva.'
              : `+1 voto por «${habit.identity || habit.name}».`,
      );
      await refresh(habit);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 409) {
        notify('Ese día ya tenía una repetición registrada.');
        await refresh(habit);
        return;
      }
      throw requestError;
    } finally {
      setSavingHabitId(null);
    }
  }

  function registerToday(habit: KaizenHabit, isMinimum: boolean, origin: HTMLElement) {
    registerRepetition(habit, todayKey(habit.timezone), { isMinimum, description: '' }, origin).catch(
      (requestError: unknown) => notify(messageOf(requestError, 'No fue posible registrar la repetición.'), 'error'),
    );
  }

  async function registerFromDialog(input: { isMinimum: boolean; description: string }) {
    if (!openHabit || !dayDialog) return;
    setDialogError('');
    try {
      await registerRepetition(openHabit, dayDialog, input, null);
      setDayDialog(null);
    } catch (requestError) {
      setDialogError(messageOf(requestError, 'No fue posible registrar la repetición.'));
    }
  }

  async function confirmDelete() {
    if (!habitToDelete) return;

    setDeleting(true);
    try {
      await deleteKaizenHabit(habitToDelete.id);
      habits.remove(habitToDelete.id);
      setHabitToDelete(null);
      notify(`Eliminaste «${habitToDelete.name}» y su historial.`);
      showToday();
      habits.reload();
    } catch (requestError) {
      setHabitToDelete(null);
      notify(messageOf(requestError, 'No fue posible eliminar el hábito.'), 'error');
    } finally {
      setDeleting(false);
    }
  }

  // El registro de hoy sale de la vista de hoy; un habito en pausa no esta en
  // ella y se lee del calendario, si el mes visible es el actual.
  const viewingCurrentMonth = visibleMonth === monthStart(today);
  const todayEntry = openHabit
    ? (day.entries[openHabit.id]?.today ??
      (viewingCurrentMonth ? tracking.calendar?.days.find((entry) => entry.date === today) : undefined))
    : undefined;
  const dialogEntry =
    dayDialog === today ? todayEntry : tracking.calendar?.days.find((entry) => entry.date === dayDialog);

  return (
    <div className="habits-theme flex min-h-screen w-full flex-col">
      <HabitsHeader />

      <main
        className={cn(
          'mx-auto w-full flex-1 px-4 pt-6 pb-28 sm:px-6 sm:pt-10',
          openHabit ? 'max-w-4xl' : 'max-w-2xl',
        )}
      >
        {habits.loading && !habits.data && (
          <div className="grid gap-4" aria-busy="true" aria-label="Cargando tus hábitos">
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        )}

        {!habits.data && habits.error && (
          <div className="flex justify-center">
            <ErrorMessage title="No pudimos cargar tus hábitos" message={habits.error} onRetry={habits.reload} />
          </div>
        )}

        {habits.data &&
          (openHabit ? (
            <HabitDetail
              habit={openHabit}
              today={today}
              todayEntry={todayEntry}
              calendar={tracking.calendar}
              stats={tracking.stats}
              loading={tracking.loading}
              error={tracking.error}
              onRetry={tracking.reload}
              visibleMonth={visibleMonth}
              onMonthChange={(delta) => setVisibleMonth((current) => shiftMonth(current, delta))}
              saving={savingHabitId === openHabit.id}
              onBack={showToday}
              onEdit={() => setEditor({ mode: 'edit', habit: openHabit })}
              onDelete={() => setHabitToDelete(openHabit)}
              onRegisterToday={(isMinimum, origin) => registerToday(openHabit, isMinimum, origin)}
              onOpenDay={(dayKey) => {
                setDialogError('');
                setDayDialog(dayKey);
              }}
              onGoalCreated={() => {
                notify('Meta creada. Cada repetición suma a tu avance.');
                tracking.reload();
              }}
            />
          ) : (
            <HabitsToday
              habits={activeHabits}
              paused={pausedHabits}
              entries={day.entries}
              error={day.error}
              onRetry={day.reload}
              savingHabitId={savingHabitId}
              onOpen={showHabit}
              onRegister={registerToday}
              onCreate={(template) => setEditor({ mode: 'create', template: template ?? null })}
            />
          ))}
      </main>

      {editor && (
        <HabitWizard
          existing={editor.mode === 'edit' ? editor.habit : null}
          template={editor.mode === 'create' ? editor.template : null}
          onClose={() => setEditor(null)}
          onSaved={(saved) => {
            const created = editor.mode === 'create';
            setEditor(null);
            habits.reload();
            if (!created && openHabit?.id === saved.id) tracking.reload();
            notify(
              created
                ? `«${saved.name}» ya está en tu día. Tu primera repetición te espera.`
                : 'Cambios guardados. Tu historial sigue intacto.',
            );
          }}
        />
      )}

      {openHabit && dayDialog && (
        <HabitRepetitionDialog
          habitName={openHabit.name}
          minimumAction={openHabit.minimumAction2min}
          dayKey={dayDialog}
          existing={dialogEntry}
          saving={savingHabitId === openHabit.id}
          error={dialogError}
          onClose={() => {
            setDayDialog(null);
            setDialogError('');
          }}
          onConfirm={registerFromDialog}
        />
      )}

      <ConfirmDeleteDialog
        open={habitToDelete !== null}
        itemName={habitToDelete?.name ?? ''}
        itemType="hábito"
        isDeleting={deleting}
        onCancel={() => setHabitToDelete(null)}
        onConfirm={confirmDelete}
      />

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {toast && (
          <p
            key={toast.id}
            className={cn(
              'max-w-md animate-in rounded-2xl px-4 py-3 text-center text-sm font-medium shadow-lg duration-300 fade-in slide-in-from-bottom-4',
              toast.tone === 'error' ? 'bg-destructive text-white' : 'bg-[#1b2532] text-[#f4efe4]',
            )}
          >
            {toast.message}
          </p>
        )}
      </div>
    </div>
  );
}

/** El refuerzo de marcar: vibracion corta y confeti desde el boton tocado. */
function celebrate(origin: HTMLElement | null, completesDay: boolean) {
  navigator.vibrate?.(completesDay ? [20, 60, 30] : 15);

  if (origin) {
    const rect = origin.getBoundingClientRect();
    burst({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      count: 28,
      speed: 8,
      spread: Math.PI * 1.2,
      embers: 0.1,
      colors: HABIT_COLORS,
    });
  }
  if (completesDay) cannons(70, HABIT_COLORS);
}
