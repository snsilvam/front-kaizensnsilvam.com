import { useEffect, useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';
import { SleepHistory } from './SleepHistory';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Skeleton } from './ui/skeleton';
import { useSleepToday } from '../hooks/useSleepToday';
import { formatRecordDate, isTimeOfDay, splitSleepMinutes, toSleepMinutes } from '../lib/sleep';
import type { SaveSleepInput, SleepToday } from '../types/sleep';

/**
 * Registro de sueno de hoy, en un modal que abre el boton 💤 de los headers de
 * Habitos y Winter Arc (SleepButton). Tres datos que declara el usuario: a que
 * hora se desperto, a que hora se acostara y cuanto durmio la noche anterior.
 * Ninguno se calcula de los otros. Arriba va el historial de higiene del sueno
 * (SleepHistory), que ya llega evaluado del backend.
 *
 * Se monta al abrirse, asi que cada apertura pide el dia al backend. Lleva la
 * noche del 💤 (`.sleep-theme`) en cualquier camino. Como MarketSheet, es una
 * hoja desde abajo en movil y un dialogo centrado en escritorio: se cierra con
 * Escape, con la X o tocando fuera, salvo mientras guarda.
 */
export function SleepDialog({ onClose }: { onClose: () => void }) {
  const { data, loading, error, reload, saving, saveError, save } = useSleepToday();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saving, onClose]);

  return (
    <div
      className="sleep-theme fixed inset-0 z-50 flex animate-in items-end justify-center bg-[#1e1b4b]/45 backdrop-blur-[2px] fade-in duration-150 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="max-h-[92dvh] w-full max-w-md animate-in overflow-y-auto overscroll-contain rounded-t-3xl border border-border bg-card px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-card-foreground shadow-2xl duration-200 slide-in-from-bottom-6 sm:rounded-2xl sm:p-6 sm:zoom-in-95 sm:slide-in-from-bottom-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sleep-dialog-title"
        aria-describedby="sleep-dialog-description"
      >
        <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border sm:hidden" />

        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e0e7ff] text-2xl shadow-md shadow-[#6366f1]/25"
          >
            💤
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-primary uppercase">
              {data ? formatRecordDate(data.date) : 'Hoy'}
            </p>
            <h2 id="sleep-dialog-title" className="mt-1 text-lg font-semibold text-foreground">
              Tu registro de sueño
            </h2>
            <p id="sleep-dialog-description" className="mt-0.5 text-sm text-muted-foreground">
              {data ? (
                <>
                  Hábito: <span className="font-medium text-foreground">{data.habit.name}</span>
                </>
              ) : (
                'Cómo dormiste y a qué hora te acuestas.'
              )}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="-mt-1 -mr-2 text-muted-foreground"
            aria-label="Cerrar"
            disabled={saving}
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-5">
          {loading && (
            <div className="grid gap-4" aria-busy="true" aria-label="Cargando tu registro de sueño">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          )}

          {!loading && error && (
            <ErrorMessage title="No pudimos cargar tu sueño" message={error} onRetry={reload} />
          )}

          {!loading && !error && data && (
            <div className="grid gap-5">
              {/* Guardar responde el historial ya con hoy: la tira se actualiza sola. */}
              <SleepHistory history={data.history} today={data.date} />
              {/* Un dia nuevo vacia el formulario. */}
              <SleepForm key={data.date} today={data} saving={saving} saveError={saveError} onSave={save} />
            </div>
          )}
        </div>
      </div>
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
    <form className="grid gap-5" onSubmit={submit} noValidate>
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
