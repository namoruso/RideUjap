import type { Usuario, Vehiculo, Viaje } from '@/types'

export const conductorEjemplo: Usuario = {
  id: 1,
  nombre: 'Nick',
  correo: 'nick@ujap.edu.ve',
  telefono: '0412-1234567',
  esConductor: true,
}

export const vehiculoEjemplo: Vehiculo = {
  id: 1,
  placa: 'AB123CD',
  marca: 'Toyota',
  modelo: 'Corolla',
  color: 'Gris',
  capacidad: 4,
  idConductor: conductorEjemplo.id,
}

export const viajeEjemplo: Viaje = {
  id: 1,
  origen: 'Entrada principal UJAP',
  destino: 'Centro de Valencia',
  hora: '17:30',
  cuposDisponibles: 3,
  idConductor: conductorEjemplo.id,
  idVehiculo: vehiculoEjemplo.id,
  estado: 'disponible',
}

/** Sample trips for the Viajes list (repeating card pattern) */
export const viajesEjemplo: Viaje[] = [
  viajeEjemplo,
  {
    id: 2,
    origen: 'Facultad de Ingeniería',
    destino: 'San Diego',
    hora: '12:15',
    cuposDisponibles: 2,
    idConductor: conductorEjemplo.id,
    idVehiculo: vehiculoEjemplo.id,
    estado: 'disponible',
  },
  {
    id: 3,
    origen: 'Biblioteca UJAP',
    destino: 'Prebo',
    hora: '18:00',
    cuposDisponibles: 1,
    idConductor: conductorEjemplo.id,
    idVehiculo: vehiculoEjemplo.id,
    estado: 'disponible',
  },
]
