import { useState, type ReactNode } from 'react';
import {
  CalendarClock,
  CircleCheck,
  Plus,
  Receipt,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { PageHeader } from '../components/PageHeader';
import { PendingList } from '../components/PendingList';
import { PaidPaymentsSection } from '../components/PaidPaymentsSection';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { ConfirmPaymentDialog } from '../components/ConfirmPaymentDialog';
import { useDashboard } from '../hooks/useDashboard';
import {
  daysLabel,
  firstNameOf,
  formatLongToday,
  formatMoney,
  formatShortDate,
  planStatusLabel,
} from '../services/format';
import { deletePendingPayment, markPendingPaymentAsPaid, type PaymentMethod } from '../services/pendingPayments';
import { useAuth } from '../auth/useAuth';
import type { Dashboard, PlanStatus } from '../types/dashboard';

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

  const name = firstNameOf(user?.displayName, user?.email);
  const pendingTotal = data.pending.reduce((total, payment) => total + (payment.amount ?? 0), 0);

  return (
    <>
      <PageHeader
        id="dashboard-title"
        eyebrow={formatLongToday()}
        title={name ? `Hola, ${name}` : 'Hola'}
        description="Esto es lo que puedes gastar y cómo va tu plan."
        actions={
          <>
            <Button type="button" size="lg" onClick={() => { window.location.href = '/gastos'; }}>
              <Receipt aria-hidden="true" />
              Nuevo gasto
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={() => { window.location.href = '/ingresos'; }}>
              <Plus aria-hidden="true" />
              Ingreso
            </Button>
          </>
        }
      />

      {/* Las tres preguntas de Kaizen, en el orden en que uno se las hace. */}
      <section className="grid gap-4 lg:grid-cols-3" aria-label="Tu resumen de hoy">
        <SpendTodayCard data={data} />
        <NextIncomeCard data={data} />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3 lg:items-start">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pagos pendientes</CardTitle>
            <CardDescription>
              {data.pending.length === 0
                ? 'No tienes pagos por hacer.'
                : `${data.pending.length} ${data.pending.length === 1 ? 'pago' : 'pagos'} · ${formatMoney(pendingTotal, data.currency)} en total`}
            </CardDescription>
            <CardAction>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-accent hover:text-primary"
                onClick={() => { window.location.href = '/gastos'; }}
              >
                <Plus aria-hidden="true" />
                Agregar
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {paymentError && (
              <p className="mb-3 rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive">{paymentError}</p>
            )}
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

        <PlanCard data={data} pendingTotal={pendingTotal} />
      </div>

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

/**
 * Pregunta 1: ¿cuánto puedo gastar hoy?
 *
 * La cifra grande es la caja de hoy. La caja llega negativa cuando ya salió
 * más plata de la que ha entrado; aquí se muestra en cero, porque "cuánto
 * puedes gastar" por debajo de cero es nada. Debajo, lo que queda libre si
 * pagas todo lo pendiente y cuánto rinde por día hasta el próximo ingreso.
 */
function SpendTodayCard({ data }: { data: Dashboard }) {
  const availableToSpend = Math.max(0, data.availableMoney);
  const free = data.availableAfterCommitments;
  const days = data.nextIncome?.daysRemaining ?? 0;
  const perDay = data.nextIncome && days > 0 && free > 0 ? Math.floor(free / days) : null;

  return (
    <div className="hero-surface relative overflow-hidden rounded-2xl p-6 shadow-lg shadow-hero/20 sm:p-7 lg:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-hero-foreground/75">
          <Wallet aria-hidden="true" className="size-4" />
          Disponible hoy
        </p>
        <PlanStatusPill status={data.planStatus} />
      </div>

      <p className="mt-4 text-5xl font-bold tracking-[-0.045em] tabular-nums sm:text-6xl">
        {formatMoney(availableToSpend, data.currency)}
      </p>

      {data.availableMoney < 0 && (
        <p className="mt-2 text-sm text-hero-foreground/70">
          Tu saldo real es {formatMoney(data.availableMoney, data.currency)}: ya salió más dinero del que ha entrado.
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <HeroFact
          label="Libre si pagas todo lo pendiente"
          value={formatMoney(free, data.currency)}
          tone={free > 0 ? 'good' : 'bad'}
        />
        <HeroFact
          label={perDay !== null ? `Por día, durante ${daysLabel(days)}` : 'Por día hasta tu próximo ingreso'}
          value={perDay !== null ? `≈ ${formatMoney(perDay, data.currency)}` : '—'}
          hint={
            !data.nextIncome
              ? 'Registra tu próximo ingreso para calcularlo.'
              : free <= 0
                ? 'Primero cubre tus pendientes.'
                : days <= 0
                  ? 'Tu ingreso llega hoy.'
                  : undefined
          }
        />
      </div>
    </div>
  );
}

function HeroFact({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'good' | 'bad';
}) {
  return (
    <div className="rounded-xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10">
      <p className="text-xs font-medium text-hero-foreground/70">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold tracking-tight tabular-nums ${
          tone === 'good' ? 'text-hero-accent' : tone === 'bad' ? 'text-[#ffb4a8]' : ''
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-hero-foreground/60">{hint}</p>}
    </div>
  );
}

const PLAN_PILL: Record<PlanStatus, string> = {
  on_track: 'bg-hero-accent/15 text-hero-accent ring-hero-accent/30',
  at_risk: 'bg-amber-300/15 text-amber-200 ring-amber-300/30',
  off_track: 'bg-red-300/15 text-red-200 ring-red-300/30',
  unknown: 'bg-white/10 text-hero-foreground/80 ring-white/20',
};

/** Pregunta 3, en corto: la etiqueta que acompaña a la cifra de hoy. */
function PlanStatusPill({ status }: { status: PlanStatus }) {
  const Icon = status === 'on_track' ? TrendingUp : TriangleAlert;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        PLAN_PILL[status] ?? PLAN_PILL.unknown
      }`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {planStatusLabel(status)}
    </span>
  );
}

/** Pregunta 2: ¿cuántos días faltan para mi próximo ingreso? */
function NextIncomeCard({ data }: { data: Dashboard }) {
  const next = data.nextIncome;

  return (
    <Card className="justify-between">
      <CardHeader>
        <CardDescription className="inline-flex items-center gap-2 font-medium">
          <CalendarClock aria-hidden="true" className="size-4 text-primary" />
          Próximo ingreso
        </CardDescription>
      </CardHeader>

      {next ? (
        <CardContent className="flex flex-1 flex-col justify-between gap-6">
          <div>
            {next.daysRemaining <= 0 ? (
              <p className="text-5xl font-bold tracking-[-0.045em] text-primary">Hoy</p>
            ) : (
              <p className="flex items-baseline gap-2">
                <span className="text-6xl font-bold tracking-[-0.05em] text-foreground tabular-nums">
                  {next.daysRemaining}
                </span>
                <span className="text-lg font-semibold text-muted-foreground">
                  {next.daysRemaining === 1 ? 'día' : 'días'}
                </span>
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {next.daysRemaining <= 0 ? 'llega tu ingreso' : next.daysRemaining === 1 ? 'falta para tu ingreso' : 'faltan para tu ingreso'}
            </p>
          </div>

          <div className="rounded-xl bg-success-soft px-4 py-3">
            <p className="text-xl font-semibold tracking-tight text-success tabular-nums">
              +{formatMoney(next.amount, data.currency)}
            </p>
            <p className="mt-0.5 truncate text-xs text-foreground/70">
              {[next.source, formatShortDate(next.date)].filter(Boolean).join(' · ')}
            </p>
          </div>
        </CardContent>
      ) : (
        <CardContent className="flex flex-1 flex-col justify-between gap-5">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">Sin fecha todavía</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Registra cuándo te pagan y te diremos cuántos días faltan y cuánto te rinde cada día.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => { window.location.href = '/ingresos'; }}>
            <Plus aria-hidden="true" />
            Registrar ingreso
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Pregunta 3, con la cuenta completa: de dónde sale "Libre si pagas todo" y
 * con cuánto quedarías cuando llegue el próximo ingreso.
 */
function PlanCard({ data, pendingTotal }: { data: Dashboard; pendingTotal: number }) {
  const free = data.availableAfterCommitments;
  const nextAmount = data.nextIncome?.amount ?? 0;
  const projected = free + nextAmount;
  const onTrack = data.planStatus === 'on_track';

  // Cuánto de la caja de hoy se comen los pendientes. Se satura en 100 %: más
  // allá, lo que importa es la cifra negativa, no cuánto sobresale la barra.
  const usedPercent =
    data.availableMoney > 0 ? Math.min(100, Math.round((pendingTotal * 100) / data.availableMoney)) : pendingTotal > 0 ? 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Tu plan</CardTitle>
        <CardDescription>Hasta tu próximo ingreso.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div
          className={`flex gap-3 rounded-xl px-3.5 py-3 text-sm leading-relaxed ${
            onTrack ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
          }`}
        >
          {onTrack ? (
            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          <p className="text-foreground/85">
            {onTrack
              ? `Vas bien: cubres todos tus pendientes y te sobran ${formatMoney(free, data.currency)}.`
              : `Tus pendientes superan lo que tienes hoy por ${formatMoney(Math.abs(free), data.currency)}. Empieza por lo que vence primero.`}
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>Pendientes sobre tu disponible</span>
            <span className="font-semibold text-foreground tabular-nums">{usedPercent} %</span>
          </div>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={usedPercent}
            aria-label="Parte de tu disponible comprometida en pendientes"
          >
            <div
              className={`h-full rounded-full transition-[width] ${
                usedPercent >= 100 ? 'bg-destructive' : usedPercent >= 80 ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>

        <dl className="grid gap-2.5 text-sm">
          <PlanRow label="Disponible hoy" value={formatMoney(data.availableMoney, data.currency)} />
          <PlanRow label="Pagos pendientes" value={`− ${formatMoney(pendingTotal, data.currency)}`} muted />
          <PlanRow
            label="Libre tras pagar"
            value={formatMoney(free, data.currency)}
            strong
            tone={free < 0 ? 'bad' : 'good'}
            divider
          />
          {data.nextIncome && (
            <>
              <PlanRow label="Próximo ingreso" value={`+ ${formatMoney(nextAmount, data.currency)}`} muted />
              <PlanRow
                label="Te quedarían"
                value={formatMoney(projected, data.currency)}
                strong
                tone={projected < 0 ? 'bad' : 'good'}
                divider
              />
            </>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

function PlanRow({
  label,
  value,
  muted,
  strong,
  tone,
  divider,
}: {
  label: ReactNode;
  value: string;
  muted?: boolean;
  strong?: boolean;
  tone?: 'good' | 'bad';
  divider?: boolean;
}) {
  const valueColor = tone === 'bad' ? 'text-destructive' : tone === 'good' ? 'text-primary' : 'text-foreground';

  return (
    <div className={`flex items-baseline justify-between gap-3 ${divider ? 'border-t border-dashed pt-2.5' : ''}`}>
      <dt className={muted ? 'text-muted-foreground' : strong ? 'font-semibold text-foreground' : 'text-foreground'}>
        {label}
      </dt>
      <dd
        className={`tabular-nums whitespace-nowrap ${strong ? `text-base font-bold ${valueColor}` : muted ? 'text-muted-foreground' : 'font-medium text-foreground'}`}
      >
        {value}
      </dd>
    </div>
  );
}
