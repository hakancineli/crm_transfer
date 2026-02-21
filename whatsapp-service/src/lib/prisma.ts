import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (!(global as any).__prisma) {
    (global as any).__prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    });
}

prisma = (global as any).__prisma;
// Self-ping to keep connection alive every minute
setInterval(() => {
    prisma.tenant.findFirst({ select: { id: true } }).catch(() => { });
}, 60000);

export { prisma };
