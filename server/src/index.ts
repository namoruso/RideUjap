import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'node:path'
import prisma from './db'
import authRouter from './routes/auth'
import viajesRouter from './routes/viajes'
import usuariosRouter from './routes/usuarios'
import notificacionesRouter from './routes/notificaciones'
import { asegurarIndices } from './notificaciones'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const port = process.env['PORT'] || 3001

app.use(cors())
app.use(express.json())

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

app.use('/api/viajes', viajesRouter)
app.use('/api/usuarios', usuariosRouter)
app.use('/api/notificaciones', notificacionesRouter)

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

void asegurarIndices().catch((e) => console.warn('⚠️  MongoDB no disponible:', e.message))

app.listen(port, () => {
  console.log(`✅ Backend RideUJAP corriendo en http://localhost:${port}`)
  if (!process.env['JWT_SECRET']) console.warn('⚠️  JWT_SECRET no configurado')
  if (process.env['CLERK_SECRET_KEY']) console.log('🔐 Clerk habilitado (JWT + Clerk)')
})
