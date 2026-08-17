// ── Tipos del servidor RideUJAP ───────────────────────────────────────────────
// Los modelos de datos (Usuario, Viaje, PasajeroViaje) son generados
// automáticamente por Prisma Client — no se definen aquí.

/** Payload del JWT de acceso normal */
export interface JwtPayload {
  id: number
  correo: string
}

/** Payload del JWT temporal para restablecer contraseña */
export interface JwtResetPayload {
  id: number
  correo: string
  proposito: 'reset-password'
}
