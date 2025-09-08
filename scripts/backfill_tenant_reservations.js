const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // resolve tenant ids
  const pro = await prisma.tenant.findUnique({ where: { subdomain: 'protransfer' } });
  if (!pro) throw new Error('protransfer tenant not found');

  const result = await prisma.reservation.updateMany({
    where: { tenantId: null },
    data: { tenantId: pro.id }
  });
  console.log('Updated reservations:', result.count);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });


