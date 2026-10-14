// RideUJAP — modelos de datos del frontend

export interface Usuario {
  id: number
  nombre: string
  correo: string
  telefono: string
  esConductor: boolean
  onboardingCompleto?: boolean
  marcaVehiculo?: string | null
  placa?: string | null
  modeloVehiculo?: string | null
  colorVehiculo?: string | null
  puestosVehiculo?: number | null
}

export type UsuarioPublico = Usuario

/** Lo que el conductor ve de cada pasajero unido a su viaje. */
export type Pasajero = Pick<Usuario, 'id' | 'nombre' | 'telefono'>

export interface Viaje {
  id: number
  origen: string
  destino: string
  puntoEncuentro?: string | null
  fecha: string
  hora: string
  cuposTotal: number
  cuposDisponibles: number
  idConductor: number
  conductorNombre?: string
  conductorTelefono?: string
  descripcionVehiculo: string
  estado: string
  creadoEn?: string
  origenLat?: number | null
  origenLng?: number | null
  destinoLat?: number | null
  destinoLng?: number | null
}

export interface FiltroViajes {
  origen: string
  destino: string
  hora: string
  /** Quick zone chip: matches origen, destino or punto de encuentro. */
  zona?: string
}

export type NuevoViaje = Pick<
  Viaje,
  | 'origen'
  | 'destino'
  | 'puntoEncuentro'
  | 'fecha'
  | 'hora'
  | 'cuposDisponibles'
  | 'descripcionVehiculo'
  | 'origenLat'
  | 'origenLng'
  | 'destinoLat'
  | 'destinoLng'
>

// ── Auth types ────────────────────────────────────────────────────────────────

export interface DatosLogin {
  correo: string
  contrasena: string
}

export interface DatosRegistro {
  nombre: string
  correo: string
  telefono: string
  esConductor: boolean
  contrasena: string
}

export interface RespuestaAuth {
  usuario: UsuarioPublico
  token: string
}

// ── Notificaciones (MongoDB) ──────────────────────────────────────────────────

export type TipoNotificacion =
  | 'pasajero_unido'
  | 'pasajero_abandono'
  | 'viaje_actualizado'
  | 'viaje_cancelado'

export interface Notificacion {
  _id: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  leida: boolean
  creadoEn: string
  payload: { idViaje?: number; [k: string]: unknown }
}
