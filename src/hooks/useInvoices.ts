import { useCallback, useEffect, useState } from 'react';
import { isFeatureDisabled, listInvoices } from '../services/invoices';
import type { Invoice } from '../types/invoice';

interface UseInvoices {
  data: Invoice[] | null;
  loading: boolean;
  error: string | null;
  /** El usuario no tiene habilitado el módulo de facturas con IA (403). */
  forbidden: boolean;
  reload: () => void;
}

export function useInvoices(): UseInvoices {
  const [data, setData] = useState<Invoice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    listInvoices()
      .then((invoices) => {
        if (!cancelled) setData(invoices);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isFeatureDisabled(err)) {
          setForbidden(true);
          return;
        }
        setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => load(), [load, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, forbidden, reload };
}
