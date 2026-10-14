import { useCallback, useEffect, useState } from 'react';
import { getSleepToday, saveSleepToday } from '../services/sleep';
import type { SaveSleepInput, SleepToday } from '../types/sleep';

interface UseSleepToday {
  data: SleepToday | null;
  loading: boolean;
  /** Error de carga: el formulario no se puede pintar. */
  error: string | null;
  reload: () => void;
  saving: boolean;
  /** Error al guardar; lo que ya estaba sigue en el formulario. */
  saveError: string | null;
  /** `true` si quedo guardado. */
  save: (input: SaveSleepInput) => Promise<boolean>;
}

/**
 * Estado del modal de sueno: el registro de hoy. Guardar no recarga: el
 * backend responde el dia completo y lo dejamos tal cual.
 */
export function useSleepToday(): UseSleepToday {
  const [data, setData] = useState<SleepToday | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getSleepToday()
      .then((today) => {
        if (!cancelled) setData(today);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No pudimos cargar tu registro de sueño.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const save = useCallback(async (input: SaveSleepInput) => {
    setSaving(true);
    setSaveError(null);

    try {
      setData(await saveSleepToday(input));
      return true;
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'No pudimos guardar tu registro.');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { data, loading, error, reload, saving, saveError, save };
}
