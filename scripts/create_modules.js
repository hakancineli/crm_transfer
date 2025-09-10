const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createModules() {
  try {
    console.log('Modüller oluşturuluyor...');

    // Transfer modülü
    const transferModule = await prisma.module.upsert({
      where: { name: 'Transfer Yönetimi' },
      update: {},
      create: {
        name: 'Transfer Yönetimi',
        description: 'Transfer rezervasyonları, şoför yönetimi ve uçuş takibi',
        isActive: true,
        priceMonthly: 50,
        priceYearly: 500,
        features: JSON.stringify([
          'rezervasyon-yonetimi',
          'sofor-yonetimi', 
          'ucus-takibi',
          'musteri-yonetimi',
          'raporlama'
        ])
      }
    });
    console.log('✅ Transfer modülü oluşturuldu:', transferModule.id);

    // Konaklama modülü
    const accommodationModule = await prisma.module.upsert({
      where: { name: 'Konaklama Yönetimi' },
      update: {},
      create: {
        name: 'Konaklama Yönetimi',
        description: 'Otel rezervasyonları ve konaklama yönetimi',
        isActive: true,
        priceMonthly: 75,
        priceYearly: 750,
        features: JSON.stringify([
          'otel-rezervasyon',
          'booking-api-entegrasyonu',
          'oda-yonetimi',
          'konaklama-raporlari',
          'musteri-tercihleri'
        ])
      }
    });
    console.log('✅ Konaklama modülü oluşturuldu:', accommodationModule.id);

    // Uçuş modülü
    const flightModule = await prisma.module.upsert({
      where: { name: 'Uçuş Yönetimi' },
      update: {},
      create: {
        name: 'Uçuş Yönetimi',
        description: 'Uçuş rezervasyonları ve takibi',
        isActive: true,
        priceMonthly: 25,
        priceYearly: 250,
        features: JSON.stringify([
          'ucus-rezervasyon',
          'ucus-takibi',
          'bilet-yonetimi',
          'ucus-raporlari'
        ])
      }
    });
    console.log('✅ Uçuş modülü oluşturuldu:', flightModule.id);

    console.log('\n🎉 Tüm modüller başarıyla oluşturuldu!');
    
    // Mevcut tenant'lara transfer modülünü varsayılan olarak ekle
    const tenants = await prisma.tenant.findMany();
    console.log(`\n${tenants.length} tenant bulundu, transfer modülü ekleniyor...`);
    
    for (const tenant of tenants) {
      const existingModule = await prisma.tenantModule.findUnique({
        where: {
          tenantId_moduleId: {
            tenantId: tenant.id,
            moduleId: transferModule.id
          }
        }
      });

      if (!existingModule) {
        await prisma.tenantModule.create({
          data: {
            tenantId: tenant.id,
            moduleId: transferModule.id,
            isEnabled: true,
            activatedAt: new Date(),
            features: JSON.stringify([
              'rezervasyon-yonetimi',
              'sofor-yonetimi', 
              'ucus-takibi',
              'musteri-yonetimi',
              'raporlama'
            ])
          }
        });
        console.log(`✅ ${tenant.companyName} için transfer modülü eklendi`);
      } else {
        console.log(`ℹ️  ${tenant.companyName} zaten transfer modülüne sahip`);
      }
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createModules();
