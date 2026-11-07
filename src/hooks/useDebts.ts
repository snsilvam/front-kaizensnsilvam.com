import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../services/api';
import { getDebtSummary, listDebtEntities } from '../services/debts';
import type { DebtEntity, DebtSummary } from '../types/debt';

const LOAD_ERROR = 'No pudimos cargar tus deudas. Revisa tu conexión e intenta de nuevo.';
const ACTION_ERROR = 'No pudimos guardar el cambio. Intenta de nuevo en un momento.';

/**
 * El backend ya responde los errores de negocio en español y listos para
 * mostrar (400, 404, 409). Lo demas (red, 500) se cambia por un mensaje
 * amigable: nunca se muestra un error tecnico.
 */
export function friendlyError(error: unknown, fallback = ACTION_ERROR): string {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return error.message;
  return fallback;
}

interface UseDebts {
  summary: DebtSummary | null;
  entities: DebtEntity[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  busy: boolean;
  /**
   * Corre una escritura y deja en pantalla el resumen que responde el backend.
   * Devuelve null si salio bien, o el mensaje de error para el formulario.
   */
  run: (action: () => Promise<DebtSummary>) => Promise<string | null>;
}

/** Estado de la pantalla de Deudas: una sola accion en vuelo a la vez. */
export function useDebts(): UseDebts {
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [entities, setEntities] = useState<DebtEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getDebtSummary(), listDebtEntities()])
      .then(([nextSummary, nextEntities]) => {
        if (cancelled) return;
        setSummary(nextSummary);
        setEntities(nextEntities);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(friendlyError(err, LOAD_ERROR));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const run = useCallback(async (action: () => Promise<DebtSummary>) => {
    setBusy(true);
    try {
      setSummary(await action());
      return null;
    } catch (err) {
      return friendlyError(err);
    } finally {
      setBusy(false);
    }
  }, []);

  return { summary, entities, loading, error, reload, busy, run };
}
