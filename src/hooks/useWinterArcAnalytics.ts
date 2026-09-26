import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../services/api';
import { getWinterArcAnalytics } from '../services/winterArc';
import type { WinterArcAnalytics } from '../types/winterArc';

interface UseWinterArcAnalytics {
  data: WinterArcAnalytics | null;
  /** true si el backend no tiene retrospectiva para el reto (404 o 409). */
  unavailable: boolean;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Retrospectiva de un Winter Arc terminado (GET /api/winter-arc/:id/analytics). */
export function useWinterArcAnalytics(winterArcId: string): UseWinterArcAnalytics {
  const [data, setData] = useState<WinterArcAnalytics | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setUnavailable(false);

    getWinterArcAnalytics(winterArcId)
      .then((analytics) => {
        if (!cancelled) setData(analytics);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Sin retrospectiva (reto sin analítica o endpoint sin desplegar) no es
        // un error que mostrar: la pantalla del reto terminado sigue igual que antes.
        if (err instanceof ApiError && (err.status === 404 || err.status === 409)) setUnavailable(true);
        else setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [winterArcId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, unavailable, loading, error, reload };
}
