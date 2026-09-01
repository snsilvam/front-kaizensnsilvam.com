import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { PendingList } from '../components/PendingList';
import { PaidPaymentsSection } from '../components/PaidPaymentsSection';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { ConfirmPaymentDialog } from '../components/ConfirmPaymentDialog';
import { useDashboard } from '../hooks/useDashboard';
import { formatDate, formatMoney, planStatusLabel } from '../services/format';
import { deletePendingPayment, markPendingPaymentAsPaid, type PaymentMethod } from '../services/pendingPayments';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '../auth/useAuth';

export function Home() {
  const { data, loading, error, reload } = useDashboard();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [pendingToPay, setPendingToPay] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingToDelete, setPendingToDelete] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { user } = useAuth();
  const handleMarkAsPaid = async (paymentId: string, paymentMethod: PaymentMethod) => {
    setPayingId(paymentId);
    setPaymentError(null);

    try {
      await markPendingPaymentAsPaid(paymentId, paymentMethod);
      reload();
    } catch (requestError) {
      setPaymentError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible marcar el gasto como pagado.',
      );
    } finally {
      setPayingId(null);
    }
  };

  const handleDelete = async (paymentId: string) => {
    setDeletingId(paymentId);
    setPaymentError(null);

    try {
      await deletePendingPayment(paymentId);
      reload();
    } catch (requestError) {
      setPaymentError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible eliminar el gasto pendiente.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  if (!data) return null;

  // La caja de hoy llega negativa cuando ya salió más plata de la que ha
  // entrado. Esta tarjeta la muestra en cero: "dinero para gastar" responde
  // cuánto puedes gastar, y por debajo de cero la respuesta es nada. El número
  // real sigue intacto en `data.availableMoney` para el resto del cálculo.
  const availableToSpend = Math.max(0, data.availableMoney);

  const budget = data.availableMoney + (data.nextIncome?.amount ?? 0);
  const pendingExpenses = data.pending.reduce(
    (total, payment) => total + (payment.amount ?? 0),
    0,
  );
  const projectedRemaining = budget - pendingExpenses;

  return (
    <>
     
       <section className="-mt-6 mb-8 sm:-mt-8" aria-labelledby="dashboard-title">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
          Hola, {user?.displayName ?? user?.email} 👋
          </p>

         <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button type="button" onClick={() => { window.location.href = '/gastos'; }}>
                Registrar gasto pendiente
              </Button>
              <h1
                id="dashboard-title"
                className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              >
                Resumen financiero
              </h1>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Decide con claridad qué puedes gastar y mantén el control de tu plan.
            </p>
          </div>
        </div>
   </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Dinero para gastar"
          value={formatMoney(availableToSpend, data.currency)}
        />
        <DashboardCard
          title="Próximo ingreso"
          value={
            data.nextIncome
              ? formatMoney(data.nextIncome.amount, data.currency)
              : 'Sin registrar'
          }
          detail={
            data.nextIncome
              ? [formatDate(data.nextIncome.date), data.nextIncome.source]
                  .filter(Boolean)
                  .join(' · ')
              : undefined
          }
        />
        <DashboardCard title="Estado del plan" value={planStatusLabel(data.planStatus)} />
        <DashboardCard title="Pendientes" value={String(data.pending.length)} />
      </section>

      <Card className="mt-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Presupuesto hasta tu próximo ingreso</CardTitle>
          <CardDescription>
            Considera tu dinero disponible, el próximo ingreso y los gastos pendientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <BudgetAmount
            label="Presupuesto disponible"
            value={formatMoney(budget, data.currency)}
          />
          <BudgetAmount
            label="Gastos comprometidos"
            value={formatMoney(pendingExpenses, data.currency)}
            variant="expense"
          />
          <BudgetAmount
            label="Te quedarían"
            value={formatMoney(projectedRemaining, data.currency)}
            variant={projectedRemaining < 0 ? 'expense' : 'remaining'}
          />
        </CardContent>
      </Card>

      <Card className="mt-11">
        <CardHeader>
          <CardTitle className="text-lg">Pendientes</CardTitle>
          <CardDescription>Pagos que debes tener presentes.</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentError && <p className="mb-3 text-sm text-destructive">{paymentError}</p>}
          <PendingList
            items={data.pending}
            currency={data.currency}
            payingId={payingId}
            deletingId={deletingId}
            onMarkAsPaid={setPendingToPay}
            onDelete={setPendingToDelete}
          />
        </CardContent>
      </Card>

      <PaidPaymentsSection currency={data.currency} />

      <ConfirmDeleteDialog
        open={pendingToDelete !== null}
        itemName={data.pending.find((payment) => payment.id === pendingToDelete)?.title ?? 'este gasto pendiente'}
        itemType="gasto"
        isDeleting={deletingId === pendingToDelete}
        onCancel={() => setPendingToDelete(null)}
        onConfirm={async () => {
          if (!pendingToDelete) return;
          await handleDelete(pendingToDelete);
          setPendingToDelete(null);
        }}
      />

      <ConfirmPaymentDialog
        open={pendingToPay !== null}
        itemName={data.pending.find((payment) => payment.id === pendingToPay)?.title ?? 'este gasto'}
        isPaying={payingId === pendingToPay}
        onCancel={() => setPendingToPay(null)}
        onConfirm={async (paymentMethod) => {
          if (!pendingToPay) return;
          await handleMarkAsPaid(pendingToPay, paymentMethod);
          setPendingToPay(null);
        }}
      />
    </>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  detail?: string;
}

function DashboardCard({ title, value, detail }: DashboardCardProps) {
  return (
    <Card className="h-34 gap-1.5 border-[#dce5d9] bg-card py-5 shadow-[0_10px_28px_rgba(31,66,46,0.05)]">
      <CardHeader className="px-5">
        <CardTitle className="text-xs font-semibold text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-1.5 px-5">
        <strong className="text-[1.4rem] tracking-[-0.035em] text-foreground">{value}</strong>
        <CardDescription className="min-h-4 text-xs">{detail}</CardDescription>
      </CardContent>
    </Card>
  );
}

interface BudgetAmountProps {
  label: string;
  value: string;
  variant?: 'expense' | 'remaining';
}

function BudgetAmount({ label, value, variant }: BudgetAmountProps) {
  const valueClassName =
    variant === 'expense'
      ? 'text-destructive'
      : variant === 'remaining'
        ? 'text-primary'
        : 'text-foreground';

  return (
    <div className="space-y-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${valueClassName}`}>{value}</p>
    </div>
  );
}
