import type { Usuario } from '@prisma/client'

/** Shape público que consume el frontend / Pinia */
export function usuarioPublico(u: Usuario) {
  return {
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    telefono: u.telefono,
    esConductor: u.esConductor,
    onboardingCompleto: u.onboardingCompleto,
    marcaVehiculo: u.marcaVehiculo,
    modeloVehiculo: u.modeloVehiculo,
    placa: u.placa,
    colorVehiculo: u.colorVehiculo,
    puestosVehiculo: u.puestosVehiculo,
  }
}
