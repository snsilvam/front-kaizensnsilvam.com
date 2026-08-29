import { useCallback, useEffect, useState } from 'react';
import { listMarketBudgets } from '../services/market';
import {
  listOpenPendingPayments,
  markPendingPaymentAsMarketBudget,
  type PendingPayment,
} from '../services/pendingPayments';
import type { MarketBudget } from '../types/market';

interface UseMarketBudgets {
  budgets: MarketBudget[] | null;
  /** Gastos abiertos que todavia no son presupuesto de mercado. */
  otherExpenses: PendingPayment[] | null;
  loading: boolean;
  /** Error de carga: la pantalla no se puede pintar. */
  error: string | null;
  /** Error al elegir un gasto; la lista que ya estaba sigue en pantalla. */
  actionError: string | null;
  choosingId: string | null;
  reload: () => void;
  /**
   * Convierte un gasto en presupuesto de mercado. Responde `true` si quedo
   * listo, para que la pantalla pueda entrar de una vez a la compra.
   */
  chooseExpense: (paymentId: string) => Promise<boolean>;
}

/**
 * La primera pantalla del modulo: contra cual gasto voy a comprar.
 *
 * Se piden dos listas porque son dos cosas distintas: los presupuestos ya
 * listos (/market) y el resto de gastos abiertos, que se pueden usar como
 * presupuesto con un clic.
 */
export function useMarketBudgets(): UseMarketBudgets {
  const [budgets, setBudgets] = useState<MarketBudget[] | null>(null);
  const [otherExpenses, setOtherExpenses] = useState<PendingPayment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [choosingId, setChoosingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([listMarketBudgets(), listOpenPendingPayments()])
      .then(([marketBudgets, openExpenses]) => {
        if (cancelled) return;
        setBudgets(marketBudgets);
        // Los de categoria "mercado" ya vienen en la otra lista; repetirlos
        // aqui haria elegir dos veces lo mismo.
        setOtherExpenses(openExpenses.filter((expense) => expense.category !== 'mercado'));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No pudimos cargar tus gastos.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const chooseExpense = useCallback(async (paymentId: string) => {
    setChoosingId(paymentId);
    setActionError(null);

    try {
      await markPendingPaymentAsMarketBudget(paymentId);
      return true;
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'No pudimos usar ese gasto como presupuesto.',
      );
      return false;
    } finally {
      setChoosingId(null);
    }
  }, []);

  return {
    budgets,
    otherExpenses,
    loading,
    error,
    actionError,
    choosingId,
    reload,
    chooseExpense,
  };
}
