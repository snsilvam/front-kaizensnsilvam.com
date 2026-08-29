import { useCallback, useEffect, useState } from 'react';
import { listMarketBudgets } from '../services/market';
import type { MarketBudget } from '../types/market';

interface UseMarketBudgets {
  budgets: MarketBudget[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Presupuestos de mercado abiertos: la primera pantalla del modulo. */
export function useMarketBudgets(): UseMarketBudgets {
  const [budgets, setBudgets] = useState<MarketBudget[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    listMarketBudgets()
      .then((data) => {
        if (!cancelled) setBudgets(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No pudimos cargar tus presupuestos.');
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

  return { budgets, loading, error, reload };
}
