import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { CalendarDays, CheckCheck, Hammer, LogOut, Plus, Sparkles, Timer, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { ErrorMessage } from '../components/ErrorMessage';
import { HabitCalendar } from '../components/HabitCalendar';
import { HabitGoalCard } from '../components/HabitGoalCard';
import { HabitList, frequencyLabel } from '../components/HabitList';
import { HabitRepetitionDialog } from '../components/HabitRepetitionDialog';
import { HabitStats } from '../components/HabitStats';
import { ModeSwitch } from '../components/ModeSwitch';
import { useKaizenHabitTracking } from '../hooks/useKaizenHabitTracking';
import { useKaizenHabits } from '../hooks/useKaizenHabits';
import { browserTimezone, monthStart, shiftMonth, todayKey } from '../lib/habitDates';
import { ApiError } from '../services/api';
import {
  deleteKaizenHabit,
  registerKaizenHabit,
  registerKaizenHabitRepetition,
} from '../services/kaizenHabits';
import type { KaizenHabit } from '../types/kaizenHabit';

interface HabitForm {
  name: string;
  description: string;
  identity: string;
  cue: string;
  attractiveness: string;
  action: string;
  minimumAction2min: string;
  reward: string;
  frequency: string;
  time: string;
  location: string;
  active: boolean;
}

const initialHabit: HabitForm = {
  name: 'Leer 10 páginas',
  description: 'Leer antes de dormir',
  identity: 'Soy una persona que lee',
  cue: 'Después de cepillarme los dientes',
  attractiveness: '',
  action: 'Abrir el libro y leer',
  minimumAction2min: 'Leer una página',
  reward: '',
  frequency: 'daily',
  time: '21:30',
  location: 'Habitación',
  active: true,
};

export function Habits() {
  const { signOut } = useAuth();
  const habits = useKaizenHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isForging, setIsForging] = useState(false);

  const selectedHabit = useMemo(
    () => habits.data?.find((habit) => habit.id === selectedHabitId) ?? null,
    [habits.data, selectedHabitId],
  );

  // El dia contable depende de la zona horaria del habito, no del navegador.
  const today = todayKey(selectedHabit?.timezone);

  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(todayKey()));
  const tracking = useKaizenHabitTracking(selectedHabitId, visibleMonth);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [savingRepetition, setSavingRepetition] = useState(false);
  const [repetitionError, setRepetitionError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [habitToDelete, setHabitToDelete] = useState<KaizenHabit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Al abrir la pagina se selecciona el primer habito para no dejar el panel vacio.
  useEffect(() => {
    if (selectedHabitId || !habits.data || habits.data.length === 0) return;
    setSelectedHabitId(habits.data[0].id);
  }, [habits.data, selectedHabitId]);

  function selectHabit(habit: KaizenHabit) {
    setSelectedHabitId(habit.id);
    setVisibleMonth(monthStart(todayKey(habit.timezone)));
    setFeedback('');
    setRepetitionError('');
  }

  const days = tracking.calendar?.days ?? [];
  // El calendario cargado es el del mes visible: solo ese mes conoce el estado de hoy.
  const viewingCurrentMonth = visibleMonth === monthStart(today);
  const todayEntry = viewingCurrentMonth ? days.find((day) => day.date === today) : undefined;
  const selectedDayEntry = selectedDay ? days.find((day) => day.date === selectedDay) : undefined;

  async function saveRepetition(dayKey: string, input: { isMinimum: boolean; description: string }) {
    if (!selectedHabitId) return;

    setSavingRepetition(true);
    setRepetitionError('');

    try {
      await registerKaizenHabitRepetition(selectedHabitId, {
        occurredOn: dayKey,
        isMinimum: input.isMinimum,
        description: input.description,
      });
      setSelectedDay(null);
      setFeedback(
        input.isMinimum
          ? 'Repetición mínima registrada. Lo importante es no romper la cadena.'
          : 'Repetición registrada. Un día más construyendo tu identidad.',
      );
      tracking.reload();
    } catch (requestError) {
      // 409: ese dia ya tenia repeticion (solo se permite una por dia).
      if (requestError instanceof ApiError && requestError.status === 409) {
        setSelectedDay(null);
        setRepetitionError('');
        setFeedback('Ese día ya tenía una repetición registrada.');
        tracking.reload();
        return;
      }
      setRepetitionError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible registrar la repetición.',
      );
    } finally {
      setSavingRepetition(false);
    }
  }

  async function confirmDelete() {
    if (!habitToDelete) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await deleteKaizenHabit(habitToDelete.id);
      // La seleccion pasa al siguiente habito de la lista ya sin el borrado; el
      // reload posterior solo confirma contra el backend.
      const remaining = (habits.data ?? []).filter((habit) => habit.id !== habitToDelete.id);
      habits.remove(habitToDelete.id);
      setSelectedHabitId(remaining[0]?.id ?? null);
      setHabitToDelete(null);
      setFeedback(`Eliminaste "${habitToDelete.name}" y su historial.`);
      habits.reload();
    } catch (requestError) {
      setHabitToDelete(null);
      setDeleteError(
        requestError instanceof Error ? requestError.message : 'No fue posible eliminar el hábito.',
      );
    } finally {
      setDeleting(false);
    }
  }

  function openDay(dayKey: string) {
    setRepetitionError('');
    setFeedback('');
    setSelectedDay(dayKey);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6">
      <header className="flex min-h-20 items-center justify-between border-b">
        <a className="text-lg font-bold tracking-tight text-foreground no-underline" href="/">Kaizen</a>
        <div className="flex items-center gap-2">
          <ModeSwitch currentPath="/habits" />
          <Button type="button" variant="outline" size="sm" className="text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive" onClick={signOut}>
            <LogOut aria-hidden="true" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-10 sm:py-14">
        <section aria-labelledby="habits-title">
          <div className="text-center">
            <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-accent text-primary"><Sparkles aria-hidden="true" className="size-7" /></div>
            <p className="mb-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase">Construye tu identidad</p>
            <h1 id="habits-title" className="font-heading text-4xl font-bold tracking-[-0.055em] text-foreground sm:text-5xl">Kaizen Habits</h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">Diseña pequeños hábitos que te acerquen cada día a la persona que quieres ser.</p>
          </div>

          {habits.loading && (
            <div className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          )}

          {!habits.loading && habits.error && (
            <div className="mt-10 flex justify-center">
              <ErrorMessage
                title="No pudimos cargar tus hábitos"
                message={habits.error}
                onRetry={habits.reload}
              />
            </div>
          )}

          {!habits.loading && !habits.error && (
            <>
              {!isForging && (
                <div className="mt-8 flex justify-center">
                  <Button type="button" size="lg" onClick={() => setIsForging(true)}>
                    <Hammer aria-hidden="true" />
                    {habits.data && habits.data.length > 0 ? 'Forjar otro hábito' : 'Forjar'}
                  </Button>
                </div>
              )}

              {isForging && (
                <ForgeHabit
                  onCancel={() => setIsForging(false)}
                  onCreated={(habit) => {
                    setIsForging(false);
                    habits.reload();
                    setSelectedHabitId(habit.id);
                    setVisibleMonth(monthStart(todayKey(habit.timezone)));
                    setFeedback('Hábito creado. Registra tu primera repetición cuando lo cumplas.');
                  }}
                />
              )}

              <div className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
                <Card>
                  <CardHeader>
                    <CardTitle>Tus hábitos</CardTitle>
                    <CardDescription>Elige uno para registrar repeticiones y ver su racha.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HabitList
                      habits={habits.data ?? []}
                      selectedId={selectedHabitId}
                      onSelect={selectHabit}
                    />
                  </CardContent>
                </Card>

                {selectedHabit ? (
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{selectedHabit.name}</CardTitle>
                        <CardDescription>
                          {frequencyLabel(selectedHabit.frequency)} · {selectedHabit.time || '--:--'}
                          {selectedHabit.location ? ` · ${selectedHabit.location}` : ''}
                        </CardDescription>
                        <CardAction>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              setDeleteError('');
                              setHabitToDelete(selectedHabit);
                            }}
                          >
                            <Trash2 aria-hidden="true" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </Button>
                        </CardAction>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        {deleteError && (
                          <Alert variant="destructive">
                            <AlertDescription>{deleteError}</AlertDescription>
                          </Alert>
                        )}

                        <div className="rounded-xl border border-primary/15 bg-accent/60 px-4 py-3.5">
                          <p className="text-xs font-bold tracking-[0.08em] text-primary uppercase">Hoy</p>
                          <p className="mt-1.5 text-sm text-foreground">
                            {!viewingCurrentMonth
                              ? 'Estás revisando otro mes del calendario.'
                              : todayEntry?.hasRepetition
                                ? todayEntry.isMinimum
                                  ? 'Registraste la versión mínima. Cuenta para tu racha.'
                                  : 'Repetición completa registrada. Cadena intacta.'
                                : `Después de ${selectedHabit.cue || 'tu señal'}, ${selectedHabit.action || 'haz el hábito'}.`}
                          </p>
                          <div className="mt-3.5 flex flex-wrap gap-2">
                            {viewingCurrentMonth ? (
                              <>
                                <Button type="button" onClick={() => openDay(today)} disabled={savingRepetition || tracking.loading}>
                                  <CheckCheck aria-hidden="true" />
                                  {todayEntry?.hasRepetition ? 'Ver registro de hoy' : 'Registrar hoy'}
                                </Button>
                                {!todayEntry?.hasRepetition && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={savingRepetition || tracking.loading}
                                    onClick={() => void saveRepetition(today, { isMinimum: true, description: '' })}
                                  >
                                    <Timer aria-hidden="true" />
                                    Solo la mínima
                                  </Button>
                                )}
                              </>
                            ) : (
                              <Button type="button" variant="outline" onClick={() => setVisibleMonth(monthStart(today))}>
                                <CalendarDays aria-hidden="true" />
                                Volver a hoy
                              </Button>
                            )}
                          </div>
                          {feedback && <p className="mt-3 text-sm text-primary">{feedback}</p>}
                          {repetitionError && !selectedDay && (
                            <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                              {repetitionError}
                            </p>
                          )}
                        </div>

                        <HabitStats stats={tracking.stats} loading={tracking.loading} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Calendario de repeticiones</CardTitle>
                        <CardDescription>Toca cualquier día pasado para registrar la repetición que se te quedó pendiente.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {tracking.error ? (
                          <ErrorMessage
                            title="No pudimos cargar el calendario"
                            message={tracking.error}
                            onRetry={tracking.reload}
                          />
                        ) : (
                          <HabitCalendar
                            visibleMonth={visibleMonth}
                            today={today}
                            days={days}
                            loading={tracking.loading}
                            onMonthChange={(delta) => setVisibleMonth((current) => shiftMonth(current, delta))}
                            onSelectDay={openDay}
                          />
                        )}
                      </CardContent>
                    </Card>

                    <HabitGoalCard
                      habitId={selectedHabit.id}
                      activeGoal={tracking.stats?.activeGoal ?? null}
                      today={today}
                      disabled={tracking.loading}
                      onCreated={() => {
                        setFeedback('Meta creada. Cada repetición suma a tu avance.');
                        tracking.reload();
                      }}
                    />
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Sin hábito seleccionado</CardTitle>
                      <CardDescription>Forja tu primer hábito para empezar a registrar repeticiones, rachas y metas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button type="button" variant="outline" onClick={() => setIsForging(true)}>
                        <Plus aria-hidden="true" />
                        Forjar hábito
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {selectedHabit && selectedDay && (
        <HabitRepetitionDialog
          habitName={selectedHabit.name}
          minimumAction={selectedHabit.minimumAction2min}
          dayKey={selectedDay}
          existing={selectedDayEntry}
          saving={savingRepetition}
          error={repetitionError}
          onClose={() => {
            setSelectedDay(null);
            setRepetitionError('');
          }}
          onConfirm={(input) => saveRepetition(selectedDay, input)}
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
    </div>
  );
}

interface ForgeHabitProps {
  onCancel: () => void;
  onCreated: (habit: KaizenHabit) => void;
}

/** Formulario de creacion; al guardar devuelve el habito para seleccionarlo. */
function ForgeHabit({ onCancel, onCreated }: ForgeHabitProps) {
  const [habit, setHabit] = useState<HabitForm>(initialHabit);
  const [forgeAnimation, setForgeAnimation] = useState(false);
  const [error, setError] = useState('');

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setHabit((current) => ({ ...current, [name]: value }));
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setForgeAnimation(true);

    try {
      // La zona horaria define el dia contable de cada repeticion.
      const created = await registerKaizenHabit({
        name: habit.name,
        description: habit.description,
        identity: habit.identity,
        cue: habit.cue,
        attractiveness: habit.attractiveness,
        action: habit.action,
        minimumAction2min: habit.minimumAction2min,
        reward: habit.reward,
        frequency: habit.frequency,
        time: habit.time,
        location: habit.location,
        timezone: browserTimezone(),
        active: habit.active,
      });
      onCreated(created);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No fue posible crear el hábito.',
      );
    } finally {
      setForgeAnimation(false);
    }
  }

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle>Forja un nuevo hábito</CardTitle>
          <CardDescription>Define la acción, el momento y el contexto que harán que tu hábito sea fácil de repetir.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre" name="name" value={habit.name} onChange={updateField} required placeholder="Ej. Leer 10 páginas" />
            <Field label="Identidad" name="identity" value={habit.identity} onChange={updateField} required placeholder="Soy una persona que..." />
            <TextField label="Descripción" name="description" value={habit.description} onChange={updateField} required placeholder="¿En qué consiste?" />
            <TextField label="Señal" name="cue" value={habit.cue} onChange={updateField} required placeholder="Después de..." />
            <TextField label="Hazlo atractivo" name="attractiveness" value={habit.attractiveness} onChange={updateField} placeholder="¿Cómo lo harás más atractivo?" />
            <TextField label="Acción" name="action" value={habit.action} onChange={updateField} required placeholder="La acción principal" />
            <TextField label="Acción mínima (2 min)" name="minimumAction2min" value={habit.minimumAction2min} onChange={updateField} required placeholder="La versión más pequeña" />
            <TextField label="Recompensa" name="reward" value={habit.reward} onChange={updateField} placeholder="¿Cómo te recompensarás?" />
            <div className="grid gap-2">
              <Label htmlFor="habit-frequency">Frecuencia</Label>
              <select id="habit-frequency" name="frequency" value={habit.frequency} onChange={updateField} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="daily">Diaria</option><option value="weekly">Semanal</option><option value="monthly">Mensual</option>
              </select>
            </div>
            <Field label="Hora" name="time" type="time" value={habit.time} onChange={updateField} required />
            <Field label="Lugar" name="location" value={habit.location} onChange={updateField} required placeholder="Ej. Habitación" />
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="active" checked={habit.active} onChange={(event) => setHabit((current) => ({ ...current, active: event.target.checked }))} className="size-4 accent-primary" />
            Hábito activo
          </label>
            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={forgeAnimation}>
              <Hammer aria-hidden="true" className={forgeAnimation ? 'animate-bounce' : undefined} />
              {forgeAnimation ? 'Forjando...' : 'Forjar hábito'}
            </Button>
          </div>
          </form>
        </CardContent>
      </Card>

      <HabitPreview habit={habit} forgeAnimation={forgeAnimation} />
    </div>
  );
}

