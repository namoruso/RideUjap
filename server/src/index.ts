import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'node:path'
import prisma from './db'
import { verificarToken } from './middleware/auth'
import authRouter from './routes/auth'
import { usuarioPublico } from './usuarioPublico'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const port = process.env['PORT'] || 3001

app.use(cors())
app.use(express.json())

function wrapAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void fn(req, res, next).catch(next)
  }
}

const auth = wrapAsync(verificarToken)

function idParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  return parseInt(raw ?? '0', 10)
}

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      ok: true,
      db: 'up',
      clerk: Boolean(process.env['CLERK_SECRET_KEY']),
      auth: process.env['CLERK_SECRET_KEY'] ? 'jwt+clerk' : 'jwt',
    })
  } catch {
    res.status(503).json({ ok: false, db: 'down' })
  }
})

app.use('/api/auth', authRouter)

async function expirarViajes() {
  const ahora = new Date()
  const viajes = await prisma.viaje.findMany({
    where: { estado: { not: 'finalizado' } },
  })
  for (const viaje of viajes) {
    const [hh = '0', mm = '0'] = viaje.hora.split(':')
    const salida = new Date(`${viaje.fecha}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00`)
    if (salida < ahora) {
      await prisma.viaje.update({ where: { id: viaje.id }, data: { estado: 'finalizado' } })
    }
  }
}

type BodyViaje = {
  origen: string
  destino: string
  puntoEncuentro?: string
  fecha: string
  hora: string
  cuposDisponibles: number
  descripcionVehiculo: string
  origenLat?: number | null
  origenLng?: number | null
  destinoLat?: number | null
  destinoLng?: number | null
}

app.get('/api/viajes', async (req: Request, res: Response) => {
  await expirarViajes()

  const where: Record<string, unknown> = { estado: { not: 'finalizado' } }
  if (req.query['origen']) {
    where['origen'] = { contains: req.query['origen'] as string, mode: 'insensitive' }
  }
  if (req.query['destino']) {
    where['destino'] = { contains: req.query['destino'] as string, mode: 'insensitive' }
  }

  const viajes = await prisma.viaje.findMany({
    where,
    include: {
      conductor: {
        select: {
          nombre: true,
          telefono: true,
          placa: true,
          modeloVehiculo: true,
          colorVehiculo: true,
        },
      },
    },
    orderBy: { creadoEn: 'desc' },
  })

  res.json(
    viajes.map((v) => ({
      ...v,
      conductorNombre: v.conductor.nombre,
      conductorTelefono: v.conductor.telefono,
    })),
  )
})

app.get('/api/viajes/conductor/:id', auth, async (req: Request, res: Response) => {
  const viajes = await prisma.viaje.findMany({
    where: { idConductor: idParam(req.params['id']) },
    include: { conductor: { select: { nombre: true, telefono: true } } },
    orderBy: { creadoEn: 'desc' },
  })

  res.json(
    viajes.map((v) => ({
      ...v,
      conductorNombre: v.conductor.nombre,
      conductorTelefono: v.conductor.telefono,
    })),
  )
})

app.get('/api/viajes/:id', async (req: Request, res: Response) => {
  const viaje = await prisma.viaje.findUnique({
    where: { id: idParam(req.params['id']) },
    include: {
      conductor: {
        select: {
          nombre: true,
          telefono: true,
          correo: true,
          placa: true,
          modeloVehiculo: true,
          colorVehiculo: true,
        },
      },
    },
  })

  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }

  res.json({
    ...viaje,
    conductorNombre: viaje.conductor.nombre,
    conductorTelefono: viaje.conductor.telefono,
  })
})

app.post('/api/viajes', auth, async (req: Request, res: Response) => {
  const conductor = await prisma.usuario.findUnique({ where: { id: req.usuario!.id } })
  if (!conductor?.esConductor || !conductor.onboardingCompleto || !conductor.placa) {
    res.status(403).json({
      error: 'Completa tu perfil de conductor (vehículo) antes de publicar un viaje',
    })
    return
  }

  const {
    origen,
    destino,
    puntoEncuentro,
    fecha,
    hora,
    cuposDisponibles,
    descripcionVehiculo,
    origenLat,
    origenLng,
    destinoLat,
    destinoLng,
  } = req.body as BodyViaje

  if (!origen || !destino || !fecha || !hora || !cuposDisponibles) {
    res.status(400).json({ error: 'Faltan campos requeridos' })
    return
  }

  const desc =
    descripcionVehiculo?.trim() ||
    `${conductor.marcaVehiculo ?? ''} ${conductor.modeloVehiculo ?? ''} ${conductor.colorVehiculo ?? ''} — ${conductor.placa}`.trim()

  const viaje = await prisma.viaje.create({
    data: {
      origen,
      destino,
      puntoEncuentro,
      fecha,
      hora,
      cuposTotal: Number(cuposDisponibles),
      cuposDisponibles: Number(cuposDisponibles),
      descripcionVehiculo: desc,
      estado: 'disponible',
      idConductor: req.usuario!.id,
      origenLat: origenLat ?? null,
      origenLng: origenLng ?? null,
      destinoLat: destinoLat ?? null,
      destinoLng: destinoLng ?? null,
    },
    include: { conductor: { select: { nombre: true, telefono: true } } },
  })

  res.status(201).json({
    ...viaje,
    conductorNombre: viaje.conductor.nombre,
    conductorTelefono: viaje.conductor.telefono,
  })
})

