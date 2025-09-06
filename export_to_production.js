const { PrismaClient } = require('@prisma/client');

// Local SQLite veritabanından veri çekme
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./prisma/dev.db"
    }
  }
});

// Production PostgreSQL veritabanına veri yazma
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function exportToProduction() {
  try {
    console.log('🚀 Yerel veriler production\'a aktarılıyor...');

    // 1. Tenants
    const tenants = await localPrisma.tenant.findMany();
    console.log(`📊 ${tenants.length} tenant bulundu`);
    
    for (const tenant of tenants) {
      await productionPrisma.tenant.upsert({
        where: { id: tenant.id },
        update: tenant,
        create: tenant
      });
    }

    // 2. Modules
    const modules = await localPrisma.module.findMany();
    console.log(`📊 ${modules.length} modül bulundu`);
    
    for (const module of modules) {
      await productionPrisma.module.upsert({
        where: { id: module.id },
        update: module,
        create: module
      });
    }

    // 3. Tenant Modules
    const tenantModules = await localPrisma.tenantModule.findMany();
    console.log(`📊 ${tenantModules.length} tenant modül bulundu`);
    
    for (const tenantModule of tenantModules) {
      await productionPrisma.tenantModule.upsert({
        where: { id: tenantModule.id },
        update: tenantModule,
        create: tenantModule
      });
    }

    // 4. Users
    const users = await localPrisma.user.findMany();
    console.log(`📊 ${users.length} kullanıcı bulundu`);
    
    for (const user of users) {
      await productionPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }

    // 5. Tenant Users
    const tenantUsers = await localPrisma.tenantUser.findMany();
    console.log(`📊 ${tenantUsers.length} tenant kullanıcı bulundu`);
    
    for (const tenantUser of tenantUsers) {
      await productionPrisma.tenantUser.upsert({
        where: { id: tenantUser.id },
        update: tenantUser,
        create: tenantUser
      });
    }

    // 6. Drivers
    const drivers = await localPrisma.driver.findMany();
    console.log(`📊 ${drivers.length} şoför bulundu`);
    
    for (const driver of drivers) {
      await productionPrisma.driver.upsert({
        where: { id: driver.id },
        update: driver,
        create: driver
      });
    }

    // 7. Reservations
    const reservations = await localPrisma.reservation.findMany();
    console.log(`📊 ${reservations.length} rezervasyon bulundu`);
    
    for (const reservation of reservations) {
      await productionPrisma.reservation.upsert({
        where: { id: reservation.id },
        update: reservation,
        create: reservation
      });
    }

    // 8. Activities
    const activities = await localPrisma.activity.findMany();
    console.log(`📊 ${activities.length} aktivite bulundu`);
    
    for (const activity of activities) {
      await productionPrisma.activity.upsert({
        where: { id: activity.id },
        update: activity,
        create: activity
      });
    }

    console.log('✅ Tüm veriler başarıyla production\'a aktarıldı!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await localPrisma.$disconnect();
    await productionPrisma.$disconnect();
  }
}

exportToProduction();
