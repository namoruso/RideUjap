import { Router, type Request, type Response } from 'express'
import { ObjectId } from 'mongodb'
import { verificarToken } from '../middleware/auth'
import { wrapAsync } from '../lib/http'
import { coleccion, mongoConfigurado } from '../mongo'
import { suscribir, type Notificacion } from '../notificaciones'

const router = Router()

router.use(wrapAsync(verificarToken))
router.use((_req, res, next) => {
  if (!mongoConfigurado()) {
    res.status(503).json({ error: 'Notificaciones no configuradas en el servidor' })
    return
  }
  next()
})

router.get('/', wrapAsync(async (req: Request, res: Response) => {
  const limite = Math.min(Math.max(Number(req.query['limite']) || 20, 1), 50)
  const filtro: Record<string, unknown> = { idUsuario: req.usuario!.id }
  const antes = req.query['antes']
  if (typeof antes === 'string' && ObjectId.isValid(antes)) filtro['_id'] = { $lt: new ObjectId(antes) }

  const col = await coleccion<Notificacion>('notificaciones')
  const [items, noLeidas] = await Promise.all([
    col.find(filtro).sort({ _id: -1 }).limit(limite).toArray(),
    col.countDocuments({ idUsuario: req.usuario!.id, leida: false }),
  ])
  res.json({ items, noLeidas })
}))

router.patch('/leidas', wrapAsync(async (req: Request, res: Response) => {
  const col = await coleccion<Notificacion>('notificaciones')
  await col.updateMany({ idUsuario: req.usuario!.id, leida: false }, { $set: { leida: true } })
  res.json({ ok: true })
}))

router.patch('/:id/leida', wrapAsync(async (req: Request, res: Response) => {
  const id = String(req.params['id'])
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Id inválido' })
    return
  }
  const col = await coleccion<Notificacion>('notificaciones')
  const r = await col.updateOne(
    { _id: new ObjectId(id), idUsuario: req.usuario!.id },
    { $set: { leida: true } },
  )
  if (!r.matchedCount) {
    res.status(404).json({ error: 'Notificación no encontrada' })
    return
  }
  res.json({ ok: true })
}))

/** SSE. Se consume con fetch + Authorization (EventSource no permite headers). */
router.get('/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.write(': conectado\n\n')
  const baja = suscribir(req.usuario!.id, res)
  const latido = setInterval(() => res.write(': ping\n\n'), 25_000)
  req.on('close', () => {
    clearInterval(latido)
    baja()
  })
})

export default router
