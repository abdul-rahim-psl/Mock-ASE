// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Add prisma to the NodeJS global type
declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
