/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function grantToTenantUserLinks() {
  const admins = await prisma.tenantUser.findMany({
    where: { role: 'AGENCY_ADMIN', isActive: true },
    select: { id: true, permissions: true }
  });
  let updated = 0;
  for (const tu of admins) {
    try {
      const arr = JSON.parse(tu.permissions || '[]');
      if (!arr.includes('MANAGE_PERMISSIONS')) {
        arr.push('MANAGE_PERMISSIONS');
        await prisma.tenantUser.update({ where: { id: tu.id }, data: { permissions: JSON.stringify(arr) } });
        updated += 1;
      }
    } catch (e) {
      console.warn('Permissions parse error for tenantUser', tu.id);
    }
  }
  return updated;
}

async function grantUserPermissionRows() {
  // Also ensure UserPermission table reflects the permission as active
  const admins = await prisma.user.findMany({
    where: { role: 'AGENCY_ADMIN', isActive: true },
    select: { id: true }
  });
  let inserted = 0;
  for (const u of admins) {
    const existing = await prisma.userPermission.findFirst({
      where: { userId: u.id, permission: 'MANAGE_PERMISSIONS', isActive: true }
    });
    if (!existing) {
      await prisma.userPermission.create({
        data: { userId: u.id, permission: 'MANAGE_PERMISSIONS', isActive: true }
      });
      inserted += 1;
    }
  }
  return inserted;
}

async function main() {
  const a = await grantToTenantUserLinks();
  const b = await grantUserPermissionRows();
  console.log('Updated tenantUser links:', a);
  console.log('Created active userPermissions:', b);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