app.put('/api/viajes/:id', auth, async (req: Request, res: Response) => {
  const viajeId = idParam(req.params['id'])
  const userId = req.usuario!.id

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }
  if (viaje.idConductor !== userId) {
    res.status(403).json({ error: 'No tienes permiso para actualizar este viaje' })
    return
  }

  const {
    origen,
    destino,
    puntoEncuentro,
    fecha,
    hora,
    cuposDisponibles,
    descripcionVehiculo,
    origenLat,
    origenLng,
    destinoLat,
    destinoLng,
    estado,
  } = req.body as BodyViaje & { estado?: string }

  if (!origen || !destino || !fecha || !hora || cuposDisponibles == null) {
    res.status(400).json({ error: 'Faltan campos requeridos' })
    return
  }

  const ocupados = viaje.cuposTotal - viaje.cuposDisponibles
  const nuevoTotal = Number(cuposDisponibles)
  if (Number.isNaN(nuevoTotal) || nuevoTotal < ocupados) {
    res.status(400).json({
      error: `cuposDisponibles no puede ser menor que los asientos ya ocupados (${ocupados})`,
    })
    return
  }

  const viajeActualizado = await prisma.viaje.update({
    where: { id: viajeId },
    data: {
      origen,
      destino,
      puntoEncuentro: puntoEncuentro ?? null,
      fecha,
      hora,
      cuposTotal: nuevoTotal,
      cuposDisponibles: nuevoTotal - ocupados,
      descripcionVehiculo: descripcionVehiculo?.trim() || viaje.descripcionVehiculo,
      estado: estado ?? viaje.estado,
      origenLat: origenLat ?? null,
      origenLng: origenLng ?? null,
      destinoLat: destinoLat ?? null,
      destinoLng: destinoLng ?? null,
    },
    include: { conductor: { select: { nombre: true, telefono: true } } },
  })

  res.json({
    ...viajeActualizado,
    conductorNombre: viajeActualizado.conductor.nombre,
    conductorTelefono: viajeActualizado.conductor.telefono,
  })
})

app.delete('/api/viajes/:id', auth, async (req: Request, res: Response) => {
  const viajeId = idParam(req.params['id'])
  const userId = req.usuario!.id

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }
  if (viaje.idConductor !== userId) {
    res.status(403).json({ error: 'No tienes permiso para eliminar este viaje' })
    return
  }

  await prisma.pasajeroViaje.deleteMany({ where: { idViaje: viajeId } })
  await prisma.viaje.delete({ where: { id: viajeId } })

  res.json({ message: 'Viaje eliminado correctamente' })
})

app.patch('/api/viajes/:id/hora', auth, async (req: Request, res: Response) => {
  const viajeId = idParam(req.params['id'])
  const userId = req.usuario!.id
  const { hora } = req.body as { hora: string }

  if (!hora) {
    res.status(400).json({ error: 'La nueva hora es requerida' })
    return
  }

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }
  if (viaje.idConductor !== userId) {
    res.status(403).json({ error: 'No tienes permiso para editar este viaje' })
    return
  }

  const viajeActualizado = await prisma.viaje.update({
    where: { id: viajeId },
    data: { hora },
    include: { conductor: { select: { nombre: true, telefono: true } } },
  })

  res.json({
    message: 'Hora del viaje actualizada',
    viaje: {
      ...viajeActualizado,
      conductorNombre: viajeActualizado.conductor.nombre,
      conductorTelefono: viajeActualizado.conductor.telefono,
    },
  })
})

app.get('/api/viajes/:id/pasajeros', auth, async (req: Request, res: Response) => {
  const viajeId = idParam(req.params['id'])
  const userId = req.usuario!.id

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) {
    res.status(404).json({ error: 'Viaje no encontrado' })
    return
  }
  if (viaje.idConductor !== userId) {
    res.status(403).json({ error: 'Solo el conductor puede ver la lista de pasajeros' })
    return
  }

  const uniones = await prisma.pasajeroViaje.findMany({
    where: { idViaje: viajeId },
    include: { usuario: { select: { id: true, nombre: true, telefono: true } } },
    orderBy: { unidoEn: 'asc' },
  })

  res.json(uniones.map((u) => u.usuario))
})

