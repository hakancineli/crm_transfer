const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const [tenantSubdomain, username, linkRole] = process.argv.slice(2);
  if (!tenantSubdomain || !username) {
    console.error('Usage: node scripts/link_user_to_tenant.js <tenantSubdomain> <username> [role=AGENCY_ADMIN]');
    process.exit(1);
  }
  const role = linkRole || 'AGENCY_ADMIN';

  const tenant = await prisma.tenant.findUnique({ where: { subdomain: tenantSubdomain } });
  if (!tenant) {
    console.error('Tenant not found for subdomain:', tenantSubdomain);
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    console.error('User not found:', username);
    process.exit(1);
  }

  const link = await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: { isActive: true, role },
    create: { tenantId: tenant.id, userId: user.id, role, permissions: '[]', isActive: true }
  });

  console.log('Linked user to tenant:', { tenant: tenantSubdomain, username, role: link.role });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



