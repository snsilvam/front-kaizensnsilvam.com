import { useCallback, useEffect, useState } from 'react';
import { getWinterArcGrid } from '../services/winterArc';
import type { WinterArcGrid } from '../types/winterArc';

export interface UseWinterArcGrid {
  data: WinterArcGrid | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Grid de 90 días de un Winter Arc (GET /api/winter-arc/:id/grid). */
export function useWinterArcGrid(winterArcId: string): UseWinterArcGrid {
  const [data, setData] = useState<WinterArcGrid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getWinterArcGrid(winterArcId)
      .then((grid) => {
        if (!cancelled) setData(grid);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [winterArcId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, loading, error, reload };
}
