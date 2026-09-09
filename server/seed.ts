import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const contrasenaHash = await bcrypt.hash('Ujap2026!', 10)

  const usuarioPrueba = await prisma.usuario.upsert({
    where: { correo: 'prueba@ujap.edu.ve' },
    update: {
      placa: 'AB123CD',
      marcaVehiculo: 'Toyota',
      modeloVehiculo: 'Corolla',
      colorVehiculo: 'Gris',
      puestosVehiculo: 3,
      esConductor: true,
      onboardingCompleto: true,
    },
    create: {
      nombre: 'Usuario Prueba',
      correo: 'prueba@ujap.edu.ve',
      telefono: '0414-1234567',
      esConductor: true,
      contrasenaHash,
      correoVerificado: true,
      onboardingCompleto: true,
      marcaVehiculo: 'Toyota',
      placa: 'AB123CD',
      modeloVehiculo: 'Corolla',
      colorVehiculo: 'Gris',
      puestosVehiculo: 3,
    },
  })

  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const fechaDemo = manana.toISOString().slice(0, 10)

  const viajeDemo = await prisma.viaje.findFirst({
    where: { idConductor: usuarioPrueba.id, origen: 'Campus UJAP, San Diego' },
  })

  if (viajeDemo) {
    await prisma.viaje.update({
      where: { id: viajeDemo.id },
      data: {
        fecha: fechaDemo,
        hora: '07:15',
        estado: 'disponible',
        cuposDisponibles: 3,
        origenLat: 10.2145,
        origenLng: -67.9912,
        destinoLat: 10.1621,
        destinoLng: -68.0075,
      },
    })
  } else {
    await prisma.viaje.create({
      data: {
        origen: 'Campus UJAP, San Diego',
        destino: 'Prebo, Valencia',
        puntoEncuentro: 'Portería principal',
        fecha: fechaDemo,
        hora: '07:15',
        cuposTotal: 3,
        cuposDisponibles: 3,
        descripcionVehiculo: 'Toyota Corolla gris — AB123CD',
        estado: 'disponible',
        idConductor: usuarioPrueba.id,
        origenLat: 10.2145,
        origenLng: -67.9912,
        destinoLat: 10.1621,
        destinoLng: -68.0075,
      },
    })
  }

  console.log('Seed OK:', usuarioPrueba.correo, 'viaje demo →', fechaDemo)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
