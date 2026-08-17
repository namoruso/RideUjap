import express, { type Request, type Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import prisma from './db'
import { verificarToken } from './middleware/auth'
import authRouter from './routes/auth'

dotenv.config()

const app = express()
const port = process.env['PORT'] || 3001

app.use(cors())
app.use(express.json())

// ── Auth ──────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter)

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Marca como finalizado los viajes cuya fecha+hora ya pasó */
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

// ── Viajes ────────────────────────────────────────────────────────────────────

// GET /api/viajes — público
app.get('/api/viajes', async (req: Request, res: Response) => {
  await expirarViajes()

  const where: Record<string, unknown> = { estado: { not: 'finalizado' } }
  if (req.query['origen']) where['origen'] = { contains: req.query['origen'] as string }
  if (req.query['destino']) where['destino'] = { contains: req.query['destino'] as string }

  const viajes = await prisma.viaje.findMany({
    where,
    include: { conductor: { select: { nombre: true, telefono: true } } },
    orderBy: { creadoEn: 'desc' },
  })

  res.json(
    viajes.map(v => ({
      ...v,
      conductorNombre: v.conductor.nombre,
      conductorTelefono: v.conductor.telefono,
    })),
  )
})

// GET /api/viajes/:id — público
app.get('/api/viajes/:id', async (req: Request, res: Response) => {
  const viaje = await prisma.viaje.findUnique({
    where: { id: parseInt(req.params['id'] ?? '0') },
    include: { conductor: { select: { nombre: true, telefono: true, correo: true } } },
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

// POST /api/viajes — requiere autenticación
app.post('/api/viajes', verificarToken, async (req: Request, res: Response) => {
  const { origen, destino, puntoEncuentro, fecha, hora, cuposDisponibles, descripcionVehiculo } =
    req.body as {
      origen: string
      destino: string
      puntoEncuentro?: string
      fecha: string
      hora: string
      cuposDisponibles: number
      descripcionVehiculo: string
    }

  if (!origen || !destino || !fecha || !hora || !cuposDisponibles || !descripcionVehiculo) {
    res.status(400).json({ error: 'Faltan campos requeridos' })
    return
  }

  const viaje = await prisma.viaje.create({
    data: {
      origen,
      destino,
      puntoEncuentro,
      fecha,
      hora,
      cuposTotal: Number(cuposDisponibles),
      cuposDisponibles: Number(cuposDisponibles),
      descripcionVehiculo,
      estado: 'disponible',
      idConductor: req.usuario!.id,
    },
    include: { conductor: { select: { nombre: true, telefono: true } } },
  })

  res.status(201).json({
    ...viaje,
    conductorNombre: viaje.conductor.nombre,
    conductorTelefono: viaje.conductor.telefono,
  })
})

// GET /api/viajes/conductor/:id — viajes de un conductor
app.get('/api/viajes/conductor/:id', verificarToken, async (req: Request, res: Response) => {
  const viajes = await prisma.viaje.findMany({
    where: { idConductor: parseInt(req.params['id'] ?? '0') },
    include: { conductor: { select: { nombre: true, telefono: true } } },
    orderBy: { creadoEn: 'desc' },
  })

  res.json(viajes.map(v => ({ ...v, conductorNombre: v.conductor.nombre, conductorTelefono: v.conductor.telefono })))
})

// DELETE /api/viajes/:id — elimina un viaje
app.delete('/api/viajes/:id', verificarToken, async (req: Request, res: Response) => {
  const viajeId = parseInt(req.params['id'] ?? '0')
  const userId = req.usuario!.id

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) { res.status(404).json({ error: 'Viaje no encontrado' }); return }
  if (viaje.idConductor !== userId) { res.status(403).json({ error: 'No tienes permiso para eliminar este viaje' }); return }

  await prisma.pasajeroViaje.deleteMany({ where: { idViaje: viajeId } })
  await prisma.viaje.delete({ where: { id: viajeId } })

  res.json({ message: 'Viaje eliminado correctamente' })
})

// PATCH /api/viajes/:id/hora — edita la hora de un viaje
app.patch('/api/viajes/:id/hora', verificarToken, async (req: Request, res: Response) => {
  const viajeId = parseInt(req.params['id'] ?? '0')
  const userId = req.usuario!.id
  const { hora } = req.body as { hora: string }

  if (!hora) { res.status(400).json({ error: 'La nueva hora es requerida' }); return }

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) { res.status(404).json({ error: 'Viaje no encontrado' }); return }
  if (viaje.idConductor !== userId) { res.status(403).json({ error: 'No tienes permiso para editar este viaje' }); return }

  const viajeActualizado = await prisma.viaje.update({
    where: { id: viajeId },
    data: { hora },
    include: { conductor: { select: { nombre: true, telefono: true } } },
  })

  res.json({
    message: 'Hora del viaje actualizada',
    viaje: { ...viajeActualizado, conductorNombre: viajeActualizado.conductor.nombre, conductorTelefono: viajeActualizado.conductor.telefono },
  })
})

// GET /api/viajes/:id/pasajeros — lista de pasajeros para el conductor
app.get('/api/viajes/:id/pasajeros', verificarToken, async (req: Request, res: Response) => {
  const viajeId = parseInt(req.params['id'] ?? '0')
  const userId = req.usuario!.id

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) { res.status(404).json({ error: 'Viaje no encontrado' }); return }
  if (viaje.idConductor !== userId) { res.status(403).json({ error: 'Solo el conductor puede ver la lista de pasajeros' }); return }

  const uniones = await prisma.pasajeroViaje.findMany({
    where: { idViaje: viajeId },
    include: { usuario: { select: { id: true, nombre: true, telefono: true } } },
    orderBy: { unidoEn: 'asc' },
  })

  const pasajeros = uniones.map(u => u.usuario)
  res.json(pasajeros)
})

// POST /api/viajes/:id/unirse — requiere autenticación
app.post('/api/viajes/:id/unirse', verificarToken, async (req: Request, res: Response) => {
  await expirarViajes()

  const viajeId = parseInt(req.params['id'] ?? '0')
  const userId = req.usuario!.id

  const viaje = await prisma.viaje.findUnique({ where: { id: viajeId } })
  if (!viaje) { res.status(404).json({ error: 'Viaje no encontrado' }); return }
  if (viaje.idConductor === userId) { res.status(400).json({ error: 'No puedes unirte a tu propio viaje' }); return }
  if (viaje.estado === 'finalizado') { res.status(400).json({ error: 'Este viaje ya finalizó' }); return }
  if (viaje.cuposDisponibles <= 0) { res.status(400).json({ error: 'No hay cupos disponibles' }); return }

  // Intentar crear la unión — la restricción UNIQUE de Prisma rechaza duplicados
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
    viaje: { ...viajeActualizado, conductorNombre: viajeActualizado.conductor.nombre, conductorTelefono: viajeActualizado.conductor.telefono },
  })
})

// DELETE /api/viajes/:id/unirse — abandona un viaje
app.delete('/api/viajes/:id/unirse', verificarToken, async (req: Request, res: Response) => {
  const viajeId = parseInt(req.params['id'] ?? '0')
  const userId = req.usuario!.id

  const union = await prisma.pasajeroViaje.findUnique({
    where: { idUsuario_idViaje: { idUsuario: userId, idViaje: viajeId } },
  })

  if (!union) { res.status(400).json({ error: 'No estás en este viaje' }); return }

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

// ── Usuarios ──────────────────────────────────────────────────────────────────

// GET /api/usuarios/:id — público
app.get('/api/usuarios/:id', async (req: Request, res: Response) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: parseInt(req.params['id'] ?? '0') },
    select: { id: true, nombre: true, correo: true, telefono: true, esConductor: true },
  })
  if (!usuario) { res.status(404).json({ error: 'Usuario no encontrado' }); return }
  res.json(usuario)
})

app.listen(port, () => {
  console.log(`✅ Backend RideUJAP corriendo en http://localhost:${port}`)
  if (!process.env['JWT_SECRET']) {
    console.warn('⚠️  JWT_SECRET no configurado')
  }
})
