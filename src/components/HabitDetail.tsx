import type { ReactNode } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Gift,
  MapPin,
  NotebookPen,
  Pause,
  Pencil,
  Sparkles,
  Timer,
  Trash2,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ErrorMessage } from './ErrorMessage';
import { HabitBushidoPath } from './HabitBushidoPath';
import { HabitCalendar } from './HabitCalendar';
import { HabitGoalCard } from './HabitGoalCard';
import { HabitStats } from './HabitStats';
import { habitEmoji } from '../lib/habitTemplates';
import type { KaizenHabit, KaizenHabitCalendar, KaizenHabitCalendarDay, KaizenHabitStats } from '../types/kaizenHabit';

interface HabitDetailProps {
  habit: KaizenHabit;
  /** Dia contable de hoy en la zona del habito. */
  today: string;
  /** Registro de hoy; undefined mientras no se sabe. */
  todayEntry: KaizenHabitCalendarDay | undefined;
  calendar: KaizenHabitCalendar | null;
  stats: KaizenHabitStats | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  visibleMonth: string;
  onMonthChange: (delta: number) => void;
  saving: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRegisterToday: (isMinimum: boolean, origin: HTMLElement) => void;
  /** Abre el registro de un dia: hoy con nota, o un dia pasado del calendario. */
  onOpenDay: (dayKey: string) => void;
  onGoalCreated: () => void;
}

/**
 * Un habito por dentro: quien quieres ser, que hiciste hoy, el sistema que lo
 * hace facil (las cuatro leyes) y como va la cadena.
 */
export function HabitDetail({
  habit,
  today,
  todayEntry,
  calendar,
  stats,
  loading,
  error,
  onRetry,
  visibleMonth,
  onMonthChange,
  saving,
  onBack,
  onEdit,
  onDelete,
  onRegisterToday,
  onOpenDay,
  onGoalCreated,
}: HabitDetailProps) {
  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" className="-ml-2.5" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Hoy
        </Button>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={onEdit}>
            <Pencil aria-hidden="true" />
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Eliminar</span>
          </Button>
        </div>
      </div>

      <section
        aria-labelledby="habit-detail-title"
        className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7"
      >
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-2xl bg-muted text-4xl">
            {habitEmoji(habit)}
          </span>
          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase">
              {habit.active ? 'Tu hábito' : 'En pausa'}
            </p>
            <h1 id="habit-detail-title" className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {habit.name}
            </h1>
            {habit.identity && (
              <p className="mt-1.5 text-base text-foreground/80">
                <span className="text-muted-foreground">Cada repetición confirma: </span>
                <strong className="font-semibold text-foreground">{habit.identity}</strong>
              </p>
            )}
          </div>
        </div>

        {!habit.active && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
            <Pause aria-hidden="true" className="size-4 shrink-0" />
            No aparece en tu día. Edítalo y actívalo cuando quieras retomarlo.
          </p>
        )}

        <TodayAction
          entry={todayEntry}
          minimumAction={habit.minimumAction2min}
          saving={saving}
          onRegister={onRegisterToday}
          onOpenToday={() => onOpenDay(today)}
        />
      </section>

      {error ? (
        <ErrorMessage title="No pudimos cargar el seguimiento" message={error} onRetry={onRetry} />
      ) : (
        <HabitStats stats={stats} loading={loading && !stats} />
      )}

      <HabitPlan habit={habit} onEdit={onEdit} />

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="size-4 text-primary" />
              Tu cadena
            </CardTitle>
            <CardDescription>¿Se te pasó registrar un día? Tócalo y regístralo.</CardDescription>
          </CardHeader>
          <CardContent>
            <HabitCalendar
              visibleMonth={visibleMonth}
              today={today}
              days={calendar?.days ?? []}
              loading={loading && !calendar}
              onMonthChange={onMonthChange}
              onSelectDay={onOpenDay}
            />
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <HabitGoalCard
            habitId={habit.id}
            activeGoal={stats?.activeGoal ?? null}
            today={today}
            disabled={loading}
            onCreated={onGoalCreated}
          />
          <HabitBushidoPath stats={stats} loading={loading && !stats} />
        </div>
      </div>
    </div>
  );
}

