import { useMemo, useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { DateTimePicker } from '../components/DateTimePicker';
import { usePendingPaymentCategories } from '../hooks/usePendingPaymentCategories';
import {
  registerPendingPayment,
  type PendingPaymentCategory,
  type PendingPaymentCategoryCode,
} from '../services/pendingPayments';

/**
 * Como se presenta cada categoria conocida. El catalogo del backend trae el
 * nombre a secas ("Otros"); aqui se le pone la copia de la pantalla, que
 * explica que significa elegirla.
 *
 * Una categoria que el backend agregue y no este en este mapa se pinta con su
 * propio nombre: el selector no se rompe por no conocerla.
 */
const CATEGORY_COPY: Record<PendingPaymentCategoryCode, { label: string; hint: string }> = {
  otros: { label: 'Gasto normal', hint: 'Solo quiero tenerlo presente.' },
  mercado: { label: 'Mercado', hint: 'Voy a comprar contra este monto.' },
};

/** La categoria por defecto: la que queda si el usuario no elige ninguna. */
const DEFAULT_CATEGORY_CODE: PendingPaymentCategoryCode = 'otros';

export function RegisterPendingPayment() {
  const { categories, error: categoriesError } = usePendingPaymentCategories();
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // El backend ordena por nombre, pero la pantalla siempre ha abierto con el
  // gasto normal a la izquierda: es el caso comun y el que queda por defecto.
  const options = useMemo(() => sortWithDefaultFirst(categories ?? []), [categories]);

  // El id seleccionado, o el de la categoria por defecto mientras el usuario no
  // toque el selector. Vacio hasta que llegue el catalogo: sin categoryId el
  // backend ya deja el gasto en "otros", que es justo lo que se quiere.
  const selectedId =
    categoryId || options.find((option) => option.code === DEFAULT_CATEGORY_CODE)?.id || '';
  const selectedCode = options.find((option) => option.id === selectedId)?.code;

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
        // Sin catalogo no se manda ninguna: el backend la deja en "otros".
        ...(selectedId ? { categoryId: selectedId } : {}),
      });
      setSuccess(
        selectedCode === 'mercado'
          ? 'Presupuesto de mercado creado. Ya puedes usarlo en Mercado.'
          : 'Gasto pendiente registrado correctamente.',
      );
      setName('');
      setAmount('');
      setDueDate('');
      setCategoryId('');
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
            {options.length > 0 && (
              <div className="grid gap-2">
                <span id="pending-payment-category-label" className="text-sm font-medium leading-none">
                  Tipo de gasto
                </span>
                <div
                  className="grid grid-cols-2 gap-2"
                  role="radiogroup"
                  aria-labelledby="pending-payment-category-label"
                >
                  {options.map((option) => {
                    const copy = copyFor(option);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selectedId === option.id}
                        onClick={() => setCategoryId(option.id)}
                        className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          selectedId === option.id
                            ? 'border-primary bg-primary/10'
                            : 'border-input hover:bg-muted'
                        }`}
                      >
                        <span className="block text-sm font-semibold text-foreground">{copy.label}</span>
                        <span className="block text-xs text-muted-foreground">{copy.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {categoriesError && (
              <Alert variant="destructive">
                <AlertDescription>
                  No pudimos cargar los tipos de gasto. Puedes registrarlo igual: quedará como gasto
                  normal.
                </AlertDescription>
              </Alert>
            )}

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

/**
 * Deja la categoria por defecto de primera y el resto por nombre. El orden del
 * backend es alfabetico, que pondria "Mercado" antes que "Otros" e invitaria a
 * elegir el caso raro.
 */
function sortWithDefaultFirst(categories: PendingPaymentCategory[]): PendingPaymentCategory[] {
  return [...categories].sort((a, b) => {
    if (a.code === DEFAULT_CATEGORY_CODE) return -1;
    if (b.code === DEFAULT_CATEGORY_CODE) return 1;
    return a.name.localeCompare(b.name);
  });
}

/** La copia de la pantalla si conocemos la categoria; su nombre si no. */
function copyFor(category: PendingPaymentCategory): { label: string; hint: string } {
  return CATEGORY_COPY[category.code] ?? { label: category.name, hint: '' };
}
