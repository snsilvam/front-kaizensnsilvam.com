import { useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { DateTimePicker } from '../components/DateTimePicker';
import { registerPendingPayment, type PendingPaymentCategory } from '../services/pendingPayments';

/**
 * Con "mercado" el gasto pendiente pasa a ser un presupuesto de compra y
 * aparece en /mercado. Es el unico valor que enciende ese modulo, por eso el
 * selector es un conjunto cerrado y no texto libre.
 */
const CATEGORY_OPTIONS: Array<{ value: PendingPaymentCategory; label: string; hint: string }> = [
  { value: 'otros', label: 'Gasto normal', hint: 'Solo quiero tenerlo presente.' },
  { value: 'mercado', label: 'Mercado', hint: 'Voy a comprar contra este monto.' },
];

export function RegisterPendingPayment() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PendingPaymentCategory>('otros');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const numericAmount = Number(amount.replace(/\./g, ''));
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
        category,
      });
      setSuccess(
        category === 'mercado'
          ? 'Presupuesto de mercado creado. Ya puedes usarlo en Mercado.'
          : 'Gasto pendiente registrado correctamente.',
      );
      setName('');
      setAmount('');
      setDueDate('');
      setCategory('otros');
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

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>Datos del gasto</CardTitle>
          <CardDescription>Completa la información para guardarla.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={submit}>
            <div className="grid gap-2">
              <span id="pending-payment-category-label" className="text-sm font-medium leading-none">
                Tipo de gasto
              </span>
              <div
                className="grid grid-cols-2 gap-2"
                role="radiogroup"
                aria-labelledby="pending-payment-category-label"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={category === option.value}
                    onClick={() => setCategory(option.value)}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      category === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-input hover:bg-muted'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.hint}</span>
                  </button>
                ))}
              </div>
            </div>

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
                type="text"
                value={amount}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '');
                  setAmount(digits ? Number(digits).toLocaleString('es-CO') : '');
                }}
                inputMode="numeric"
                placeholder="Ej. 90.000"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pending-payment-date">Fecha límite de pago</Label>
              <DateTimePicker
                id="pending-payment-date"
                value={dueDate}
                onChange={setDueDate}
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
