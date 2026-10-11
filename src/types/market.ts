// Contrato de los endpoints /market del backend.
// Si el backend cambia nombres de campo, este archivo es el unico lugar que
// hay que ajustar.
//
// Todos los montos son pesos enteros: el backend no maneja decimales y el
// cliente no hace cuentas de dinero, solo las pinta.

/**
 * Semaforo del presupuesto mientras se hace mercado. Lo calcula el backend y
 * no el cliente, para que web y movil pinten exactamente lo mismo.
 */
export type MarketStatus = 'ok' | 'warning' | 'exceeded';

/** Una lista de mercado en la pantalla de seleccion, con su avance. */
export interface MarketBudget {
  id: string;
  name: string;
  /** Monto del gasto pendiente: el tope contra el que se compra. */
  budget: number;
  /** Dia en que se piensa mercar, ISO 8601. */
  dueDate: string;
  spent: number;
  remaining: number;
  estimatedTotal: number;
  itemsCount: number;
  purchasedCount: number;
  status: MarketStatus;
}

/** Un producto de la lista. */
export interface MarketItem {
  id: string;
  name: string;
  quantity: number;
  /** Precio estimado por unidad; 0 si no se estimo. */
  estimatedUnitPrice: number;
  /**
   * Precio real por unidad. 0 si nunca se ha comprado; en uno devuelto a
   * pendiente conserva el ultimo precio real, para proponerlo otra vez.
   */
  price: number;
  purchased: boolean;
  /** Lo que pesa la linea: real si esta comprado, estimado si no. */
  total: number;
  /** ISO 8601. */
  createdAt: string;
}

/**
 * La pantalla de mercado completa. La devuelven todos los endpoints de
 * lectura y escritura de una lista, asi que despues de cualquier cambio no
 * hace falta volver a pedirla.
 *
 * Hay dos lecturas del presupuesto: lo ya gastado (spent, remaining, status)
 * y como termina la compra si se lleva todo lo que falta a precio estimado
 * (estimatedTotal, projectedRemaining, projectedStatus).
 */
export interface MarketSummary {
  pendingPaymentId: string;
  name: string;
  /** ISO 8601. */
  dueDate: string;
  /** La lista ya se pago: solo se puede consultar. */
  closed: boolean;
  budget: number;
  spent: number;
  /** Puede ser negativo: pasarse del presupuesto no se bloquea. */
  remaining: number;
  estimatedTotal: number;
  /** Puede ser negativo. */
  projectedRemaining: number;
  itemsCount: number;
  purchasedCount: number;
  status: MarketStatus;
  projectedStatus: MarketStatus;
  /** Mensaje que acompana al estado, ya redactado por el backend. */
  message: string;
  items: MarketItem[];
}

/** Body de POST /market y PUT /market/:id. */
export interface MarketListInput {
  name: string;
  budget: number;
  /** ISO 8601. */
  dueDate: string;
}

/**
 * Body de POST /market/:id/items y PUT /market/:id/items/:itemId.
 * `price` es el precio real por unidad: al agregar, si viene, el producto
 * entra ya comprado; al editar solo aplica a uno comprado.
 */
export interface MarketItemInput {
  name: string;
  quantity: number;
  estimatedUnitPrice: number;
  price?: number;
}

/** Body de PATCH /market/:id/items/:itemId/mark-as-purchased. */
export interface MarketPurchaseInput {
  price: number;
  quantity: number;
}
