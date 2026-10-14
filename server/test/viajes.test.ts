import test from 'node:test'
import assert from 'node:assert/strict'
import { salidaDe, validarDatosViaje } from '../src/lib/viajes'
import { idParam } from '../src/lib/http'

const base = {
  origen: 'San Diego',
  destino: 'Campus UJAP',
  fecha: '2030-01-02',
  hora: '07:30',
  cuposDisponibles: 3,
  origenLat: 10.25,
  origenLng: -67.95,
  destinoLat: 10.2,
  destinoLng: -68.0,
}

const error = (body: unknown) => {
  const r = validarDatosViaje(body)
  assert.equal(r.ok, false)
  return r.ok ? '' : r.error
}

test('acepta un viaje válido y normaliza campos', () => {
  const r = validarDatosViaje({ ...base, origen: '  San Diego ', puntoEncuentro: '' })
  assert.ok(r.ok)
  if (r.ok) {
    assert.equal(r.datos.origen, 'San Diego')
    assert.equal(r.datos.puntoEncuentro, null)
    assert.equal(r.datos.descripcionVehiculo, '')
  }
})

test('rechaza textos, fecha, hora y cupos inválidos', () => {
  assert.match(error({ ...base, origen: '' }), /origen/i)
  assert.match(error({ ...base, destino: 'x'.repeat(201) }), /destino/i)
  assert.match(error({ ...base, fecha: '2030-1-2' }), /Fecha/)
  assert.match(error({ ...base, fecha: '2030-13-45' }), /Fecha/)
  assert.match(error({ ...base, hora: '7:30' }), /Hora/)
  assert.match(error({ ...base, hora: '24:00' }), /Hora/)
  for (const c of [0, 9, 2.5, 'abc', null]) assert.match(error({ ...base, cuposDisponibles: c }), /cupos/i)
})

test('exige coordenadas válidas dentro de Venezuela', () => {
  assert.match(error({ ...base, origenLat: undefined }), /origen/i)
  assert.match(error({ ...base, origenLat: 0, origenLng: 0 }), /origen/i)
  assert.match(error({ ...base, destinoLng: 68 }), /destino/i) // signo invertido
  assert.match(error({ ...base, destinoLat: 'x' }), /destino/i)
})

test('body no objeto no rompe', () => {
  error(null)
  error('hola')
})

test('salidaDe interpreta la hora en Venezuela (UTC-4)', () => {
  assert.equal(salidaDe('2030-01-02', '07:30').toISOString(), '2030-01-02T11:30:00.000Z')
})

test('idParam solo acepta enteros', () => {
  assert.equal(idParam('42'), 42)
  for (const v of ['abc', '4x', '-1', '', undefined]) assert.ok(Number.isNaN(idParam(v)))
  assert.equal(idParam(['7', '8']), 7)
})
