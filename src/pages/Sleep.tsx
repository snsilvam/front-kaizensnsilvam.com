import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { ErrorMessage } from '../components/ErrorMessage';
import { SleepLayout } from '../components/SleepLayout';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { useSleepToday } from '../hooks/useSleepToday';
import {
  formatRecordDate,
  formatSleepMinutes,
  formatTimeOfDay,
  isTimeOfDay,
  splitSleepMinutes,
  toSleepMinutes,
} from '../lib/sleep';
import type { SaveSleepInput, SleepRecord, SleepToday } from '../types/sleep';

/**
 * Modulo de sueno: /sleep. Un solo registro, el de hoy, con tres datos que
 * declara el usuario: a que hora se desperto, a que hora se acostara y cuanto
 * durmio la noche anterior. Ninguno se calcula de los otros.
 */
export function Sleep() {
  const { data, loading, error, reload, saving, saveError, save } = useSleepToday();

  return (
    <SleepLayout>
      <section aria-labelledby="sleep-title" className="grid gap-6">
        <header>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            {data ? formatRecordDate(data.date) : 'Hoy'}
          </p>
          <h1 id="sleep-title" className="mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground">
            Tu registro de sueño
          </h1>
          {data && (
            <p className="mt-2 text-sm text-muted-foreground">
              Hábito: <span className="font-medium text-foreground">{data.habit.name}</span>
            </p>
          )}
        </header>

        {loading && (
          <div className="grid gap-4" aria-busy="true" aria-label="Cargando tu registro de sueño">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        )}

        {!loading && error && (
          <ErrorMessage title="No pudimos cargar tu sueño" message={error} onRetry={reload} />
        )}

        {!loading && !error && data && (
          <>
            <SleepSummary record={data.record} />
            {/* Un día nuevo vacía el formulario. */}
            <SleepForm key={data.date} today={data} saving={saving} saveError={saveError} onSave={save} />
          </>
        )}
      </section>
    </SleepLayout>
  );
}

/** Lo guardado hoy, de un vistazo; o que todavia no hay nada. */
function SleepSummary({ record }: { record: SleepRecord | null }) {
  if (!record) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-dashed bg-card/60 px-5 py-5">
        <span aria-hidden="true" className="text-3xl">
          💤
        </span>
        <div>
          <p className="font-semibold text-foreground">Aún no registras hoy</p>
          <p className="text-sm text-muted-foreground">Anota cómo dormiste y a qué hora te acostarás.</p>
        </div>
      </div>
    );
  }

  return (
    <dl className="grid grid-cols-3 gap-2 rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border sm:gap-4 sm:p-5">
      <SummaryItem label="Dormiste" value={formatSleepMinutes(record.sleepMinutes)} />
      <SummaryItem label="Despertaste" value={formatTimeOfDay(record.wakeTime)} />
      <SummaryItem label="Te acostarás" value={formatTimeOfDay(record.bedTime)} />
    </dl>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-bold tracking-tight text-foreground tabular-nums sm:text-xl">{value}</dd>
    </div>
  );
}

interface SleepFormProps {
  today: SleepToday;
  saving: boolean;
  saveError: string | null;
  onSave: (input: SaveSleepInput) => Promise<boolean>;
}

/** Los tres datos del dia. Arranca con lo guardado hoy, si lo hay, para corregirlo. */
function SleepForm({ today, saving, saveError, onSave }: SleepFormProps) {
  const record = today.record;
  const initialDuration = record ? splitSleepMinutes(record.sleepMinutes) : { hours: '', minutes: '' };

  const [wakeTime, setWakeTime] = useState(record?.wakeTime ?? '');
  const [bedTime, setBedTime] = useState(record?.bedTime ?? '');
  const [hours, setHours] = useState(initialDuration.hours);
  const [minutes, setMinutes] = useState(initialDuration.minutes);
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);

  function edit<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setSaved(false);
      setFormError('');
    };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);

    if (!isTimeOfDay(wakeTime)) {
      setFormError('Elige la hora a la que te despertaste.');
      return;
    }
    if (!isTimeOfDay(bedTime)) {
      setFormError('Elige la hora a la que te vas a acostar.');
      return;
    }
    const sleepMinutes = toSleepMinutes(hours, minutes);
    if (typeof sleepMinutes === 'string') {
      setFormError(sleepMinutes);
      return;
    }
    setFormError('');

    if (await onSave({ wakeTime, bedTime, sleepMinutes })) setSaved(true);
  }

  const digits = (value: string) => value.replace(/\D/g, '').slice(0, 2);

  return (
    <form className="grid gap-5 rounded-2xl bg-card p-5 shadow-soft ring-1 ring-border sm:p-6" onSubmit={submit} noValidate>
      <div className="grid gap-2">
        <Label htmlFor="sleep-duration-hours">¿Cuánto dormiste anoche?</Label>
        <div className="grid grid-cols-2 gap-3">
          <DurationField
            id="sleep-duration-hours"
            suffix="h"
            label="Horas"
            value={hours}
            placeholder="5"
            onChange={edit((value: string) => setHours(digits(value)))}
          />
          <DurationField
            id="sleep-duration-minutes"
            suffix="min"
            label="Minutos"
            value={minutes}
            placeholder="38"
            onChange={edit((value: string) => setMinutes(digits(value)))}
          />
        </div>
        <p className="text-xs text-muted-foreground">Lo que diga tu reloj o tu registro.</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="sleep-wake-time">¿A qué hora te despertaste hoy?</Label>
        <Input
          id="sleep-wake-time"
          type="time"
          className="h-12 text-lg md:text-lg"
          value={wakeTime}
          onChange={(event) => edit(setWakeTime)(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="sleep-bed-time">¿A qué hora te vas a acostar hoy?</Label>
        <Input
          id="sleep-bed-time"
          type="time"
          className="h-12 text-lg md:text-lg"
          value={bedTime}
          onChange={(event) => edit(setBedTime)(event.target.value)}
          required
        />
      </div>

      {(formError || saveError) && (
        <Alert variant="destructive">
          <AlertDescription>{formError || saveError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="h-12 w-full" disabled={saving}>
        {saving ? 'Guardando...' : record ? 'Actualizar registro' : 'Guardar registro'}
      </Button>

      <p role="status" className="-mt-2 min-h-5 text-center text-sm font-medium text-success">
        {saved && (
          <span className="inline-flex items-center gap-1.5">
            <Check aria-hidden="true" className="size-4" />
            Registro de hoy guardado
          </span>
        )}
      </p>
    </form>
  );
}

interface DurationFieldProps {
  id: string;
  label: string;
  suffix: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

/** Un numero entero de dos digitos con su unidad al lado. */
function DurationField({ id, label, suffix, value, placeholder, onChange }: DurationFieldProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full min-w-0 rounded-lg border border-input bg-card pr-12 pl-4 text-lg font-semibold text-foreground tabular-nums shadow-xs outline-none placeholder:font-normal placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-muted-foreground"
      >
        {suffix}
      </span>
    </div>
  );
}
