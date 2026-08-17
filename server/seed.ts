import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const contrasenaHash = await bcrypt.hash('Ujap2026!', 10)
  
  const usuarioPrueba = await prisma.usuario.upsert({
    where: { correo: 'prueba@ujap.edu.ve' },
    update: {},
    create: {
      nombre: 'Usuario Prueba',
      correo: 'prueba@ujap.edu.ve',
      telefono: '0414-1234567',
      esConductor: true,
      contrasenaHash,
    },
  })
  console.log('Usuario creado exitosamente:', usuarioPrueba.correo)
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
