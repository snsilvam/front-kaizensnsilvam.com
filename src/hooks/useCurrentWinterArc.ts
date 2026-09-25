import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../services/api';
import { getCurrentWinterArc } from '../services/winterArc';
import type { WinterArcGrid } from '../types/winterArc';

interface UseCurrentWinterArc {
  /** El reto más reciente; null si todavía carga, falló o nunca hubo uno. */
  data: WinterArcGrid | null;
  /** true cuando el usuario nunca inició un Winter Arc (404). */
  notFound: boolean;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Reto más reciente del usuario (GET /api/winter-arc/current), para abrirlo sin id en la URL. */
export function useCurrentWinterArc(): UseCurrentWinterArc {
  const [data, setData] = useState<WinterArcGrid | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setNotFound(false);

    getCurrentWinterArc()
      .then((grid) => {
        if (!cancelled) setData(grid);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Sin reto no es un error: es el estado vacío que invita a empezar uno.
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, notFound, loading, error, reload };
}
