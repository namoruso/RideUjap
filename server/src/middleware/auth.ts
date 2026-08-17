import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from '../types'

// Extender el tipo Request de Express para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload
    }
  }
}

export function verificarToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    res.status(401).json({ error: 'Se requiere autenticación' })
    return
  }

  const secret = process.env['JWT_SECRET']
  if (!secret) {
    res.status(500).json({ error: 'Configuración del servidor incompleta' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload
    req.usuario = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
