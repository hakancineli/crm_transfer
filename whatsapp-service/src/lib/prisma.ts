import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (!(global as any).__prisma) {
    (global as any).__prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    });
}

prisma = (global as any).__prisma;

export { prisma };
