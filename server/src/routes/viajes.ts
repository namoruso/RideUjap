import { Router, type Request, type Response } from 'express'
import prisma from '../db'
import { verificarToken } from '../middleware/auth'
import { wrapAsync, idParam } from '../lib/http'
import {
  ESTADOS_VIAJE,
  salidaDe,
  serializarViaje,
  validarDatosViaje,
  type EstadoViaje,
} from '../lib/viajes'

const router = Router()
const auth = wrapAsync(verificarToken)

const CONDUCTOR_LISTA = {
  select: { nombre: true, telefono: true, placa: true, modeloVehiculo: true, colorVehiculo: true },
} as const
const CONDUCTOR_BASICO = { select: { nombre: true, telefono: true } } as const

router.param('id', (req, res, next, value: string) => {
  if (Number.isNaN(idParam(value))) {
    res.status(400).json({ error: 'Id inválido' })
    return
  }
  next()
})

/** Marca como finalizados los viajes cuya hora de salida ya pasó. */
async function expirarViajes() {
  const ahora = Date.now()
  const pendientes = await prisma.viaje.findMany({
    where: { estado: { notIn: ['finalizado', 'cancelado'] } },
    select: { id: true, fecha: true, hora: true },
  })
  const vencidos = pendientes
    .filter((v) => salidaDe(v.fecha, v.hora).getTime() < ahora)
    .map((v) => v.id)
  if (vencidos.length) {
    await prisma.viaje.updateMany({ where: { id: { in: vencidos } }, data: { estado: 'finalizado' } })
  }
}

router.get('/', wrapAsync(async (req: Request, res: Response) => {
  await expirarViajes()

  const where: Record<string, unknown> = { estado: { notIn: ['finalizado', 'cancelado'] } }
  for (const campo of ['origen', 'destino'] as const) {
    const q = req.query[campo]
    if (typeof q === 'string' && q.trim()) {
      where[campo] = { contains: q.trim(), mode: 'insensitive' }
    }
  }

  const viajes = await prisma.viaje.findMany({
    where,
    include: { conductor: CONDUCTOR_LISTA },
    orderBy: { creadoEn: 'desc' },
  })
  res.json(viajes.map(serializarViaje))
}))

router.get('/conductor/:id', auth, wrapAsync(async (req: Request, res: Response) => {
  const id = idParam(req.params['id'])
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Id inválido' })
    return
  }
  const viajes = await prisma.viaje.findMany({
    where: { idConductor: id },
    include: { conductor: CONDUCTOR_BASICO },
    orderBy: { creadoEn: 'desc' },
  })
  res.json(viajes.map(serializarViaje))
}))

router.get('/:id', wrapAsync(async (req: Request, res: Response) => {
  const viaje = await prisma.viaje.findUnique({
    where: { id: idParam(req.params['id']) },
    include: { conductor: CONDUCTOR_LISTA },
  })
  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }
  res.json(serializarViaje(viaje))
}))

router.post('/', auth, wrapAsync(async (req: Request, res: Response) => {
  const conductor = await prisma.usuario.findUnique({ where: { id: req.usuario!.id } })
  if (!conductor?.esConductor || !conductor.onboardingCompleto || !conductor.placa) {
    res.status(403).json({
      error: 'Completa tu perfil de conductor (vehículo) antes de publicar un viaje',
    })
    return
  }

  const v = validarDatosViaje(req.body)
  if (!v.ok) {
    res.status(400).json({ error: v.error })
    return
  }
  const d = v.datos
  if (salidaDe(d.fecha, d.hora).getTime() <= Date.now()) {
    res.status(400).json({ error: 'La salida debe ser en el futuro' })
    return
  }

  const descripcionVehiculo =
    d.descripcionVehiculo ||
    `${conductor.marcaVehiculo ?? ''} ${conductor.modeloVehiculo ?? ''} ${conductor.colorVehiculo ?? ''} — ${conductor.placa}`.trim()

  const { cuposDisponibles, ...resto } = d
  const viaje = await prisma.viaje.create({
    data: {
      ...resto,
      descripcionVehiculo,
      cuposTotal: cuposDisponibles,
      cuposDisponibles,
      estado: 'disponible',
      idConductor: conductor.id,
    },
    include: { conductor: CONDUCTOR_BASICO },
  })
  res.status(201).json(serializarViaje(viaje))
}))

router.put('/:id', auth, wrapAsync(async (req: Request, res: Response) => {
  const viajeId = idParam(req.params['id'])
  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }
  if (viaje.idConductor !== req.usuario!.id) {
    res.status(403).json({ error: 'No tienes permiso para actualizar este viaje' })
    return
  }

  const v = validarDatosViaje(req.body)
  if (!v.ok) {
    res.status(400).json({ error: v.error })
    return
  }
  const d = v.datos

  const estadoPedido = (req.body as { estado?: unknown }).estado
  if (estadoPedido != null && !ESTADOS_VIAJE.includes(estadoPedido as EstadoViaje)) {
    res.status(400).json({ error: `Estado inválido. Usa: ${ESTADOS_VIAJE.join(', ')}` })
    return
  }

  const cambioHorario = d.fecha !== viaje.fecha || d.hora !== viaje.hora
  if (cambioHorario && salidaDe(d.fecha, d.hora).getTime() <= Date.now()) {
    res.status(400).json({ error: 'La salida debe ser en el futuro' })
    return
  }

  const ocupados = viaje.cuposTotal - viaje.cuposDisponibles
  if (d.cuposDisponibles < ocupados) {
    res.status(400).json({
      error: `Los cupos no pueden ser menos que los asientos ya ocupados (${ocupados})`,
    })
    return
  }
  const libres = d.cuposDisponibles - ocupados

  let estado = (estadoPedido as EstadoViaje | undefined) ?? (viaje.estado as EstadoViaje)
  if (estado === 'disponible' && libres === 0) estado = 'lleno'
  if (estado === 'lleno' && libres > 0) estado = 'disponible'

  const { cuposDisponibles: _total, ...resto } = d
  const actualizado = await prisma.viaje.update({
    where: { id: viajeId },
    data: {
      ...resto,
      descripcionVehiculo: d.descripcionVehiculo || viaje.descripcionVehiculo,
      cuposTotal: d.cuposDisponibles,
      cuposDisponibles: libres,
      estado,
    },
    include: { conductor: CONDUCTOR_BASICO },
  })
  res.json(serializarViaje(actualizado))
}))

