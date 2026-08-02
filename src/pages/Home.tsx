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
import { useDashboard } from '../hooks/useDashboard';
import { formatDate, formatMoney, planStatusLabel } from '../services/format';
import { Button } from '@/components/ui/button';

export function Home() {
  const { data, loading, error, reload } = useDashboard();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <>
      <section className="mb-9 max-w-xl" aria-labelledby="dashboard-title">
        <p className="mb-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase">Tu panorama de hoy</p>
        <h1 id="dashboard-title" className="font-heading text-3xl font-bold tracking-[-0.055em] text-foreground sm:text-4xl">
          Resumen financiero
        </h1>
        <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
          Decide con claridad qué puedes gastar y mantén el control de tu plan.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Dinero disponible"
          value={formatMoney(data.availableMoney, data.currency)}
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

      <Card className="mt-11">
        <CardHeader>
          <CardTitle className="text-lg">Pendientes</CardTitle>
          <CardDescription>Pagos que debes tener presentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingList items={data.pending} currency={data.currency} />
        </CardContent>
      </Card>

    <div className="mt-14 flex justify-center">
      <Button>
      Crear un gasto +
      </Button>
    </div>
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
    <Card className="min-h-34 gap-1.5 border-[#dce5d9] bg-card py-5 shadow-[0_10px_28px_rgba(31,66,46,0.05)]">
      <CardHeader className="px-5">
        <CardTitle className="text-xs font-semibold text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-1.5 px-5">
        <strong className="text-[1.4rem] tracking-[-0.035em] text-foreground">{value}</strong>
        {detail && <CardDescription className="text-xs">{detail}</CardDescription>}
      </CardContent>
    </Card>
  );
}
