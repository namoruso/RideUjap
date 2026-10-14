/**
 * Notificaciones (colección MongoDB `notificaciones`) + difusión en vivo por SSE.
 * `notificar()` nunca lanza: una falla de Mongo no debe romper la operación de negocio.
 */
import type { Response } from 'express'
import { ObjectId } from 'mongodb'
import { coleccion, mongoConfigurado } from './mongo'

export type TipoNotificacion =
  | 'pasajero_unido'
  | 'pasajero_abandono'
  | 'viaje_actualizado'
  | 'viaje_cancelado'

export type Notificacion = {
  _id?: ObjectId
  idUsuario: number
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  leida: boolean
  creadoEn: Date
  payload: Record<string, unknown>
  canal: ('in_app' | 'email')[]
  meta: { app: 'RideUJAP'; version: '1.0' }
}

const DIAS_RETENCION = 90

export async function asegurarIndices(): Promise<void> {
  if (!mongoConfigurado()) return
  const col = await coleccion<Notificacion>('notificaciones')
  await col.createIndex({ idUsuario: 1, creadoEn: -1 })
  await col.createIndex({ creadoEn: 1 }, { expireAfterSeconds: DIAS_RETENCION * 86400 })
}

// ── SSE: conexiones abiertas por usuario ─────────────────────────────────────
const suscriptores = new Map<number, Set<Response>>()

export function suscribir(idUsuario: number, res: Response): () => void {
  const set = suscriptores.get(idUsuario) ?? new Set<Response>()
  set.add(res)
  suscriptores.set(idUsuario, set)
  return () => {
    set.delete(res)
    if (!set.size) suscriptores.delete(idUsuario)
  }
}

function difundir(idUsuario: number, doc: Notificacion) {
  for (const res of suscriptores.get(idUsuario) ?? []) {
    res.write(`event: notificacion\ndata: ${JSON.stringify(doc)}\n\n`)
  }
}

export async function notificar(
  idUsuario: number,
  tipo: TipoNotificacion,
  titulo: string,
  mensaje: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  if (!mongoConfigurado()) return
  try {
    const doc: Notificacion = {
      idUsuario,
      tipo,
      titulo,
      mensaje,
      leida: false,
      creadoEn: new Date(),
      payload,
      canal: ['in_app'],
      meta: { app: 'RideUJAP', version: '1.0' },
    }
    const col = await coleccion<Notificacion>('notificaciones')
    const { insertedId } = await col.insertOne(doc)
    difundir(idUsuario, { ...doc, _id: insertedId })
  } catch (e) {
    console.error('[notificaciones] no se pudo guardar', e)
  }
}
