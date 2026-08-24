import { useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { IncomeTable } from '../components/IncomeTable';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { useIncomes } from '../hooks/useIncomes';
import { deleteIncome, registerIncome } from '../services/incomes';

const CURRENCY = 'COP';

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

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Ingresa un monto mayor que cero.');
      return;
    }

    const date = new Date(paymentDate);
    if (Number.isNaN(date.getTime())) {
      setError('Ingresa una fecha de pago válida.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerIncome({
        name: name.trim(),
        amount: numericAmount,
        date: date.toISOString(),
      });
      setSuccess('Ingreso registrado correctamente.');
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
    <section className="mx-auto max-w-xl" aria-labelledby="register-income-title">
      <div className="mb-8">
        <p className="mb-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase">Organiza tus ingresos</p>
        <h1 id="register-income-title" className="font-heading text-3xl font-bold tracking-[-0.055em] text-foreground sm:text-4xl">
          Registrar ingreso
        </h1>
        <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
          Registra el dinero que recibirás para mantener tu plan actualizado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del ingreso</CardTitle>
          <CardDescription>Completa la información para guardarla.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={submit}>
            <div className="grid gap-2">
              <Label htmlFor="income-name">Nombre</Label>
              <Input
                id="income-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Salario"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="income-amount">Monto</Label>
              <Input
                id="income-amount"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                min="0"
                step="any"
                placeholder="Ej. 250000"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="income-payment-date">Fecha de pago</Label>
              <Input
                id="income-payment-date"
                type="datetime-local"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
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
              {isSubmitting ? 'Guardando...' : 'Registrar ingreso'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tus ingresos</CardTitle>
          <CardDescription>Ingresos que has registrado.</CardDescription>
        </CardHeader>
        <CardContent>
          {incomes.loading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Cargando ingresos">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-6 w-full" />
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