app.post('/api/viajes/:id/unirse', auth, async (req: Request, res: Response) => {
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
  if (viaje.estado === 'finalizado') {
    res.status(400).json({ error: 'Este viaje ya finalizó' })
    return
  }
  if (viaje.cuposDisponibles <= 0) {
    res.status(400).json({ error: 'No hay cupos disponibles' })
    return
  }

  try {
    await prisma.pasajeroViaje.create({ data: { idUsuario: userId, idViaje: viajeId } })
  } catch {
    res.status(409).json({ error: 'Ya estás unido a este viaje' })
    return
  }

  const nuevosCupos = viaje.cuposDisponibles - 1
  const nuevoEstado = nuevosCupos === 0 ? 'lleno' : viaje.estado

  const viajeActualizado = await prisma.viaje.update({
    where: { id: viajeId },
    data: { cuposDisponibles: nuevosCupos, estado: nuevoEstado },
    include: { conductor: { select: { nombre: true, telefono: true } } },
  })

  res.json({
    message: 'Te has unido al viaje',
    viaje: {
      ...viajeActualizado,
      conductorNombre: viajeActualizado.conductor.nombre,
      conductorTelefono: viajeActualizado.conductor.telefono,
    },
  })
})

app.delete('/api/viajes/:id/unirse', auth, async (req: Request, res: Response) => {
  const viajeId = idParam(req.params['id'])
  const userId = req.usuario!.id

  const union = await prisma.pasajeroViaje.findUnique({
    where: { idUsuario_idViaje: { idUsuario: userId, idViaje: viajeId } },
  })

  if (!union) {
    res.status(400).json({ error: 'No estás en este viaje' })
    return
  }

  await prisma.pasajeroViaje.delete({ where: { id: union.id } })

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (viaje) {
    const nuevoEstado = viaje.estado === 'lleno' ? 'disponible' : viaje.estado
    await prisma.viaje.update({
      where: { id: viajeId },
      data: { cuposDisponibles: viaje.cuposDisponibles + 1, estado: nuevoEstado },
    })
  }

  res.json({ message: 'Has abandonado el viaje' })
})

app.get('/api/usuarios/:id', async (req: Request, res: Response) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: idParam(req.params['id']) },
    select: {
      id: true,
      nombre: true,
      correo: true,
      telefono: true,
      esConductor: true,
      onboardingCompleto: true,
      marcaVehiculo: true,
      placa: true,
      modeloVehiculo: true,
      colorVehiculo: true,
      puestosVehiculo: true,
    },
  })
  if (!usuario) {
    res.status(404).json({ error: 'Usuario no encontrado' })
    return
  }
  res.json(usuario)
})

app.patch('/api/usuarios/me/rol', auth, async (req: Request, res: Response) => {
  const { rol } = req.body as { rol?: 'viajero' | 'conductor' }
  if (rol !== 'viajero' && rol !== 'conductor') {
    res.status(400).json({ error: 'Rol inválido. Usa viajero o conductor.' })
    return
  }

  if (rol === 'viajero') {
    const usuario = await prisma.usuario.update({
      where: { id: req.usuario!.id },
      data: {
        esConductor: false,
        onboardingCompleto: true,
      },
    })
    res.json(usuarioPublico(usuario))
    return
  }

  const usuario = await prisma.usuario.update({
    where: { id: req.usuario!.id },
    data: {
      esConductor: true,
      onboardingCompleto: false,
    },
  })
  res.json(usuarioPublico(usuario))
})

app.patch('/api/usuarios/me/vehiculo', auth, async (req: Request, res: Response) => {
  const { placa, marcaVehiculo, modeloVehiculo, colorVehiculo, puestosVehiculo } = req.body as {
    placa?: string
    marcaVehiculo?: string
    modeloVehiculo?: string
    colorVehiculo?: string
    puestosVehiculo?: number
  }

  if (!placa?.trim() || !marcaVehiculo?.trim() || !modeloVehiculo?.trim() || !colorVehiculo?.trim()) {
    res.status(400).json({ error: 'Marca, modelo, color y placa son obligatorios' })
    return
  }

  const puestos = Number(puestosVehiculo)
  if (!Number.isFinite(puestos) || puestos < 1 || puestos > 8) {
    res.status(400).json({ error: 'Los puestos deben estar entre 1 y 8' })
    return
  }

  const usuario = await prisma.usuario.update({
    where: { id: req.usuario!.id },
    data: {
      placa: placa.trim().toUpperCase(),
      marcaVehiculo: marcaVehiculo.trim(),
      modeloVehiculo: modeloVehiculo.trim(),
      colorVehiculo: colorVehiculo.trim(),
      puestosVehiculo: puestos,
      esConductor: true,
      onboardingCompleto: true,
    },
  })

  res.json(usuarioPublico(usuario))
})

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

app.listen(port, () => {
  console.log(`✅ Backend RideUJAP corriendo en http://localhost:${port}`)
  if (!process.env['JWT_SECRET']) console.warn('⚠️  JWT_SECRET no configurado')
  if (process.env['CLERK_SECRET_KEY']) console.log('🔐 Clerk habilitado (JWT + Clerk)')
})
