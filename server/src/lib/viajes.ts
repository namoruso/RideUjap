import type { Viaje } from '@prisma/client'

/** Los viajes se agendan en hora de Venezuela (UTC-4, sin horario de verano). */
const OFFSET_VENEZUELA = '-04:00'

export const ESTADOS_VIAJE = ['disponible', 'lleno', 'finalizado', 'cancelado'] as const
export type EstadoViaje = (typeof ESTADOS_VIAJE)[number]

/** Instante de salida de un viaje (fecha YYYY-MM-DD + hora HH:MM en hora de Venezuela). */
export function salidaDe(fecha: string, hora: string): Date {
  return new Date(`${fecha}T${hora.padStart(5, '0')}:00${OFFSET_VENEZUELA}`)
}

/** Forma pública de un viaje con los datos del conductor aplanados. */
export function serializarViaje<T extends Viaje & { conductor: { nombre: string; telefono: string } }>(
  v: T,
) {
  return { ...v, conductorNombre: v.conductor.nombre, conductorTelefono: v.conductor.telefono }
}

// ── Validación del body de crear / editar ────────────────────────────────────

export type DatosViaje = {
  origen: string
  destino: string
  puntoEncuentro: string | null
  fecha: string
  hora: string
  cuposDisponibles: number
  descripcionVehiculo: string
  origenLat: number
  origenLng: number
  destinoLat: number
  destinoLng: number
}

type Resultado = { ok: true; datos: DatosViaje } | { ok: false; error: string }

/** Caja generosa de Venezuela: descarta coordenadas absurdas (0,0, lat/lng invertidos…). */
const LAT = [0.6, 12.4] as const
const LNG = [-73.5, -59.7] as const

function texto(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t && t.length <= max ? t : null
}

function coordenada(v: unknown, [min, max]: readonly [number, number]): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}

export function validarDatosViaje(body: unknown): Resultado {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

  const origen = texto(b['origen'], 200)
  if (!origen) return { ok: false, error: 'El origen es obligatorio (máx. 200 caracteres)' }
  const destino = texto(b['destino'], 200)
  if (!destino) return { ok: false, error: 'El destino es obligatorio (máx. 200 caracteres)' }

  let puntoEncuentro: string | null = null
  if (b['puntoEncuentro'] != null && b['puntoEncuentro'] !== '') {
    puntoEncuentro = texto(b['puntoEncuentro'], 200)
    if (!puntoEncuentro) return { ok: false, error: 'El punto de encuentro es demasiado largo' }
  }

  const fecha = typeof b['fecha'] === 'string' ? b['fecha'] : ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(salidaDe(fecha, '00:00').getTime())) {
    return { ok: false, error: 'Fecha inválida (usa YYYY-MM-DD)' }
  }
  const hora = typeof b['hora'] === 'string' ? b['hora'] : ''
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    return { ok: false, error: 'Hora inválida (usa HH:MM, 24 horas)' }
  }

  const cupos = Number(b['cuposDisponibles'])
  if (!Number.isInteger(cupos) || cupos < 1 || cupos > 8) {
    return { ok: false, error: 'Los cupos deben ser un entero entre 1 y 8' }
  }

  const descripcionVehiculo = texto(b['descripcionVehiculo'], 200) ?? ''

  const origenLat = coordenada(b['origenLat'], LAT)
  const origenLng = coordenada(b['origenLng'], LNG)
  const destinoLat = coordenada(b['destinoLat'], LAT)
  const destinoLng = coordenada(b['destinoLng'], LNG)
  if (origenLat == null || origenLng == null) {
    return { ok: false, error: 'Ubica el origen en el mapa (coordenadas inválidas o ausentes)' }
  }
  if (destinoLat == null || destinoLng == null) {
    return { ok: false, error: 'Ubica el destino en el mapa (coordenadas inválidas o ausentes)' }
  }

  return {
    ok: true,
    datos: {
      origen,
      destino,
      puntoEncuentro,
      fecha,
      hora,
      cuposDisponibles: cupos,
      descripcionVehiculo,
      origenLat,
      origenLng,
      destinoLat,
      destinoLng,
    },
  }
}
