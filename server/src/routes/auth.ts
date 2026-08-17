import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../db'
import { enviarCodigo } from '../email'

const router = Router()

const SALT_ROUNDS = 10
const TOKEN_EXPIRA = '7d'
const RESET_TOKEN_EXPIRA = '10m'
const CODIGO_EXPIRA_MS = 10 * 60 * 1000
const MAX_INTENTOS = 5

// Códigos de recuperación en memoria (no necesitan persistencia)
const codigosRecuperacion = new Map<
  string,
  { codigo: string; expira: Date; intentos: number }
>()

function getSecret(): string {
  const s = process.env['JWT_SECRET']
  if (!s) throw new Error('JWT_SECRET no configurado')
  return s
}

const CONTRASENAS_COMUNES = ['12345678', 'password', 'qwertyuiop', '123456789', 'admin123', 'ujap2025']

function validarContrasena(pwd: string, correo?: string, nombre?: string): boolean | string {
  if (pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  if (!/[A-Z]/.test(pwd)) return 'La contraseña debe tener al menos una letra mayúscula'
  if (!/[a-z]/.test(pwd)) return 'La contraseña debe tener al menos una letra minúscula'
  if (!/[0-9]/.test(pwd)) return 'La contraseña debe tener al menos un número'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'La contraseña debe tener al menos un carácter especial'

  if (correo && pwd.toLowerCase().includes((correo.split('@')[0] ?? '').toLowerCase())) {
    return 'La contraseña no puede contener partes de tu correo'
  }
  if (nombre && pwd.toLowerCase().includes((nombre.split(' ')[0] ?? '').toLowerCase())) {
    return 'La contraseña no puede contener tu nombre'
  }
  if (CONTRASENAS_COMUNES.includes(pwd.toLowerCase())) {
    return 'La contraseña es demasiado común. Elige otra más segura.'
  }

  return true
}

// ── POST /api/auth/registro ───────────────────────────────────────────────────
router.post('/registro', async (req: Request, res: Response) => {
  const { nombre, correo, telefono, esConductor, contrasena } = req.body as {
    nombre: string
    correo: string
    telefono: string
    esConductor: boolean
    contrasena: string
  }

  if (!nombre || !correo || !telefono || !contrasena) {
    res.status(400).json({ error: 'Todos los campos son requeridos' })
    return
  }

  const validacionPwd = validarContrasena(contrasena, correo, nombre)
  if (validacionPwd !== true) {
    res.status(400).json({ error: validacionPwd })
    return
  }

  const existe = await prisma.usuario.findUnique({ where: { correo: correo.toLowerCase() } })
  if (existe) {
    res.status(409).json({ error: 'Ya existe una cuenta con ese correo' })
    return
  }

  const contrasenaHash = await bcrypt.hash(contrasena, SALT_ROUNDS)
  const nuevo = await prisma.usuario.create({
    data: {
      nombre,
      correo: correo.toLowerCase(),
      telefono,
      esConductor: Boolean(esConductor),
      contrasenaHash,
    },
  })

  const token = jwt.sign({ id: nuevo.id, correo: nuevo.correo }, getSecret(), {
    expiresIn: TOKEN_EXPIRA,
  })

  res.status(201).json({
    usuario: { id: nuevo.id, nombre: nuevo.nombre, correo: nuevo.correo, telefono: nuevo.telefono, esConductor: nuevo.esConductor },
    token,
  })
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body as { correo: string; contrasena: string }

  if (!correo || !contrasena) {
    res.status(400).json({ error: 'Correo y contraseña son requeridos' })
    return
  }

  const usuario = await prisma.usuario.findUnique({ where: { correo: correo.toLowerCase() } })
  if (!usuario) {
    res.status(401).json({ error: 'Correo o contraseña incorrectos' })
    return
  }

  const coincide = await bcrypt.compare(contrasena, usuario.contrasenaHash)
  if (!coincide) {
    res.status(401).json({ error: 'Correo o contraseña incorrectos' })
    return
  }

  const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, getSecret(), {
    expiresIn: TOKEN_EXPIRA,
  })

  res.json({
    usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, telefono: usuario.telefono, esConductor: usuario.esConductor },
    token,
  })
})

