import { useState, type FormEvent } from 'react';
import { ArrowRight, CircleCheck } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { DateTimePicker } from '../components/DateTimePicker';
import { IncomeTable } from '../components/IncomeTable';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { MoneyInput, parseMoney } from '../components/MoneyInput';
import { PageHeader } from '../components/PageHeader';
import { SuggestionChips } from '../components/SuggestionChips';
import { useIncomes } from '../hooks/useIncomes';
import { deleteIncome, registerIncome } from '../services/incomes';

const CURRENCY = 'COP';

/** Los nombres que mas se repiten: un toque en vez de escribirlos. */
const NAME_SUGGESTIONS = ['Salario', 'Quincena', 'Prima', 'Freelance', 'Venta'];

export function RegisterIncome() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const incomes = useIncomes();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function remove(incomeId: string) {
    setDeletingId(incomeId);
    setDeleteError('');

    try {
      await deleteIncome(incomeId);
      incomes.reload();
    } catch (requestError) {
      setDeleteError(
        requestError instanceof Error ? requestError.message : 'No fue posible eliminar el ingreso.',
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const numericAmount = parseMoney(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Ingresa un monto mayor que cero.');
      return;
    }

    const date = new Date(paymentDate);
    if (Number.isNaN(date.getTime())) {
      setError('Elige la fecha en que recibes el dinero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerIncome({
        name: name.trim(),
        amount: numericAmount,
        date: date.toISOString(),
      });
      setSuccess('Ingreso registrado. Tu resumen ya lo tiene en cuenta.');
      setName('');
      setAmount('');
      setPaymentDate('');
      incomes.reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible registrar el ingreso.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="register-income-title">
      <PageHeader
        id="register-income-title"
        eyebrow="Ingresos"
        title="Registrar ingreso"
        description="Anota el dinero que recibes o vas a recibir. Con la fecha sabremos cuántos días faltan para tu próximo pago."
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="overflow-visible">
          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={submit}>
              <div className="grid gap-2.5">
                <Label htmlFor="income-amount" className="text-base font-semibold">
                  ¿Cuánto recibes?
                </Label>
                <MoneyInput
                  id="income-amount"
                  size="lg"
                  value={amount}
                  onChange={setAmount}
                  placeholder="2.500.000"
                  required
                />
              </div>

              <div className="grid gap-2.5">
                <Label htmlFor="income-name">¿De dónde viene?</Label>
                <Input
                  id="income-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Salario"
                  required
                />
                <SuggestionChips options={NAME_SUGGESTIONS} value={name} onPick={setName} />
              </div>

              <div className="grid gap-2.5">
                <Label htmlFor="income-payment-date">¿Cuándo lo recibes?</Label>
                <DateTimePicker id="income-payment-date" value={paymentDate} onChange={setPaymentDate} />
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
                    {success}
                    <a href="/" className="inline-flex items-center gap-1 font-semibold no-underline">
                      Ver resumen <ArrowRight aria-hidden="true" className="size-3.5" />
                    </a>
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Registrar ingreso'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tus ingresos</CardTitle>
            <CardDescription>Lo que ya recibiste y lo que está por llegar.</CardDescription>
          </CardHeader>
          <CardContent>
            {incomes.loading ? (
              <div className="space-y-3" aria-busy="true" aria-label="Cargando ingresos">
                {[0, 1, 2].map((row) => (
                  <Skeleton key={row} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : incomes.error ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-destructive">{incomes.error}</p>
                <Button type="button" variant="outline" size="sm" onClick={incomes.reload}>
                  Reintentar
                </Button>
              </div>
            ) : (
              <>
                {deleteError && <p className="mb-3 text-sm text-destructive">{deleteError}</p>}
                <IncomeTable
                  items={incomes.data ?? []}
                  currency={CURRENCY}
                  deletingId={deletingId}
                  onDelete={setIncomeToDelete}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={incomeToDelete !== null}
        itemName={incomes.data?.find((income) => income.id === incomeToDelete)?.name ?? 'este ingreso'}
        itemType="ingreso"
        isDeleting={deletingId === incomeToDelete}
        onCancel={() => setIncomeToDelete(null)}
        onConfirm={async () => {
          if (!incomeToDelete) return;
          await remove(incomeToDelete);
          setIncomeToDelete(null);
        }}
      />
    </section>
  );
}
