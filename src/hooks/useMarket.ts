import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addMarketItem,
  getMarketSummary,
  markMarketItemAsPending,
  markMarketItemAsPurchased,
  removeMarketItem,
  updateMarketItem,
  updateMarketList,
} from '../services/market';
import type {
  MarketItemInput,
  MarketListInput,
  MarketPurchaseInput,
  MarketSummary,
} from '../types/market';

/** Lo que esta en vuelo: un producto por su id, uno nuevo o la lista. */
export type MarketBusy = string | 'new-item' | 'list' | null;

interface UseMarket {
  summary: MarketSummary | null;
  loading: boolean;
  /** Error de carga: la pantalla no se puede pintar. */
  error: string | null;
  /** Error de una accion puntual; el resumen que ya estaba sigue en pantalla. */
  actionError: string | null;
  clearActionError: () => void;
  busy: MarketBusy;
  reload: () => void;
  /** Todas responden `true` si el cambio quedo guardado. */
  addItem: (input: MarketItemInput) => Promise<boolean>;
  updateItem: (itemId: string, input: MarketItemInput) => Promise<boolean>;
  markPurchased: (itemId: string, input: MarketPurchaseInput) => Promise<boolean>;
  markPending: (itemId: string) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  updateList: (input: MarketListInput) => Promise<boolean>;
}

/**
 * Estado de la pantalla de una lista de mercado. Ninguna accion recarga nada:
 * el backend responde el resumen recalculado y lo dejamos tal cual, asi las
 * cifras de la pantalla siempre son las del backend.
 *
 * Solo hay una accion en vuelo a la vez: en el supermercado, con mala senal,
 * dos toques seguidos no deben pisarse.
 */
export function useMarket(budgetId: string): UseMarket {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<MarketBusy>(null);
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
          setError(err instanceof Error ? err.message : 'No pudimos cargar tu lista.');
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
  const clearActionError = useCallback(() => setActionError(null), []);

  // Ref y no estado: dos toques en el mismo render verian el mismo `busy`.
  const inFlight = useRef(false);

  const run = useCallback(
    async (key: Exclude<MarketBusy, null>, call: () => Promise<MarketSummary>, fallback: string) => {
      if (inFlight.current) return false;
      inFlight.current = true;
      setBusy(key);
      setActionError(null);

      try {
        setSummary(await call());
        return true;
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : fallback);
        return false;
      } finally {
        inFlight.current = false;
        setBusy(null);
      }
    },
    [],
  );

  const addItem = useCallback(
    (input: MarketItemInput) =>
      run('new-item', () => addMarketItem(budgetId, input), 'No pudimos agregar el producto.'),
    [budgetId, run],
  );

  const updateItem = useCallback(
    (itemId: string, input: MarketItemInput) =>
      run(itemId, () => updateMarketItem(budgetId, itemId, input), 'No pudimos guardar el producto.'),
    [budgetId, run],
  );

  const markPurchased = useCallback(
    (itemId: string, input: MarketPurchaseInput) =>
      run(
        itemId,
        () => markMarketItemAsPurchased(budgetId, itemId, input),
        'No pudimos marcarlo como comprado.',
      ),
    [budgetId, run],
  );

  const markPending = useCallback(
    (itemId: string) =>
      run(itemId, () => markMarketItemAsPending(budgetId, itemId), 'No pudimos devolverlo a la lista.'),
    [budgetId, run],
  );

  const removeItem = useCallback(
    (itemId: string) =>
      run(itemId, () => removeMarketItem(budgetId, itemId), 'No pudimos quitar el producto.'),
    [budgetId, run],
  );

  const updateList = useCallback(
    (input: MarketListInput) =>
      run('list', () => updateMarketList(budgetId, input), 'No pudimos guardar la lista.'),
    [budgetId, run],
  );

  return {
    summary,
    loading,
    error,
    actionError,
    clearActionError,
    busy,
    reload,
    addItem,
    updateItem,
    markPurchased,
    markPending,
    removeItem,
    updateList,
  };
}
