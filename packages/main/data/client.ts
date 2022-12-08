import { PrismaClient } from '@prisma/client'

let client: PrismaClient | null = null

const connect = (): PrismaClient => {
  client = client ?? new PrismaClient()

  return client
}

export { PrismaClient, connect }
