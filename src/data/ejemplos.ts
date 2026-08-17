// Datos de ejemplo ya no son necesarios — la BD SQLite persiste todos los datos.
// Este archivo se mantiene vacío para no romper imports existentes.
import type { Usuario } from '@/types'

export const conductorEjemplo: Usuario = {
  id: 1,
  nombre: 'Nick Driver',
  correo: 'nick@ujap.edu.ve',
  telefono: '0412-1234567',
  esConductor: true,
}

export const usuariosEjemplo: Usuario[] = [conductorEjemplo]
export const vehiculosEjemplo: never[] = []
export const viajesEjemplo: never[] = []
export const viajeEjemplo = null
export const vehiculoEjemplo = null
