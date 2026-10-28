import { describe, expect, it } from 'vitest'
import { blobLugaresViaje, lugarCoincide, normalizarLugar } from '../lugares'

describe('normalizarLugar', () => {
  it('quita acentos, mayúsculas y signos', () => {
    expect(normalizarLugar('  Ñaguanagua, ÁREA-1 ')).toBe('naguanagua area 1')
  })
})

describe('lugarCoincide', () => {
  it('sin consulta siempre coincide', () => {
    expect(lugarCoincide('Prebo', '')).toBe(true)
  })
  it('usa alias de zonas conocidas', () => {
    expect(lugarCoincide('Universidad José Antonio Páez, San Diego', 'campus ujap')).toBe(true)
    expect(lugarCoincide('Prebo, Valencia', 'naguanagua')).toBe(false)
  })
  it('texto vacío no coincide con una consulta', () => {
    expect(lugarCoincide('', 'prebo')).toBe(false)
  })
})

describe('blobLugaresViaje', () => {
  it('une origen, destino y punto de encuentro presentes', () => {
    expect(blobLugaresViaje({ origen: 'A', destino: 'B', puntoEncuentro: null })).toBe('A B')
    expect(blobLugaresViaje({ origen: 'A', destino: 'B', puntoEncuentro: 'C' })).toBe('A B C')
  })
})

describe('lugarCoincide zonas RideUJAP', () => {
  it('encuentra San Diego en origen geocodificado', () => {
    expect(
      lugarCoincide('San Diego, Carabobo, Venezuela', 'San Diego'),
    ).toBe(true)
  })

  it('encuentra San Diego aunque esté solo en el destino', () => {
    expect(lugarCoincide('Campus UJAP Prebo San Diego', 'san diego')).toBe(true)
  })

  it('entiende alias de Campus UJAP', () => {
    expect(lugarCoincide('Entrada UJAP · Portón 1', 'Campus UJAP')).toBe(true)
  })

  it('no confunde Prebo con Naguanagua', () => {
    expect(lugarCoincide('Prebo, Valencia', 'Naguanagua')).toBe(false)
  })
})