function TodayAction({
  entry,
  minimumAction,
  saving,
  onRegister,
  onOpenToday,
}: {
  entry: KaizenHabitCalendarDay | undefined;
  minimumAction: string;
  saving: boolean;
  onRegister: (isMinimum: boolean, origin: HTMLElement) => void;
  onOpenToday: () => void;
}) {
  if (!entry) {
    return <Skeleton className="mt-5 h-12 rounded-xl" />;
  }

  if (entry.hasRepetition) {
    return (
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-accent px-4 py-3">
        <p className="flex items-center gap-2.5 text-sm font-medium text-foreground">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check aria-hidden="true" className="size-4" strokeWidth={3} />
          </span>
          {entry.isMinimum ? 'Hoy hiciste la versión mínima. La cadena sigue viva.' : 'Hoy ya lo hiciste. Cadena intacta.'}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onOpenToday}>
          Ver registro
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
      <Button
        type="button"
        size="lg"
        disabled={saving}
        onClick={(event) => onRegister(false, event.currentTarget)}
      >
        <Check aria-hidden="true" strokeWidth={3} />
        {saving ? 'Registrando…' : 'Lo hice hoy'}
      </Button>
      <Button
        type="button"
        size="lg"
        variant="outline"
        disabled={saving}
        title={minimumAction || undefined}
        onClick={(event) => onRegister(true, event.currentTarget)}
      >
        <Timer aria-hidden="true" />
        Versión de 2 min
      </Button>
      <Button type="button" size="lg" variant="ghost" disabled={saving} onClick={onOpenToday}>
        <NotebookPen aria-hidden="true" />
        Con nota
      </Button>
    </div>
  );
}

/**
 * El sistema del habito con las cuatro leyes de Hábitos atómicos. Lo que falta
 * se dice como sugerencia, no como error: un habito con solo nombre funciona.
 */
function HabitPlan({ habit, onEdit }: { habit: KaizenHabit; onEdit: () => void }) {
  const when = [habit.cue, habit.time && `a las ${habit.time}`].filter(Boolean).join(', ');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-4 text-primary" />
          Tu sistema
        </CardTitle>
        <CardDescription>Lo que hace fácil repetirlo, con las cuatro leyes de Hábitos atómicos.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="m-0 grid gap-3">
          <PlanRow icon={MapPin} law="Hazlo obvio" label="Cuándo y dónde" onEdit={onEdit} empty="Ata el hábito a algo que ya haces: «Después de…».">
            {when || habit.location ? (
              <>
                {when}
                {habit.location && (
                  <>
                    {when ? ' · ' : ''}
                    en {habit.location}
                  </>
                )}
              </>
            ) : null}
          </PlanRow>
          <PlanRow icon={Sparkles} law="Hazlo atractivo" label="Lo disfruto así" onEdit={onEdit} empty="Júntalo con algo que te guste.">
            {habit.attractiveness || null}
          </PlanRow>
          <PlanRow icon={Zap} law="Hazlo fácil" label="Qué haré" onEdit={onEdit} empty="Describe la acción concreta.">
            {habit.action || null}
          </PlanRow>
          <PlanRow icon={Timer} law="Hazlo fácil" label="En un mal día" onEdit={onEdit} empty="Define la versión de 2 minutos.">
            {habit.minimumAction2min || null}
          </PlanRow>
          <PlanRow icon={Gift} law="Hazlo satisfactorio" label="Mi recompensa" onEdit={onEdit} empty="¿Cómo lo celebrarás al terminar?">
            {habit.reward || null}
          </PlanRow>
          {habit.description && (
            <PlanRow icon={NotebookPen} label="Notas" onEdit={onEdit} empty="">
              {habit.description}
            </PlanRow>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

function PlanRow({
  icon: Icon,
  law,
  label,
  empty,
  onEdit,
  children,
}: {
  icon: LucideIcon;
  law?: string;
  label: string;
  empty: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-muted/50 px-3.5 py-3">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <dt className="flex flex-wrap items-baseline gap-x-2 text-xs font-semibold text-muted-foreground">
          {label}
          {law && <span className="text-[0.65rem] font-medium tracking-[0.08em] text-primary/70 uppercase">{law}</span>}
        </dt>
        <dd className="m-0 mt-0.5 text-sm text-foreground">
          {children ?? (
            <button
              type="button"
              onClick={onEdit}
              className="text-left text-muted-foreground italic underline-offset-4 outline-none hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {empty}
            </button>
          )}
        </dd>
      </div>
    </div>
  );
}
