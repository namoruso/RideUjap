// RideUJAP — core data models for the campus ride-sharing app

export interface Usuario {
  id: number
  nombre: string
  correo: string
  telefono: string
  esConductor: boolean
}

export interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
  color: string
  capacidad: number
  idConductor: number
}

/** Published ride (matches the lab example + links to driver/vehicle) */
export interface Viaje {
  id: number
  origen: string
  destino: string
  hora: string
  cuposDisponibles: number
  idConductor: number
  idVehiculo: number
  estado: string // "disponible" | "en curso" | "finalizado"
}
