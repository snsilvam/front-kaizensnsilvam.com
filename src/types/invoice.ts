// Contrato de /invoices. Montos en COP enteros. Lo que el modelo no pudo leer
// llega vacío ("" o 0) e issuedOn en null.

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  issuerName: string;
  /** NIT del emisor. */
  issuerTaxId: string;
  invoiceNumber: string;
  /** Fecha de emisión "YYYY-MM-DD", o null si no se pudo leer. */
  issuedOn: string | null;
  subtotal: number;
  /** IVA más impuesto al consumo. */
  tax: number;
  total: number;
  /** CUFE/CUDE de la factura electrónica; "" si no aparece. */
  cufe: string;
  items: InvoiceItem[];
  /** Modelo de Claude que leyó la factura. */
  extractionModel: string;
  /** Momento de la captura, ISO 8601. */
  createdAt: string;
}
