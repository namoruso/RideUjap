/**
 * Pruebas de integración del API contra una base real.
 *   RUN_INTEGRATION=1 pnpm test:integration
 * Requiere Postgres (DATABASE_URL de server/.env, p. ej. `pnpm docker:db`).
 * Las de notificaciones además requieren MONGODB_TEST_URI (p. ej. mongodb://localhost:27018).
 * Crea usuarios/viajes temporales y los borra al terminar.
 */
import 'dotenv/config'
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawn, type ChildProcess } from 'node:child_process'
import jwt from 'jsonwebtoken'
import prisma from '../src/db'

const habilitado = process.env['RUN_INTEGRATION'] === '1'
const mongoUri = process.env['MONGODB_TEST_URI']
const PORT = '3997'
const base = `http://localhost:${PORT}/api`
const sufijo = `-it${Date.now()}@ujap.edu.ve`

type U = { id: number; correo: string }
let srv: ChildProcess
let cond: U, pas: U, pas2: U
const viajesCreados: number[] = []

const headers = (u?: U) => ({
  'Content-Type': 'application/json',
  ...(u ? { Authorization: `Bearer ${jwt.sign({ id: u.id, correo: u.correo }, process.env['JWT_SECRET']!)}` } : {}),
})
async function call(method: string, path: string, u?: U, body?: unknown) {
  const r = await fetch(base + path, { method, headers: headers(u), body: body ? JSON.stringify(body) : undefined })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cuerpo JSON libre en los asserts
  return { status: r.status, body: (await r.json().catch(() => null)) as any }
}
const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms))

const manana = new Date(Date.now() + 86400e3).toISOString().slice(0, 10)
const viaje = {
  origen: 'San Diego',
  destino: 'Campus UJAP',
  fecha: manana,
  hora: '07:30',
  cuposDisponibles: 1,
  origenLat: 10.25,
  origenLng: -67.95,
  destinoLat: 10.2,
  destinoLng: -68.0,
}
async function crearViaje(extra: object = {}) {
  const r = await call('POST', '/viajes', cond, { ...viaje, ...extra })
  assert.equal(r.status, 201)
  viajesCreados.push(r.body.id)
  return r.body.id as number
}

