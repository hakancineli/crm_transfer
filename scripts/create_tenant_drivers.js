const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createTenantDrivers() {
  try {
    console.log('Tenant şoförleri oluşturuluyor...');

    // Tenant'ları al
    const tenants = await prisma.tenant.findMany({
      select: { id: true, companyName: true, subdomain: true }
    });

    console.log(`Bulunan tenant sayısı: ${tenants.length}`);

    for (const tenant of tenants) {
      console.log(`\n${tenant.companyName} için şoförler oluşturuluyor...`);

      // Her tenant için 2-3 şoför oluştur
      const drivers = [
        { name: `${tenant.companyName} Şoför 1`, phoneNumber: '0555-000-0001' },
        { name: `${tenant.companyName} Şoför 2`, phoneNumber: '0555-000-0002' },
        { name: `${tenant.companyName} Şoför 3`, phoneNumber: '0555-000-0003' }
      ];

      for (const driverData of drivers) {
        try {
          // Önce var mı kontrol et
          const existing = await prisma.driver.findFirst({
            where: {
              name: driverData.name,
              tenantId: tenant.id
            }
          });

          if (existing) {
            console.log(`  - ${driverData.name} zaten mevcut`);
            continue;
          }

          const driver = await prisma.driver.create({
            data: {
              name: driverData.name,
              phoneNumber: driverData.phoneNumber,
              tenantId: tenant.id
            }
          });
          console.log(`  ✓ ${driver.name} oluşturuldu`);
        } catch (error) {
          console.error(`  ✗ ${driverData.name} oluşturulamadı:`, error.message);
        }
      }
    }

    console.log('\nTenant şoförleri başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTenantDrivers();
