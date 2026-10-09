import { useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, CircleCheck, Receipt, ShoppingCart, type LucideIcon } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { DateTimePicker } from '../components/DateTimePicker';
import { MoneyInput, parseMoney } from '../components/MoneyInput';
import { PageHeader } from '../components/PageHeader';
import { usePendingPaymentCategories } from '../hooks/usePendingPaymentCategories';
import { PATH_HOME } from '../lib/paths';
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
const CATEGORY_COPY: Record<PendingPaymentCategoryCode, { label: string; hint: string; icon: LucideIcon }> = {
  otros: { label: 'Gasto normal', hint: 'Solo quiero tenerlo presente.', icon: Receipt },
  mercado: { label: 'Mercado', hint: 'Voy a comprar contra este monto.', icon: ShoppingCart },
};

/** La categoria por defecto: la que queda si el usuario no elige ninguna. */
const DEFAULT_CATEGORY_CODE: PendingPaymentCategoryCode = 'otros';

type Success = { message: string; goTo: { href: string; label: string } };

export function RegisterPendingPayment() {
  const { categories, error: categoriesError } = usePendingPaymentCategories();
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<Success | null>(null);
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
  const isMarket = selectedCode === 'mercado';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess(null);

    const numericAmount = parseMoney(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Ingresa un monto mayor que cero.');
      return;
    }

    const date = new Date(dueDate);
    if (Number.isNaN(date.getTime())) {
      setError('Elige la fecha límite de pago.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerPendingPayment({
        name: name.trim(),
        ...(place.trim() ? { place: place.trim() } : {}),
        amount: numericAmount,
        dueDate: date.toISOString(),
        // Sin catalogo no se manda ninguna: el backend la deja en "otros".
        ...(selectedId ? { categoryId: selectedId } : {}),
      });
      setSuccess(
        isMarket
          ? {
              message: 'Presupuesto de mercado creado.',
              goTo: { href: '/mercado', label: 'Ir a mercado' },
            }
          : {
              message: 'Gasto pendiente registrado.',
              goTo: { href: PATH_HOME.finanzas, label: 'Ver resumen' },
            },
      );
      setName('');
      setPlace('');
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
      <PageHeader
        id="register-pending-payment-title"
        eyebrow="Gastos"
        title="Registrar gasto pendiente"
        description="Anota lo que tienes que pagar. Lo descontaremos de lo que puedes gastar para que no te tome por sorpresa."
      />

      <Card className="overflow-visible">
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={submit}>
            {options.length > 0 && (
              <div className="grid gap-2.5">
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
                    const Icon = copy.icon;
                    const selected = selectedId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setCategoryId(option.id)}
                        className={`flex flex-col items-start gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-colors outline-none sm:flex-row sm:gap-3 focus-visible:ring-3 focus-visible:ring-ring/50 ${
                          selected
                            ? 'border-primary bg-accent ring-1 ring-primary'
                            : 'border-input bg-card hover:border-primary/40 hover:bg-muted/60'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                            selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="size-[1.1rem]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">{copy.label}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{copy.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {categoriesError && (
              <Alert variant="warning">
                <AlertDescription>
                  No pudimos cargar los tipos de gasto. Puedes registrarlo igual: quedará como gasto
                  normal.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2.5">
              <Label htmlFor="pending-payment-amount" className="text-base font-semibold">
                {isMarket ? '¿Cuánto tienes para el mercado?' : '¿Cuánto vas a pagar?'}
              </Label>
              <MoneyInput
                id="pending-payment-amount"
                size="lg"
                value={amount}
                onChange={setAmount}
                placeholder="90.000"
                required
              />
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="pending-payment-name">¿Qué es?</Label>
              <Input
                id="pending-payment-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={isMarket ? 'Ej. Mercado de la quincena' : 'Ej. Internet'}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2.5">
                <Label htmlFor="pending-payment-date">Fecha límite</Label>
                <DateTimePicker id="pending-payment-date" value={dueDate} onChange={setDueDate} />
              </div>

              <div className="grid gap-2.5">
                <Label htmlFor="pending-payment-place">
                  Lugar <span className="font-normal text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  id="pending-payment-place"
                  value={place}
                  onChange={(event) => setPlace(event.target.value)}
                  placeholder="Ej. Supermercado del barrio"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="success">
                <CircleCheck aria-hidden="true" />
                <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                  {success.message}
                  <a href={success.goTo.href} className="inline-flex items-center gap-1 font-semibold no-underline">
                    {success.goTo.label} <ArrowRight aria-hidden="true" className="size-3.5" />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isMarket ? 'Crear presupuesto de mercado' : 'Registrar gasto pendiente'}
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
function copyFor(category: PendingPaymentCategory): { label: string; hint: string; icon: LucideIcon } {
  return CATEGORY_COPY[category.code] ?? { label: category.name, hint: '', icon: Receipt };
}
