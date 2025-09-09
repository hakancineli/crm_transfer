/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertTenants() {
  const tenants = [
    { subdomain: 'farahtourism', companyName: 'Farah Tourism' },
    { subdomain: 'alya-karde-ler', companyName: 'Alya Kardeşler' },
    { subdomain: 'protransfer', companyName: 'ProTransfer' },
    { subdomain: 'ahjaaz', companyName: 'Ahjaaz Tourism' }
  ];

  const results = [];
  for (const tenantData of tenants) {
    const tenant = await prisma.tenant.upsert({
      where: { subdomain: tenantData.subdomain },
      update: { companyName: tenantData.companyName, isActive: true },
      create: { companyName: tenantData.companyName, subdomain: tenantData.subdomain, isActive: true }
    });
    results.push(tenant);
  }
  return results;
}

async function ensureAdminUsers() {
  const users = [
    { username: 'farahtourism', email: 'fatah@toursim.com', name: 'Şekip Ahmet Kırk', password: 'farahtourism34' },
    { username: 'alya-karde-ler-admin', email: 'admin@alya-karde-ler.com', name: 'Alya kardeşler Admin', password: 'alya123' },
    { username: 'protransfer-admin', email: 'admin@protransfer.com', name: 'ProTransfer Admin', password: 'protransfer123' },
    { username: 'ahjaaz-admin', email: 'admin@ahjaaz.com', name: 'Ahjaaz Admin', password: 'ahjaaz123' }
  ];

  const results = [];
  for (const userData of users) {
    const existing = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { username: userData.username },
          { email: userData.email }
        ]
      } 
    });
    if (existing) {
      results.push(existing);
      continue;
    }

    const hashed = await bcrypt.hash(userData.password, 12);
    const tryRoles = ['AGENCY_ADMIN', 'SUPERUSER'];
    let lastError;
    for (const role of tryRoles) {
      try {
        const user = await prisma.user.create({
          data: {
            username: userData.username,
            email: userData.email,
            name: userData.name,
            password: hashed,
            role
          }
        });
        results.push(user);
        break;
      } catch (e) {
        lastError = e;
      }
    }
    if (!results.find(r => r.username === userData.username)) {
      throw lastError;
    }
  }
  return results;
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

  const tenants = await upsertTenants();
  console.log('Upserted tenants:', tenants.length);

  const users = await ensureAdminUsers();
  console.log('Ensured users:', users.length);

  // Link each user to their corresponding tenant
  for (let i = 0; i < tenants.length && i < users.length; i++) {
    const link = await linkUserToTenant(tenants[i].id, users[i].id);
    console.log('Linked:', link.role, '->', tenants[i].subdomain);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


