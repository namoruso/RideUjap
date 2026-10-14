import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hoyIso, salidaEsFutura } from '../fechas'

describe('fechas', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2030, 4, 10, 20, 30)) // 10-may-2030 20:30 hora local
  })
  afterEach(() => vi.useRealTimers())

  it('hoyIso usa la fecha local (no UTC)', () => {
    expect(hoyIso()).toBe('2030-05-10')
  })
  it('salidaEsFutura compara fecha y hora', () => {
    expect(salidaEsFutura('2030-05-10', '20:31')).toBe(true)
    expect(salidaEsFutura('2030-05-10', '20:30')).toBe(false)
    expect(salidaEsFutura('2030-05-11', '00:00')).toBe(true)
    expect(salidaEsFutura('2030-05-09', '23:59')).toBe(false)
  })
  it('entradas inválidas no son futuras', () => {
    expect(salidaEsFutura('', '10:00')).toBe(false)
  })
})
