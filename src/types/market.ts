// Contrato de los endpoints /market del backend.
// Si el backend cambia nombres de campo, este archivo es el unico lugar que
// hay que ajustar.

/**
 * Semaforo del presupuesto mientras se hace mercado. Lo calcula el backend y
 * no el cliente, para que web y movil pinten exactamente lo mismo.
 */
export type MarketStatus = 'ok' | 'warning' | 'exceeded';

/** Un presupuesto de mercado en la pantalla de seleccion. */
export interface MarketBudget {
  id: string;
  name: string;
  /** Monto del gasto pendiente: el tope contra el que se compra. */
  budget: number;
  /** Fecha limite en ISO 8601. */
  dueDate: string;
}

/** Un producto echado al carro. */
export interface MarketItem {
  id: string;
  name: string;
  price: number;
  /** ISO 8601. */
  createdAt: string;
}

/**
 * La pantalla de mercado completa. La devuelven los tres endpoints de lectura
 * y escritura, asi que despues de agregar o quitar un producto no hace falta
 * volver a pedirla.
 */
export interface MarketSummary {
  pendingPaymentId: string;
  name: string;
  budget: number;
  spent: number;
  /** Puede ser negativo: pasarse del presupuesto no se bloquea. */
  remaining: number;
  itemsCount: number;
  status: MarketStatus;
  /** Mensaje que acompana al estado, ya redactado por el backend. */
  message: string;
  items: MarketItem[];
}
