import { useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { registerPendingPayment } from '../services/pendingPayments';

export function RegisterPendingPayment() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Ingresa un monto mayor que cero.');
      return;
    }

    const date = new Date(dueDate);
    if (Number.isNaN(date.getTime())) {
      setError('Ingresa una fecha límite válida.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerPendingPayment({
        name: name.trim(),
        amount: numericAmount,
        dueDate: date.toISOString(),
      });
      setSuccess('Gasto pendiente registrado correctamente.');
      setName('');
      setAmount('');
      setDueDate('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible registrar el gasto pendiente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl" aria-labelledby="register-pending-payment-title">
      <div className="mb-8">
        <p className="mb-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase">Mantén tus pagos al día</p>
        <h1 id="register-pending-payment-title" className="font-heading text-3xl font-bold tracking-[-0.055em] text-foreground sm:text-4xl">
          Registrar gasto pendiente
        </h1>
        <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
          Registra un pago para tenerlo presente en tu planificación.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del gasto</CardTitle>
          <CardDescription>Completa la información para guardarla.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={submit}>
            <div className="grid gap-2">
              <Label htmlFor="pending-payment-name">Nombre</Label>
              <Input
                id="pending-payment-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Internet"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pending-payment-amount">Monto</Label>
              <Input
                id="pending-payment-amount"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                min="0"
                step="any"
                placeholder="Ej. 90000"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pending-payment-date">Fecha límite de pago</Label>
              <Input
                id="pending-payment-date"
                type="datetime-local"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
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
              {isSubmitting ? 'Guardando...' : 'Registrar gasto pendiente'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
