import type { Request, Response, NextFunction } from 'express'

/** Envuelve handlers async para que los errores lleguen al middleware de errores. */
export function wrapAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    void fn(req, res, next).catch(next)
  }
}

/** Id numérico de un parámetro de ruta; NaN si no es un entero válido. */
export function idParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  return /^\d+$/.test(raw ?? '') ? parseInt(raw!, 10) : NaN
}
