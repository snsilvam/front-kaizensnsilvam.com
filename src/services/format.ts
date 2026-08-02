import type { PlanStatus } from '../types/dashboard';

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(amount);
  } catch {
    // currency invalido o vacio
    return amount.toLocaleString('es-CO');
  }
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  on_track: 'En camino',
  at_risk: 'En riesgo',
  off_track: 'Fuera de plan',
  unknown: 'Sin datos',
};

export function planStatusLabel(status: PlanStatus): string {
  return PLAN_STATUS_LABELS[status] ?? PLAN_STATUS_LABELS.unknown;
}
