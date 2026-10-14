import { Router, type Request, type Response } from 'express'
import prisma from '../db'
import { verificarToken } from '../middleware/auth'
import { usuarioPublico } from '../usuarioPublico'
import { wrapAsync, idParam } from '../lib/http'

const router = Router()
const auth = wrapAsync(verificarToken)

router.get('/:id', wrapAsync(async (req: Request, res: Response) => {
  const id = idParam(req.params['id'])
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Id inválido' })
    return
  }
  const usuario = await prisma.usuario.findUnique({ where: { id } })
  if (!usuario) {
    res.status(404).json({ error: 'Usuario no encontrado' })
    return
  }
  res.json(usuarioPublico(usuario))
}))

router.patch('/me/rol', auth, wrapAsync(async (req: Request, res: Response) => {
  const { rol } = req.body as { rol?: 'viajero' | 'conductor' }
  if (rol !== 'viajero' && rol !== 'conductor') {
    res.status(400).json({ error: 'Rol inválido. Usa viajero o conductor.' })
    return
  }
  const esConductor = rol === 'conductor'
  const usuario = await prisma.usuario.update({
    where: { id: req.usuario!.id },
    // un conductor debe completar el vehículo antes de terminar el onboarding
    data: { esConductor, onboardingCompleto: !esConductor },
  })
  res.json(usuarioPublico(usuario))
}))

router.patch('/me/vehiculo', auth, wrapAsync(async (req: Request, res: Response) => {
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
  if (!Number.isInteger(puestos) || puestos < 1 || puestos > 8) {
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
}))

export default router
