import { useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { Habit1Table } from '../components/Habit1Table';
import { useHabit1Records } from '../hooks/useHabit1Records';
import { registerHabit1 } from '../services/habit1';

export function RegisterHabit1() {
  const [numeroDeRepeticion, setNumeroDeRepeticion] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaDespertar, setHoraDespertar] = useState('');
  const [horaDormir, setHoraDormir] = useState('');
  const [horasDormidas, setHorasDormidas] = useState('');
  const [ritualNoche, setRitualNoche] = useState(false);
  const [ritualDia, setRitualDia] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const records = useHabit1Records();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const repeticion = Number(numeroDeRepeticion);
    if (!Number.isInteger(repeticion) || repeticion <= 0) {
      setError('Ingresa un número de repetición mayor que cero.');
      return;
    }

    // El input de tipo date da "2026-08-22", que Date interpreta como
    // medianoche UTC: el backend recibe exactamente el día elegido.
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) {
      setError('Ingresa una fecha válida.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerHabit1({
        numeroDeRepeticion: repeticion,
        fecha: date.toISOString(),
        horaDespertar,
        horaDormir,
        horasDormidas,
        ritualNoche,
        ritualDia,
      });
      setSuccess('Registro guardado. El del día siguiente quedó creado automáticamente.');
      setNumeroDeRepeticion('');
      setFecha('');
      setHoraDespertar('');
      setHoraDormir('');
      setHorasDormidas('');
      setRitualNoche(false);
      setRitualDia(false);
      records.reload();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No fue posible guardar el registro.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl" aria-labelledby="register-habit1-title">
      <div className="mb-8">
        <p className="mb-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase">Construye tu hábito</p>
        <h1 id="register-habit1-title" className="font-heading text-3xl font-bold tracking-[-0.055em] text-foreground sm:text-4xl">
          Hábito 1
        </h1>
        <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
          Registra el día y deja preparado el siguiente, madrugando 15 minutos más.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro del día</CardTitle>
          <CardDescription>Completa la información para guardarla.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={submit}>
            <div className="grid gap-2">
              <Label htmlFor="habit1-repeticion">Número de repetición</Label>
              <Input
                id="habit1-repeticion"
                type="number"
                value={numeroDeRepeticion}
                onChange={(event) => setNumeroDeRepeticion(event.target.value)}
                min="1"
                step="1"
                placeholder="Ej. 5"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="habit1-fecha">Fecha</Label>
              <Input
                id="habit1-fecha"
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="habit1-hora-despertar">Hora de despertar</Label>
              <Input
                id="habit1-hora-despertar"
                type="time"
                value={horaDespertar}
                onChange={(event) => setHoraDespertar(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="habit1-hora-dormir">Hora de dormir</Label>
              <Input
                id="habit1-hora-dormir"
                type="time"
                value={horaDormir}
                onChange={(event) => setHoraDormir(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="habit1-horas-dormidas">Horas dormidas</Label>
              <Input
                id="habit1-horas-dormidas"
                type="time"
                value={horasDormidas}
                onChange={(event) => setHorasDormidas(event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Duración del sueño: 07:30 son 7 horas 30 minutos.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="habit1-ritual-noche"
                type="checkbox"
                className="size-4 accent-primary"
                checked={ritualNoche}
                onChange={(event) => setRitualNoche(event.target.checked)}
              />
              <Label htmlFor="habit1-ritual-noche">Ritual de noche</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="habit1-ritual-dia"
                type="checkbox"
                className="size-4 accent-primary"
                checked={ritualDia}
                onChange={(event) => setRitualDia(event.target.checked)}
              />
              <Label htmlFor="habit1-ritual-dia">Ritual de día</Label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar registro'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tus registros</CardTitle>
          <CardDescription>Días del hábito que has registrado.</CardDescription>
        </CardHeader>
        <CardContent>
          {records.loading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Cargando registros">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-6 w-full" />
              ))}
            </div>
          ) : records.error ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-destructive">{records.error}</p>
              <Button type="button" variant="outline" size="sm" onClick={records.reload}>
                Reintentar
              </Button>
            </div>
          ) : (
            <Habit1Table items={records.data ?? []} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