// ── POST /api/auth/recuperar ──────────────────────────────────────────────────
router.post('/recuperar', async (req: Request, res: Response) => {
  const { correo } = req.body as { correo: string }
  const MSG_GENERICO = 'Si el correo está registrado, recibirás un código en breve'

  if (!correo) {
    res.status(400).json({ error: 'El correo es requerido' })
    return
  }

  const usuario = await prisma.usuario.findUnique({ where: { correo: correo.toLowerCase() } })
  if (usuario) {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    codigosRecuperacion.set(usuario.correo, {
      codigo,
      expira: new Date(Date.now() + CODIGO_EXPIRA_MS),
      intentos: 0,
    })
    try {
      await enviarCodigo(usuario.correo, codigo)
    } catch (e) {
      console.error('Error al enviar correo:', e)
    }
  }

  res.json({ message: MSG_GENERICO })
})

// ── POST /api/auth/verificar-codigo ──────────────────────────────────────────
router.post('/verificar-codigo', async (req: Request, res: Response) => {
  const { correo, codigo } = req.body as { correo: string; codigo: string }

  if (!correo || !codigo) {
    res.status(400).json({ error: 'Correo y código son requeridos' })
    return
  }

  const registro = codigosRecuperacion.get(correo.toLowerCase())
  if (!registro) {
    res.status(400).json({ error: 'No hay un código activo para este correo' })
    return
  }
  if (registro.intentos >= MAX_INTENTOS) {
    codigosRecuperacion.delete(correo.toLowerCase())
    res.status(429).json({ error: 'Demasiados intentos fallidos. Solicita un nuevo código' })
    return
  }
  if (new Date() > registro.expira) {
    codigosRecuperacion.delete(correo.toLowerCase())
    res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo' })
    return
  }
  if (registro.codigo !== codigo) {
    registro.intentos++
    res.status(400).json({ error: 'Código incorrecto' })
    return
  }

  codigosRecuperacion.delete(correo.toLowerCase())

  const usuario = await prisma.usuario.findUnique({ where: { correo: correo.toLowerCase() } })
  if (!usuario) {
    res.status(400).json({ error: 'Usuario no encontrado' })
    return
  }

  const tokenTemporal = jwt.sign(
    { id: usuario.id, correo: usuario.correo, proposito: 'reset-password' },
    getSecret(),
    { expiresIn: RESET_TOKEN_EXPIRA },
  )

  res.json({ tokenTemporal })
})

// ── POST /api/auth/restablecer-contrasena ─────────────────────────────────────
router.post('/restablecer-contrasena', async (req: Request, res: Response) => {
  const { tokenTemporal, nuevaContrasena } = req.body as {
    tokenTemporal: string
    nuevaContrasena: string
  }

  if (!tokenTemporal || !nuevaContrasena) {
    res.status(400).json({ error: 'Token y nueva contraseña son requeridos' })
    return
  }

  let payload: { id: number; correo: string; proposito: string }
  try {
    payload = jwt.verify(tokenTemporal, getSecret()) as typeof payload
  } catch {
    res.status(400).json({ error: 'Token inválido o expirado' })
    return
  }

  if (payload.proposito !== 'reset-password') {
    res.status(400).json({ error: 'Token inválido' })
    return
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: payload.id } })
  if (!usuario) {
    res.status(404).json({ error: 'Usuario no encontrado' })
    return
  }

  const validacionPwd = validarContrasena(nuevaContrasena, usuario.correo, usuario.nombre)
  if (validacionPwd !== true) {
    res.status(400).json({ error: validacionPwd })
    return
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { contrasenaHash: await bcrypt.hash(nuevaContrasena, SALT_ROUNDS) },
  })

  res.json({ message: 'Contraseña restablecida correctamente' })
})

export default router
