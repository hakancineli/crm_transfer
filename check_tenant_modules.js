const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTenantModules() {
  try {
    console.log('🔍 Demo tenant modül durumu kontrol ediliyor...');

    // Demo tenant'ı bul
    const demoTenant = await prisma.tenant.findUnique({
      where: { subdomain: 'demo' },
      include: {
        modules: {
          include: {
            module: true
          }
        }
      }
    });

    if (!demoTenant) {
      console.log('❌ Demo tenant bulunamadı');
      return;
    }

    console.log(`✅ Demo tenant bulundu: ${demoTenant.companyName}`);
    console.log(`📊 Toplam modül sayısı: ${demoTenant.modules.length}`);

    demoTenant.modules.forEach(tm => {
      console.log(`- ${tm.module.name}: ${tm.isEnabled ? '✅ Aktif' : '❌ Pasif'}`);
    });

    // Konaklama modülü kontrolü
    const accommodationModule = demoTenant.modules.find(tm => tm.moduleId === 'accommodation');
    if (accommodationModule) {
      console.log(`🏨 Konaklama modülü: ${accommodationModule.isEnabled ? '✅ Aktif' : '❌ Pasif'}`);
    } else {
      console.log('❌ Konaklama modülü bulunamadı');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenantModules();
