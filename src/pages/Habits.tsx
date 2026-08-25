import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Hammer, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { registerKaizenHabit } from '../services/kaizenHabits';

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
  const [isForging, setIsForging] = useState(false);
  const [habit, setHabit] = useState<HabitForm>(initialHabit);
  const [saved, setSaved] = useState(false);
  const [forgeAnimation, setForgeAnimation] = useState(false);
  const [error, setError] = useState('');

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setHabit((current) => ({ ...current, [name]: value }));
    setSaved(false);
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setError('');
    setForgeAnimation(true);

    try {
      await registerKaizenHabit({
        name: habit.name,
        description: habit.description,
        identity: habit.identity,
        frequency: habit.frequency,
        active: habit.active,
      });
      setSaved(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No fue posible crear el hábito.',
      );
    } finally {
      setForgeAnimation(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 sm:px-6">
      <header className="flex min-h-20 items-center justify-between border-b">
        <a className="text-lg font-bold tracking-tight text-foreground no-underline" href="/">Kaizen</a>
        <Button type="button" variant="outline" size="sm" className="text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive" onClick={signOut}>
          <LogOut aria-hidden="true" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </Button>
      </header>

      <main className="flex-1 py-12 sm:py-16">
        <section className="mx-auto max-w-3xl" aria-labelledby="habits-title">
          <div className="text-center">
            <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-accent text-primary"><Sparkles aria-hidden="true" className="size-7" /></div>
            <p className="mb-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase">Construye tu identidad</p>
            <h1 id="habits-title" className="font-heading text-4xl font-bold tracking-[-0.055em] text-foreground sm:text-5xl">Kaizen Habits</h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">Diseña pequeños hábitos que te acerquen cada día a la persona que quieres ser.</p>
            {!isForging && <Button type="button" size="lg" className="mt-8" onClick={() => setIsForging(true)}><Hammer aria-hidden="true" />Forjar</Button>}
          </div>

          {isForging && (
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
                    {saved && <p className="rounded-lg bg-accent px-3 py-2 text-sm text-primary">Hábito creado correctamente.</p>}
                    {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button type="button" variant="ghost" onClick={() => setIsForging(false)}>Cancelar</Button>
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
          )}
        </section>
      </main>
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
          <p className="text-xs font-bold tracking-[0.1em] text-primary uppercase">{habit.frequency === 'daily' ? 'Cada día' : habit.frequency}</p>
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
