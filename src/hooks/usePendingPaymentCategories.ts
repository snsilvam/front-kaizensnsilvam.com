import { useEffect, useState } from 'react';
import {
  listPendingPaymentCategories,
  type PendingPaymentCategory,
} from '../services/pendingPayments';

interface UsePendingPaymentCategories {
  categories: PendingPaymentCategory[] | null;
  loading: boolean;
  /**
   * Que el catalogo no cargue no bloquea el formulario: sin categoryId el
   * backend deja el gasto en "otros". El error esta aqui para que la pantalla
   * pueda avisar que el selector no se pudo pintar, no para cortar el registro.
   */
  error: string | null;
}

/**
 * El catalogo de categorias contra las que se registra un gasto.
 *
 * Es global y de solo lectura, asi que se pide una vez al montar y no vuelve a
 * cambiar mientras dure la pantalla.
 */
export function usePendingPaymentCategories(): UsePendingPaymentCategories {
  const [categories, setCategories] = useState<PendingPaymentCategory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listPendingPaymentCategories()
      .then((result) => {
        if (!cancelled) setCategories(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No pudimos cargar los tipos de gasto.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}