describe('API (integración)', { skip: !habilitado && 'define RUN_INTEGRATION=1' }, () => {
  before(async () => {
    srv = spawn('npx', ['tsx', 'src/index.ts'], {
      cwd: process.cwd(),
      env: { ...process.env, PORT, CLERK_SECRET_KEY: '', MONGODB_URI: mongoUri ?? '', MONGODB_DB: 'rideujap_test' },
    })
    for (let i = 0; i < 40; i++) {
      if ((await fetch(`${base}/health`).catch(() => null))?.ok) break
      await pausa(250)
    }
    const mk = (n: string, esConductor: boolean) =>
      prisma.usuario.create({
        data: {
          nombre: n,
          correo: n + sufijo,
          esConductor,
          onboardingCompleto: true,
          placa: esConductor ? 'IT123' : null,
          marcaVehiculo: esConductor ? 'Toyota' : null,
          modeloVehiculo: esConductor ? 'Corolla' : null,
          colorVehiculo: esConductor ? 'gris' : null,
          puestosVehiculo: esConductor ? 4 : null,
        },
      })
    ;[cond, pas, pas2] = await Promise.all([mk('condIT', true), mk('pasIT', false), mk('pas2IT', false)])
  })

  after(async () => {
    srv?.kill()
    await prisma.pasajeroViaje.deleteMany({ where: { idViaje: { in: viajesCreados } } })
    await prisma.viaje.deleteMany({ where: { id: { in: viajesCreados } } })
    await prisma.usuario.deleteMany({ where: { correo: { endsWith: sufijo } } })
    await prisma.$disconnect()
  })

  it('health', async () => {
    assert.equal((await call('GET', '/health')).status, 200)
  })

  it('permisos al publicar', async () => {
    assert.equal((await call('POST', '/viajes', undefined, viaje)).status, 401)
    assert.equal((await call('POST', '/viajes', pas, viaje)).status, 403)
  })

  it('validación al publicar', async () => {
    for (const mala of [
      { origenLat: undefined },
      { fecha: '2020-01-01' },
      { cuposDisponibles: 9 },
      { hora: '25:00' },
    ]) {
      assert.equal((await call('POST', '/viajes', cond, { ...viaje, ...mala })).status, 400, JSON.stringify(mala))
    }
  })

  it('crea un viaje y completa la descripción desde el perfil', async () => {
    const r = await call('POST', '/viajes', cond, viaje)
    assert.equal(r.status, 201)
    viajesCreados.push(r.body.id)
    assert.equal(r.body.conductorNombre, 'condIT')
    assert.match(r.body.descripcionVehiculo, /Toyota Corolla gris/)
    assert.equal((await call('GET', `/viajes/${r.body.id}`)).status, 200)
    assert.equal((await call('GET', '/viajes/abc')).status, 400)
  })

  it('cupos: unirse, duplicado, lleno, abandonar', async () => {
    const id = await crearViaje()
    assert.equal((await call('POST', `/viajes/${id}/unirse`, pas)).status, 200)
    assert.equal((await call('POST', `/viajes/${id}/unirse`, pas)).status, 409)
    assert.equal((await call('POST', `/viajes/${id}/unirse`, pas2)).status, 400)
    assert.equal((await call('GET', `/viajes/${id}`)).body.estado, 'lleno')
    assert.equal((await call('DELETE', `/viajes/${id}/unirse`, pas)).status, 200)
    const v = (await call('GET', `/viajes/${id}`)).body
    assert.equal(v.cuposDisponibles, 1)
    assert.equal(v.estado, 'disponible')
  })

  it('dos pasajeros a la vez no toman el mismo último cupo', async () => {
    const id = await crearViaje()
    const rs = await Promise.all([call('POST', `/viajes/${id}/unirse`, pas), call('POST', `/viajes/${id}/unirse`, pas2)])
    assert.deepEqual(rs.map((r) => r.status).sort(), [200, 400])
    assert.equal((await call('GET', `/viajes/${id}`)).body.cuposDisponibles, 0)
  })

  it('editar (PUT) valida y recalcula cupos', async () => {
    const id = await crearViaje()
    await call('POST', `/viajes/${id}/unirse`, pas)
    assert.equal((await call('GET', `/viajes/${id}/pasajeros`, pas)).status, 403)
    assert.equal((await call('PUT', `/viajes/${id}`, pas, viaje)).status, 403)
    assert.equal((await call('PUT', `/viajes/${id}`, cond, { ...viaje, cuposDisponibles: 0 })).status, 400)
    assert.equal((await call('PUT', `/viajes/${id}`, cond, { ...viaje, estado: 'x' })).status, 400)
    const ok = await call('PUT', `/viajes/${id}`, cond, { ...viaje, cuposDisponibles: 3, hora: '08:00' })
    assert.equal(ok.status, 200)
    assert.equal(ok.body.cuposTotal, 3)
    assert.equal(ok.body.cuposDisponibles, 2)
    assert.equal(ok.body.estado, 'disponible')
    assert.equal((await call('PATCH', `/viajes/${id}/hora`, cond, { hora: '25:00' })).status, 400)
  })

  it('solo el dueño elimina', async () => {
    const id = await crearViaje()
    assert.equal((await call('DELETE', `/viajes/${id}`, pas)).status, 403)
    assert.equal((await call('DELETE', `/viajes/${id}`, cond)).status, 200)
    assert.equal((await call('GET', `/viajes/${id}`)).status, 404)
  })

  it('usuarios: id inválido', async () => {
    assert.equal((await call('GET', `/usuarios/${cond.id}`)).status, 200)
    assert.equal((await call('GET', '/usuarios/zz')).status, 400)
  })

  it('notificaciones: 503 si Mongo no está configurado', { skip: !!mongoUri && 'Mongo configurado' }, async () => {
    assert.equal((await call('GET', '/notificaciones', cond)).status, 503)
  })

  describe('notificaciones con MongoDB', { skip: !mongoUri && 'define MONGODB_TEST_URI' }, () => {
    it('SSE en vivo, historial, aislamiento y lectura', async () => {
      await pausa(1000) // índices de Mongo al arrancar
      const ctrl = new AbortController()
      const eventos: string[] = []
      const stream = await fetch(`${base}/notificaciones/stream`, { headers: headers(cond), signal: ctrl.signal })
      assert.equal(stream.status, 200)
      void (async () => {
        const rd = stream.body!.pipeThrough(new TextDecoderStream()).getReader()
        for (;;) {
          const { value, done } = await rd.read()
          if (done) break
          eventos.push(value)
        }
      })().catch(() => undefined)

      const id = await crearViaje({ cuposDisponibles: 3 })
      await call('POST', `/viajes/${id}/unirse`, pas)
      await pausa(800)
      ctrl.abort()
      assert.ok(eventos.join('').includes('pasajero_unido'), 'el conductor recibe el evento por SSE')

      const lista = await call('GET', '/notificaciones', cond)
      assert.equal(lista.status, 200)
      assert.ok(lista.body.noLeidas >= 1)
      assert.ok(lista.body.items.every((n: { idUsuario: number }) => n.idUsuario === cond.id))

      await call('PATCH', `/viajes/${id}/hora`, cond, { hora: '09:00' })
      await pausa(400)
      assert.equal((await call('GET', '/notificaciones', pas)).body.items[0].tipo, 'viaje_actualizado')

      const nid = lista.body.items[0]._id
      assert.equal((await call('PATCH', `/notificaciones/${nid}/leida`, pas)).status, 404)
      assert.equal((await call('PATCH', `/notificaciones/${nid}/leida`, cond)).status, 200)

      await call('DELETE', `/viajes/${id}`, cond)
      await pausa(400)
      assert.equal((await call('GET', '/notificaciones', pas)).body.items[0].tipo, 'viaje_cancelado')
      await call('PATCH', '/notificaciones/leidas', pas)
      assert.equal((await call('GET', '/notificaciones', pas)).body.noLeidas, 0)
    })
  })
})
