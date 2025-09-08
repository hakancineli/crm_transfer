// Temporary helper to create a tenant and link an existing user as AGENCY_ADMIN
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const subdomain = process.argv[2] || 'farahtourism';
  const companyName = process.argv[3] || 'Farah Tourism';
  const username = process.argv[4] || 'farahtourism';

  console.log(`Creating tenant '${companyName}' (${subdomain}) and linking user '${username}'...`);

  // Find or create tenant
  let tenant = await prisma.tenant.findUnique({ where: { subdomain } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        subdomain,
        companyName,
        isActive: true,
        subscriptionPlan: 'basic'
      }
    });
    console.log('Tenant created:', tenant.id);
  } else {
    console.log('Tenant already exists:', tenant.id);
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new Error(`User '${username}' not found`);
  }

  // Link via TenantUser (upsert)
  const existingLink = await prisma.tenantUser.findFirst({
    where: { tenantId: tenant.id, userId: user.id }
  });

  if (!existingLink) {
    await prisma.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: 'AGENCY_ADMIN',
        permissions: '[]',
        isActive: true
      }
    });
    console.log('TenantUser link created.');
  } else {
    console.log('TenantUser link already exists.');
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