router.delete('/:id', auth, wrapAsync(async (req: Request, res: Response) => {
  const viajeId = idParam(req.params['id'])
  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }
  if (viaje.idConductor !== req.usuario!.id) {
    res.status(403).json({ error: 'No tienes permiso para eliminar este viaje' })
    return
  }
  await prisma.$transaction([
    prisma.pasajeroViaje.deleteMany({ where: { idViaje: viajeId } }),
    prisma.viaje.delete({ where: { id: viajeId } }),
  ])
  res.json({ message: 'Viaje eliminado correctamente' })
}))

router.patch('/:id/hora', auth, wrapAsync(async (req: Request, res: Response) => {
  const viajeId = idParam(req.params['id'])
  const hora = (req.body as { hora?: unknown }).hora
  if (typeof hora !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    res.status(400).json({ error: 'Hora inválida (usa HH:MM, 24 horas)' })
    return
  }

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }
  if (viaje.idConductor !== req.usuario!.id) {
    res.status(403).json({ error: 'No tienes permiso para editar este viaje' })
    return
  }
  if (salidaDe(viaje.fecha, hora).getTime() <= Date.now()) {
    res.status(400).json({ error: 'La salida debe ser en el futuro' })
    return
  }

  const actualizado = await prisma.viaje.update({
    where: { id: viajeId },
    data: { hora },
    include: { conductor: CONDUCTOR_BASICO },
  })
  res.json({ message: 'Hora del viaje actualizada', viaje: serializarViaje(actualizado) })
}))

router.get('/:id/pasajeros', auth, wrapAsync(async (req: Request, res: Response) => {
  const viajeId = idParam(req.params['id'])
  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }
  if (viaje.idConductor !== req.usuario!.id) {
    res.status(403).json({ error: 'Solo el conductor puede ver la lista de pasajeros' })
    return
  }
  const uniones = await prisma.pasajeroViaje.findMany({
    where: { idViaje: viajeId },
    include: { usuario: { select: { id: true, nombre: true, telefono: true } } },
    orderBy: { unidoEn: 'asc' },
  })
  res.json(uniones.map((u) => u.usuario))
}))

router.post('/:id/unirse', auth, wrapAsync(async (req: Request, res: Response) => {
  await expirarViajes()
  const viajeId = idParam(req.params['id'])
  const userId = req.usuario!.id

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }
  if (viaje.idConductor === userId) {
    res.status(400).json({ error: 'No puedes unirte a tu propio viaje' })
    return
  }
  if (viaje.estado === 'finalizado' || viaje.estado === 'cancelado') {
    res.status(400).json({ error: 'Este viaje ya no está disponible' })
    return
  }

  const ya = await prisma.pasajeroViaje.findUnique({
    where: { idUsuario_idViaje: { idUsuario: userId, idViaje: viajeId } },
  })
  if (ya) {
    res.status(409).json({ error: 'Ya estás unido a este viaje' })
    return
  }

  // Decremento atómico: dos pasajeros simultáneos no pueden tomar el último cupo a la vez.
  const actualizado = await prisma.$transaction(async (tx) => {
    const tomado = await tx.viaje.updateMany({
      where: { id: viajeId, cuposDisponibles: { gt: 0 }, estado: 'disponible' },
      data: { cuposDisponibles: { decrement: 1 } },
    })
    if (tomado.count === 0) return null
    await tx.pasajeroViaje.create({ data: { idUsuario: userId, idViaje: viajeId } })
    const v = await tx.viaje.findUniqueOrThrow({ where: { id: viajeId } })
    return tx.viaje.update({
      where: { id: viajeId },
      data: v.cuposDisponibles === 0 ? { estado: 'lleno' } : {},
      include: { conductor: CONDUCTOR_BASICO },
    })
  })

  if (!actualizado) {
    res.status(400).json({ error: 'No hay cupos disponibles' })
    return
  }
  res.json({ message: 'Te has unido al viaje', viaje: serializarViaje(actualizado) })
}))

router.delete('/:id/unirse', auth, wrapAsync(async (req: Request, res: Response) => {
  const viajeId = idParam(req.params['id'])
  const userId = req.usuario!.id

  const union = await prisma.pasajeroViaje.findUnique({
    where: { idUsuario_idViaje: { idUsuario: userId, idViaje: viajeId } },
  })
  if (!union) {
    res.status(400).json({ error: 'No estás en este viaje' })
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.pasajeroViaje.delete({ where: { id: union.id } })
    await tx.viaje.updateMany({
      where: { id: viajeId },
      data: { cuposDisponibles: { increment: 1 } },
    })
    await tx.viaje.updateMany({ where: { id: viajeId, estado: 'lleno' }, data: { estado: 'disponible' } })
  })
  res.json({ message: 'Has abandonado el viaje' })
}))

export default router
