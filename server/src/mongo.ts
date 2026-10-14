import { MongoClient, type Collection, type Document } from 'mongodb'

let cliente: MongoClient | null = null
let conectando: Promise<MongoClient> | null = null

export function mongoConfigurado(): boolean {
  return Boolean(process.env['MONGODB_URI'])
}

async function conectar(): Promise<MongoClient> {
  if (cliente) return cliente
  conectando ??= new MongoClient(process.env['MONGODB_URI']!, { serverSelectionTimeoutMS: 5000 })
    .connect()
    .then((c) => (cliente = c))
    .catch((e) => {
      conectando = null
      throw e
    })
  return conectando
}

export async function coleccion<T extends Document>(nombre: string): Promise<Collection<T>> {
  const c = await conectar()
  return c.db(process.env['MONGODB_DB'] || 'rideujap').collection<T>(nombre)
}
