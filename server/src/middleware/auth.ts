import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createClerkClient, verifyToken } from '@clerk/backend'
import prisma from '../db'
import type { JwtPayload } from '../types'

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload
    }
  }
}

const DOMINIO_UJAP = '@ujap.edu.ve'

function clerkHabilitado(): boolean {
  return Boolean(process.env['CLERK_SECRET_KEY'])
}

function getJwtSecret(): string | undefined {
  return process.env['JWT_SECRET']
}

async function resolverUsuarioDesdeClerk(clerkUserId: string, correo?: string | null) {
  let usuario = await prisma.usuario.findUnique({ where: { clerkId: clerkUserId } })
  if (usuario) return usuario

  if (correo) {
    const normalizado = correo.toLowerCase()
    usuario = await prisma.usuario.findUnique({ where: { correo: normalizado } })
    if (usuario) {
      return prisma.usuario.update({
        where: { id: usuario.id },
        data: { clerkId: clerkUserId, correoVerificado: true },
      })
    }
  }

  return null
}

/**
 * Acepta:
 * 1) Bearer session token de Clerk (si CLERK_SECRET_KEY está configurado)
 * 2) Bearer JWT propio (login clásico)
 */
export async function verificarToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization']
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    res.status(401).json({ error: 'Se requiere autenticación' })
    return
  }

  // ── Clerk ───────────────────────────────────────────────────────────────────
  if (clerkHabilitado()) {
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env['CLERK_SECRET_KEY']!,
        clockSkewInMs: 60_000,
        authorizedParties: [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:3000',
          'http://localhost:4173',
        ],
      })
      const clerk = createClerkClient({ secretKey: process.env['CLERK_SECRET_KEY']! })
      const clerkUser = await clerk.users.getUser(payload.sub)
      const correo =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress

      if (correo && !correo.toLowerCase().endsWith(DOMINIO_UJAP)) {
        res.status(403).json({ error: 'Solo se permiten correos @ujap.edu.ve' })
        return
      }

      const usuario = await resolverUsuarioDesdeClerk(payload.sub, correo)
      if (!usuario) {
        res.status(401).json({
          error: 'Usuario Clerk no sincronizado. Vuelve a iniciar sesión.',
        })
        return
      }

      req.usuario = { id: usuario.id, correo: usuario.correo }
      next()
      return
    } catch (e) {
      // Si parece JWT de Clerk (iss clerk) no caigas al JWT local con mensaje confuso
      try {
        const preview = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString()) as {
          iss?: string
        }
        if (preview.iss?.includes('clerk')) {
          console.warn('[auth] Clerk verifyToken falló:', e)
          res.status(401).json({
            error: 'Sesión Clerk expirada o inválida. Recarga e inicia sesión de nuevo.',
          })
          return
        }
      } catch {
        // ignore decode errors
      }
    }
  }

  // ── JWT local ───────────────────────────────────────────────────────────────
  const secret = getJwtSecret()
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
