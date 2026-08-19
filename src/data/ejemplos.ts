import type { Usuario, Viaje } from '@/types'

export const conductorEjemplo: Usuario = {
  id: 1,
  nombre: 'Andrea Pérez',
  correo: 'andrea.perez@ujap.edu.ve',
  telefono: '0412-5550101',
  esConductor: true,
}

export const usuariosEjemplo: Usuario[] = [conductorEjemplo]

/** Seed para el frontend cuando el API no está disponible */
export const viajesEjemplo: Viaje[] = [
  {
    id: 101,
    origen: 'San Diego',
    destino: 'Campus UJAP',
    puntoEncuentro: 'Plaza Bolívar',
    fecha: '2026-08-18',
    hora: '07:15',
    cuposTotal: 4,
    cuposDisponibles: 2,
    idConductor: 1,
    conductorNombre: 'Andrea Pérez',
    descripcionVehiculo: 'Toyota Corolla gris',
    estado: 'disponible',
  },
  {
    id: 102,
    origen: 'Naguanagua',
    destino: 'Campus UJAP',
    puntoEncuentro: 'Frente al Ateneo',
    fecha: '2026-08-18',
    hora: '07:40',
    cuposTotal: 3,
    cuposDisponibles: 1,
    idConductor: 2,
    conductorNombre: 'Luis Mora',
    descripcionVehiculo: 'Chevrolet Aveo blanco',
    estado: 'disponible',
  },
  {
    id: 103,
    origen: 'Valencia centro',
    destino: 'Campus UJAP',
    fecha: '2026-08-18',
    hora: '12:10',
    cuposTotal: 4,
    cuposDisponibles: 3,
    idConductor: 3,
    conductorNombre: 'María Castillo',
    descripcionVehiculo: 'Ford Fiesta azul',
    estado: 'disponible',
  },
  {
    id: 104,
    origen: 'Campus UJAP',
    destino: 'Prebo',
    puntoEncuentro: 'Portería principal',
    fecha: '2026-08-18',
    hora: '17:30',
    cuposTotal: 3,
    cuposDisponibles: 3,
    idConductor: 1,
    conductorNombre: 'Andrea Pérez',
    descripcionVehiculo: 'Toyota Corolla gris',
    estado: 'disponible',
  },
  {
    id: 105,
    origen: 'Campus UJAP',
    destino: 'San Diego',
    fecha: '2026-08-19',
    hora: '18:00',
    cuposTotal: 4,
    cuposDisponibles: 0,
    idConductor: 4,
    conductorNombre: 'Carlos Rivas',
    descripcionVehiculo: 'Hyundai Accent negro',
    estado: 'lleno',
  },
  {
    id: 106,
    origen: 'Prebo',
    destino: 'Campus UJAP',
    fecha: '2026-08-19',
    hora: '06:50',
    cuposTotal: 3,
    cuposDisponibles: 2,
    idConductor: 2,
    conductorNombre: 'Luis Mora',
    descripcionVehiculo: 'Chevrolet Aveo blanco',
    estado: 'disponible',
  },
]

export const viajeEjemplo = viajesEjemplo[0] ?? null
export const vehiculosEjemplo: never[] = []
export const vehiculoEjemplo = null
