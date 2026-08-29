import { useCallback, useEffect, useState } from 'react';
import { addMarketItem, getMarketSummary, removeMarketItem } from '../services/market';
import type { MarketSummary } from '../types/market';

interface UseMarket {
  summary: MarketSummary | null;
  loading: boolean;
  /** Error de carga: la pantalla no se puede pintar. */
  error: string | null;
  /** Error de una accion puntual; el resumen que ya estaba sigue en pantalla. */
  actionError: string | null;
  adding: boolean;
  removingId: string | null;
  reload: () => void;
  /** `true` si el producto quedo agregado, para que el formulario se limpie. */
  addItem: (name: string, price: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<void>;
}

/**
 * Estado de la pantalla de mercado. Agregar y quitar productos no recargan
 * nada: el backend responde el resumen recalculado y lo dejamos tal cual.
 */
export function useMarket(budgetId: string): UseMarket {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getMarketSummary(budgetId)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No pudimos cargar tu mercado.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [budgetId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const addItem = useCallback(
    async (name: string, price: number) => {
      setAdding(true);
      setActionError(null);

      try {
        setSummary(await addMarketItem(budgetId, name, price));
        return true;
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : 'No pudimos agregar el producto.');
        return false;
      } finally {
        setAdding(false);
      }
    },
    [budgetId],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      setRemovingId(itemId);
      setActionError(null);

      try {
        setSummary(await removeMarketItem(budgetId, itemId));
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : 'No pudimos quitar el producto.');
      } finally {
        setRemovingId(null);
      }
    },
    [budgetId],
  );

  return { summary, loading, error, actionError, adding, removingId, reload, addItem, removeItem };
}
