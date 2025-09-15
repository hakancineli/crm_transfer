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

    // Tur modülü
    const tourModule = await prisma.module.upsert({
      where: { name: 'Tur Yönetimi' },
      update: {},
      create: {
        name: 'Tur Yönetimi',
        description: 'Tur rezervasyonları ve tur yönetimi',
        isActive: true,
        priceMonthly: 60,
        priceYearly: 600,
        features: JSON.stringify([
          'tur-rezervasyon',
          'rota-yonetimi',
          'arac-yonetimi',
          'tur-raporlari',
          'musteri-yonetimi'
        ])
      }
    });
    console.log('✅ Tur modülü oluşturuldu:', tourModule.id);

    console.log('\n🎉 Tüm modüller başarıyla oluşturuldu!');
    
    // Mevcut tenant'lara modülleri varsayılan olarak ekle
    const tenants = await prisma.tenant.findMany();
    console.log(`\n${tenants.length} tenant bulundu, modüller ekleniyor...`);
    
    for (const tenant of tenants) {
      // Transfer modülü
      const existingTransferModule = await prisma.tenantModule.findUnique({
        where: {
          tenantId_moduleId: {
            tenantId: tenant.id,
            moduleId: transferModule.id
          }
        }
      });

      if (!existingTransferModule) {
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

      // Tur modülü
      const existingTourModule = await prisma.tenantModule.findUnique({
        where: {
          tenantId_moduleId: {
            tenantId: tenant.id,
            moduleId: tourModule.id
          }
        }
      });

      if (!existingTourModule) {
        await prisma.tenantModule.create({
          data: {
            tenantId: tenant.id,
            moduleId: tourModule.id,
            isEnabled: true,
            activatedAt: new Date(),
            features: JSON.stringify([
              'tur-rezervasyon',
              'rota-yonetimi',
              'arac-yonetimi',
              'tur-raporlari',
              'musteri-yonetimi'
            ])
          }
        });
        console.log(`✅ ${tenant.companyName} için tur modülü eklendi`);
      } else {
        console.log(`ℹ️  ${tenant.companyName} zaten tur modülüne sahip`);
      }
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createModules();
