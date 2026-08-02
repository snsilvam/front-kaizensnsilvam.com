import { Card } from '../components/Card';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { PendingList } from '../components/PendingList';
import { useDashboard } from '../hooks/useDashboard';
import { formatDate, formatMoney, planStatusLabel } from '../services/format';

export function Home() {
  const { data, loading, error, reload } = useDashboard();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <>
      <section className="page-intro" aria-labelledby="dashboard-title">
        <p className="eyebrow">Tu panorama de hoy</p>
        <h1 id="dashboard-title">Resumen financiero</h1>
        <p>Decide con claridad qu\u00e9 puedes gastar y mant\u00e9n el control de tu plan.</p>
      </section>

      <section className="cards">
        <Card
          title="Dinero disponible"
          value={formatMoney(data.availableMoney, data.currency)}
        />
        <Card
          title="Proximo ingreso"
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
        <Card title="Estado del plan" value={planStatusLabel(data.planStatus)} />
        <Card title="Pendientes" value={String(data.pending.length)} />
      </section>

      <section className="pending-section">
        <h2>Pendientes</h2>
        <PendingList items={data.pending} currency={data.currency} />
      </section>
    </>
  );
}
