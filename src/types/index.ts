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
