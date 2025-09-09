/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertFarahTourism() {
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'farahtourism' },
    update: { companyName: 'Farah Tourism', isActive: true },
    create: { companyName: 'Farah Tourism', subdomain: 'farahtourism', isActive: true }
  });
  return tenant;
}

async function ensureFarahAdminUser() {
  const existing = await prisma.user.findUnique({ where: { username: 'farahtourism' } });
  if (existing) return existing;

  const hashed = await bcrypt.hash('farahtourism34', 12);
  // Try to create with AGENCY_ADMIN, fallback to SUPERUSER if enum missing
  const tryRoles = ['AGENCY_ADMIN', 'SUPERUSER'];
  let lastError;
  for (const role of tryRoles) {
    try {
      const user = await prisma.user.create({
        data: {
          username: 'farahtourism',
          email: 'fatah@toursim.com',
          name: 'Şekip Ahmet Kırk',
          password: hashed,
          role
        }
      });
      return user;
    } catch (e) {
      lastError = e;
      // continue
    }
  }
  throw lastError;
}

async function linkUserToTenant(tenantId, userId) {
  const link = await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId, userId } },
    update: { isActive: true, role: 'AGENCY_ADMIN' },
    create: { tenantId, userId, role: 'AGENCY_ADMIN', permissions: '[]', isActive: true }
  });
  return link;
}

async function deactivateDemoTenant() {
  const res = await prisma.tenant.updateMany({ where: { subdomain: 'demo' }, data: { isActive: false } });
  return res.count;
}

async function main() {
  const deactivated = await deactivateDemoTenant();
  console.log('Deactivated demo tenants:', deactivated);

  const tenant = await upsertFarahTourism();
  console.log('Upserted tenant:', tenant.subdomain, tenant.id);

  const user = await ensureFarahAdminUser();
  console.log('Ensured user:', user.username, user.role);

  const link = await linkUserToTenant(tenant.id, user.id);
  console.log('Linked:', link.role, '->', tenant.subdomain);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


