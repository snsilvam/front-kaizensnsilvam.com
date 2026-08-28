// Contrato esperado de /users.

/**
 * Copia local que el backend guarda de lo que Firebase afirma del usuario.
 * El id es el UID: la misma cadena con la que el backend guarda al dueño de
 * ingresos, pagos y habitos.
 */
export interface AppUser {
  id: string;
  email: string;
  emailVerified: boolean;
  /** Vacio si el proveedor no lo entrega. */
  name: string;
  /** Vacio con login por correo y contraseña. */
  photoUrl: string;
  signInProvider: string;
  createdAt: string;
  lastLoginAt: string;
}
