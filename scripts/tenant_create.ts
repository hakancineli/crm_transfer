#!/usr/bin/env ts-node
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// AGENCY_ADMIN için varsayılan izinler
const AGENCY_ADMIN_PERMISSIONS = [
  'VIEW_DASHBOARD',
  'VIEW_OWN_SALES',
  'VIEW_ALL_RESERVATIONS',
  'CREATE_RESERVATIONS',
  'EDIT_RESERVATIONS',
  'DELETE_RESERVATIONS',
  'VIEW_DRIVERS',
  'MANAGE_DRIVERS',
  'ASSIGN_DRIVERS',
  'VIEW_REPORTS',
  'EXPORT_REPORTS',
  'VIEW_ACCOUNTING',
  'MANAGE_PAYMENTS',
  'MANAGE_COMMISSIONS',
  'MANAGE_CUSTOMERS',
  'VIEW_CUSTOMER_DATA',
  'MANAGE_USERS',
  'MANAGE_PERMISSIONS',
  'VIEW_ACTIVITIES',
  'SYSTEM_SETTINGS',
  'BACKUP_RESTORE',
  'AUDIT_LOGS',
  'VIEW_FINANCIAL_DATA',
  'VIEW_PERFORMANCE',
  'MANAGE_PERFORMANCE',
  // Tur modülü izinleri
  'VIEW_TOUR_MODULE',
  'MANAGE_TOUR_BOOKINGS',
  'MANAGE_TOUR_ROUTES',
  'MANAGE_TOUR_VEHICLES',
  'VIEW_TOUR_REPORTS'
];

// Tüm modülleri tenant'a ekle
async function addAllModulesToTenant(tenantId: string) {
  const modules = await prisma.module.findMany({
    where: { isActive: true },
    select: { id: true, name: true }
  });

  for (const module of modules) {
    await prisma.tenantModule.create({
      data: {
        tenantId: tenantId,
        moduleId: module.id,
        isEnabled: true,
        activatedAt: new Date()
      }
    });
    console.log(`✅ ${module.name} modülü eklendi`);
  }
}

// Kullanıcıya varsayılan izinleri ekle
async function addDefaultPermissionsToUser(userId: string, permissions: string[]) {
  for (const permission of permissions) {
    await prisma.userPermission.create({
      data: {
        userId: userId,
        permission: permission,
        isActive: true,
        grantedAt: new Date()
      }
    });
  }
  console.log(`✅ ${permissions.length} varsayılan izin eklendi`);
}

async function main() {
  const args = process.argv.slice(2);
  const params: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (key && value && key.startsWith('--')) params[key.substring(2)] = value;
  }

  const name = params.name || params.company || params.companyName;
  const subdomain = params.subdomain || (name ? name.toLowerCase().replace(/\s+/g, '-') : undefined);
  const adminEmail = params.adminEmail;
  const adminUsername = params.adminUsername || (name ? `${subdomain}-admin` : undefined);
  const adminPassword = params.adminPassword || 'ChangeMe!123';

  if (!name || !subdomain || !adminEmail) {
    console.error('Usage: npm run tenant:create -- --name "Company" --adminEmail a@b.com [--subdomain company] [--adminUsername user] [--adminPassword pass]');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(adminPassword, 10);

  const tenant = await prisma.tenant.create({
    data: { companyName: name, subdomain, isActive: true }
  });

  const user = await prisma.user.create({
    data: {
      name: `${name} Admin`,
      email: adminEmail,
      username: adminUsername!,
      password: hashed,
      role: 'AGENCY_ADMIN'
    }
  });

  await prisma.tenantUser.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      role: 'AGENCY_ADMIN',
      isActive: true
    }
  });

  console.log('\n🔧 Otomatik kurulum başlatılıyor...');
  
  // Tüm modülleri tenant'a ekle
  await addAllModulesToTenant(tenant.id);
  
  // Admin kullanıcısına varsayılan izinleri ekle
  await addDefaultPermissionsToUser(user.id, AGENCY_ADMIN_PERMISSIONS);

  console.log('\n✅ Tenant kurulumu tamamlandı!');
  console.log('Tenant:', tenant.companyName, tenant.id);
  console.log('Admin user:', user.username, user.email);
  console.log(`Modüller: 4 aktif modül`);
  console.log(`İzinler: ${AGENCY_ADMIN_PERMISSIONS.length} varsayılan izin`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