function HabitPreview({ habit, forgeAnimation }: { habit: HabitForm; forgeAnimation: boolean }) {
  return (
    <Card className={`overflow-visible border-primary/20 bg-gradient-to-br from-card to-accent/60 transition-all duration-300 ${forgeAnimation ? 'scale-[1.02] shadow-lg shadow-primary/20' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Vista previa</CardTitle>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{habit.active ? 'Activo' : 'Pausado'}</span>
        </div>
        <CardDescription>Así se verá tu intención diaria.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden rounded-xl border border-primary/15 bg-background/80 p-4">
          {forgeAnimation && <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-primary" />}
          <p className="text-xs font-bold tracking-[0.1em] text-primary uppercase">{habit.frequency === 'daily' ? 'Cada día' : frequencyLabel(habit.frequency)}</p>
          <h2 className="mt-2 text-xl font-bold text-foreground">{habit.name || 'Tu nuevo hábito'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{habit.identity || 'La identidad que estás construyendo'}</p>

          <div className="mt-5 grid gap-3 text-sm">
            <PreviewRow label="Después de" value={habit.cue} />
            <PreviewRow label="Haré" value={habit.action} />
            <PreviewRow label="En" value={`${habit.location || 'un lugar elegido'} · ${habit.time || '--:--'}`} />
          </div>

          <div className="mt-5 rounded-lg bg-accent px-3 py-2.5 text-sm text-primary">
            Si tengo poco tiempo: <strong>{habit.minimumAction2min || 'una acción de 2 minutos'}</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value || '—'}</span>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function Field({ label, name, value, onChange, type = 'text', placeholder, required }: FieldProps) {
  return <div className="grid gap-2"><Label htmlFor={`habit-${name}`}>{label}</Label><Input id={`habit-${name}`} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} /></div>;
}

function TextField({ label, name, value, onChange, placeholder, required }: Omit<FieldProps, 'type' | 'onChange'> & { onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void }) {
  return <div className="grid gap-2"><Label htmlFor={`habit-${name}`}>{label}</Label><textarea id={`habit-${name}`} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={2} className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" /></div>;
}
