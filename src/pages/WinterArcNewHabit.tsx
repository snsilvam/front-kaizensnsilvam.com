import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, Swords } from 'lucide-react';
import { WinterArcLayout } from '../components/WinterArcLayout';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useKaizenHabits } from '../hooks/useKaizenHabits';
import { browserTimezone } from '../lib/habitDates';
import { registerKaizenHabit } from '../services/kaizenHabits';
import { WINTER_ARC_MIN_RULES } from '../types/winterArc';

interface RuleForm {
  name: string;
  action: string;
  minimumAction2min: string;
  cue: string;
  time: string;
  location: string;
}

const emptyRule: RuleForm = {
  name: '',
  action: '',
  minimumAction2min: '',
  cue: '',
  time: '',
  location: '',
};

/**
 * Crear un habito sin salir del Winter Arc: /winter-arc/nuevo-habito.
 *
 * Escribe en la misma tabla que Kaizen Habits (POST /kaizen-habits), pero con
 * un formulario corto pensado como Regla Inquebrantable: que hacer cada dia y
 * el minimo que se cumple incluso en el peor dia. Se crea siempre activo,
 * porque el reto solo acepta habitos activos. Tras crear uno se queda aqui
 * para poder forjar varios seguidos hasta llegar al minimo del reto.
 */
export function WinterArcNewHabit() {
  const habits = useKaizenHabits();
  const [rule, setRule] = useState<RuleForm>(emptyRule);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState('');

  const activeCount = (habits.data ?? []).filter((habit) => habit.active).length;
  const readyForSetup = activeCount >= WINTER_ARC_MIN_RULES;

  function updateField(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setRule((current) => ({ ...current, [name]: value }));
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setCreated('');

    try {
      // Los campos de Kaizen Habits que este formulario no pide van vacios:
      // el backend solo exige el nombre y se pueden completar luego en Hábitos.
      const habit = await registerKaizenHabit({
        ...rule,
        description: '',
        identity: '',
        attractiveness: '',
        reward: '',
        timezone: browserTimezone(),
        active: true,
      });
      setRule(emptyRule);
      setCreated(habit.name);
      habits.reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible crear el hábito.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WinterArcLayout>
      <section className="mx-auto grid w-full max-w-md gap-4" aria-labelledby="winter-arc-new-habit-title">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit text-muted-foreground"
          onClick={goToSetup}
        >
          <ArrowLeft aria-hidden="true" />
          Volver a mi código
        </Button>

        <Card>
          <CardHeader>
            <CardTitle id="winter-arc-new-habit-title" className="text-2xl font-bold tracking-[-0.04em]">
              Nueva Regla Inquebrantable
            </CardTitle>
            <CardDescription>
              Un hábito que el samurái cumplirá cada día durante 90 días, quiera o no el cuerpo. Define también el
              mínimo que harás incluso en el peor día: también cuenta.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="grid gap-5" onSubmit={submit}>
              <fieldset className="grid gap-4" disabled={submitting}>
                <legend className="sr-only">Hábito</legend>
                <Field label="Nombre" name="name" value={rule.name} onChange={updateField} required placeholder="Ej. Entrenar 30 minutos" />
                <Field label="Acción diaria" name="action" value={rule.action} onChange={updateField} required placeholder="¿Qué harás cada día?" />
                <Field label="Mínimo innegociable (2 min)" name="minimumAction2min" value={rule.minimumAction2min} onChange={updateField} required placeholder="Ej. 10 flexiones" />
                <Field label="Señal" name="cue" value={rule.cue} onChange={updateField} placeholder="Después de..." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Hora del día" name="time" type="time" value={rule.time} onChange={updateField} required />
                  <Field label="Lugar" name="location" value={rule.location} onChange={updateField} placeholder="Ej. Habitación" />
                </div>
              </fieldset>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {created && (
                <Alert>
                  <Swords aria-hidden="true" />
                  <AlertDescription>{`"${created}" está forjado: ya puede entrar en tu código.`}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? 'Forjando...' : 'Forjar hábito'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!habits.loading && !habits.error && (
          <div className="grid gap-3 rounded-xl border px-4 py-3.5 text-sm" aria-live="polite">
            <p className="text-muted-foreground">
              {readyForSetup
                ? `Tienes ${activeCount} hábitos activos: ya puedes jurar tu código.`
                : `Tienes ${activeCount} de ${WINTER_ARC_MIN_RULES} hábitos activos que necesita el código del samurái.`}
            </p>
            {readyForSetup && (
              <Button type="button" variant="outline" className="w-fit" onClick={goToSetup}>
                Elegir mi código
              </Button>
            )}
          </div>
        )}
      </section>
    </WinterArcLayout>
  );
}

function goToSetup() {
  window.location.href = '/winter-arc/setup';
}

interface FieldProps {
  label: string;
  name: keyof RuleForm;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function Field({ label, name, value, onChange, type = 'text', placeholder, required }: FieldProps) {
  const id = `winter-arc-habit-${name}`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} />
    </div>
  );
}
