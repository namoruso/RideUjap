interface Usuario {
  id: number
  nombre: string
  correo: string
  telefono: string
  esConductor: boolean
}

interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
  color: string
  capacidad: number
  idConductor: number
}

interface Viaje {
  id: number
  origen: string
  destino: string
  hora: string
  cuposDisponibles: number
  idConductor: number
  idVehiculo: number
  estado: string
}

const conductor: Usuario = {
  id: 1,
  nombre: 'Nick',
  correo: 'nick@ujap.edu.ve',
  telefono: '0412-1234567',
  esConductor: true,
}

const carro: Vehiculo = {
  id: 1,
  placa: 'AB123CD',
  marca: 'Toyota',
  modelo: 'Corolla',
  color: 'Gris',
  capacidad: 4,
  idConductor: conductor.id,
}

const viajeCampus: Viaje = {
  id: 1,
  origen: 'Entrada principal UJAP',
  destino: 'Centro de Valencia',
  hora: '17:30',
  cuposDisponibles: 3,
  idConductor: conductor.id,
  idVehiculo: carro.id,
  estado: 'disponible',
}

console.log(conductor, carro, viajeCampus)
