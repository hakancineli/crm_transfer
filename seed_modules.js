const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedModules() {
  try {
    console.log('🌱 Modüller oluşturuluyor...');

    // Modülleri oluştur
    const modules = [
      {
        id: 'transfer',
        name: 'Transfer Yönetimi',
        description: 'Transfer rezervasyonları, şoför yönetimi ve uçuş takibi',
        isActive: true,
        priceMonthly: 50,
        priceYearly: 500,
        features: [
          'rezervasyon-yonetimi',
          'sofor-yonetimi', 
          'ucus-takibi',
          'musteri-yonetimi',
          'raporlama'
        ]
      },
      {
        id: 'accommodation',
        name: 'Konaklama Yönetimi',
        description: 'Otel rezervasyonları ve konaklama yönetimi',
        isActive: true,
        priceMonthly: 75,
        priceYearly: 750,
        features: [
          'otel-rezervasyon',
          'booking-api-entegrasyonu',
          'oda-yonetimi',
          'konaklama-raporlari',
          'musteri-tercihleri'
        ]
      },
      {
        id: 'flight',
        name: 'Uçuş Yönetimi',
        description: 'Uçuş rezervasyonları ve takibi',
        isActive: true,
        priceMonthly: 25,
        priceYearly: 250,
        features: [
          'ucus-rezervasyon',
          'ucus-takibi',
          'bilet-yonetimi',
          'ucus-raporlari'
        ]
      }
    ];

    for (const moduleData of modules) {
      await prisma.module.upsert({
        where: { id: moduleData.id },
        update: moduleData,
        create: moduleData
      });
      console.log(`✅ Modül oluşturuldu: ${moduleData.name}`);
    }

    // Test tenant'ı oluştur
    console.log('🏢 Test tenant oluşturuluyor...');
    const testTenant = await prisma.tenant.upsert({
      where: { subdomain: 'demo' },
      update: {},
      create: {
        subdomain: 'demo',
        companyName: 'Demo Transfer Acentesi',
        domain: 'demo.protransfer.com',
        isActive: true,
        subscriptionPlan: 'professional'
      }
    });
    console.log(`✅ Test tenant oluşturuldu: ${testTenant.companyName}`);

    // Demo tenant'a transfer modülünü ata
    await prisma.tenantModule.upsert({
      where: {
        tenantId_moduleId: {
          tenantId: testTenant.id,
          moduleId: 'transfer'
        }
      },
      update: { isEnabled: true },
      create: {
        tenantId: testTenant.id,
        moduleId: 'transfer',
        isEnabled: true,
        activatedAt: new Date()
      }
    });
    console.log('✅ Transfer modülü demo tenant\'a atandı');

    console.log('🎉 Seed işlemi tamamlandı!');
  } catch (error) {
    console.error('❌ Seed işlemi sırasında hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedModules();
