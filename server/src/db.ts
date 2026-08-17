import { PrismaClient } from '@prisma/client'

// Singleton del cliente Prisma para todo el servidor
const prisma = new PrismaClient()

export default prisma
