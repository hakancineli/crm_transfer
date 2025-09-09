/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  const t1 = await prisma.tenant.create({ data: { companyName: 'Tenant A', subdomain: 'tenant-a', isActive: true } });
  const t2 = await prisma.tenant.create({ data: { companyName: 'Tenant B', subdomain: 'tenant-b', isActive: true } });

  const pass = await bcrypt.hash('Pass123!', 10);
  const adminA = await prisma.user.create({ data: { name: 'Admin A', username: 'adminA', email: 'adminA@test.com', password: pass, role: 'AGENCY_ADMIN' } });
  const adminB = await prisma.user.create({ data: { name: 'Admin B', username: 'adminB', email: 'adminB@test.com', password: pass, role: 'AGENCY_ADMIN' } });
  const superU = await prisma.user.create({ data: { name: 'Super User', username: 'super', email: 'super@test.com', password: pass, role: 'SUPERUSER' } });

  await prisma.tenantUser.create({ data: { tenantId: t1.id, userId: adminA.id, role: 'AGENCY_ADMIN', isActive: true } });
  await prisma.tenantUser.create({ data: { tenantId: t2.id, userId: adminB.id, role: 'AGENCY_ADMIN', isActive: true } });

  await prisma.reservation.create({ data: { date: '2025-01-01', time: '10:00', from: 'A', to: 'B', flightCode: '', passengerNames: '[]', luggageCount: 0, price: 0, currency: 'TRY', phoneNumber: '000', voucherNumber: 'T1-1', tenantId: t1.id } });
  await prisma.reservation.create({ data: { date: '2025-01-01', time: '11:00', from: 'C', to: 'D', flightCode: '', passengerNames: '[]', luggageCount: 0, price: 0, currency: 'TRY', phoneNumber: '111', voucherNumber: 'T2-1', tenantId: t2.id } });

  return { t1, t2, adminA, adminB, superU };
}

function sign(userId, role) {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign({ userId, role }, secret, { expiresIn: '10m' });
}

async function run() {
  await prisma.reservation.deleteMany({});
  await prisma.tenantUser.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  const { t1, t2, adminA, adminB, superU } = await seed();

  const tokenA = sign(adminA.id, 'AGENCY_ADMIN');
  const tokenB = sign(adminB.id, 'AGENCY_ADMIN');
  const tokenS = sign(superU.id, 'SUPERUSER');

  const countT1 = await prisma.reservation.count({ where: { tenantId: t1.id } });
  const countT2 = await prisma.reservation.count({ where: { tenantId: t2.id } });
  if (countT1 !== 1 || countT2 !== 1) throw new Error('Seed failed');

  const linksA = await prisma.tenantUser.findMany({ where: { userId: adminA.id } });
  const linksB = await prisma.tenantUser.findMany({ where: { userId: adminB.id } });
  if (linksA.length !== 1 || linksA[0].tenantId !== t1.id) throw new Error('Links for adminA incorrect');
  if (linksB.length !== 1 || linksB[0].tenantId !== t2.id) throw new Error('Links for adminB incorrect');

  console.log('OK: tenant scoping seeded and links verified.');
  console.log('Tokens (sample):', { tokenA: tokenA.slice(0, 16) + '...', tokenB: tokenB.slice(0, 16) + '...', tokenS: tokenS.slice(0, 16) + '...' });
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


