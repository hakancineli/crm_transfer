const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUetdsModule() {
  try {
    console.log('U-ETDS modülü oluşturuluyor...');
    
    // U-ETDS modülünü oluştur
    const uetdsModule = await prisma.module.upsert({
      where: { id: 'uetds' },
      update: {
        name: 'U-ETDS Entegrasyonu',
        description: 'Ulaştırma Elektronik Takip Denetim Sistemi entegrasyonu',
        isActive: true,
        priceMonthly: 40,
        priceYearly: 400,
        features: JSON.stringify([
          'uetds-sefer-bildirimi',
          'uetds-yolcu-yonetimi',
          'uetds-personel-yonetimi',
          'uetds-grup-yonetimi',
          'uetds-raporlama',
          'uetds-otomatik-bildirim'
        ])
      },
      create: {
        id: 'uetds',
        name: 'U-ETDS Entegrasyonu',
        description: 'Ulaştırma Elektronik Takip Denetim Sistemi entegrasyonu',
        isActive: true,
        priceMonthly: 40,
        priceYearly: 400,
        features: JSON.stringify([
          'uetds-sefer-bildirimi',
          'uetds-yolcu-yonetimi',
          'uetds-personel-yonetimi',
          'uetds-grup-yonetimi',
          'uetds-raporlama',
          'uetds-otomatik-bildirim'
        ])
      }
    });

    console.log('U-ETDS modülü başarıyla oluşturuldu:', uetdsModule);
    
    // Diğer modülleri de kontrol et ve oluştur
    const modules = [
      {
        id: 'transfer',
        name: 'Transfer Yönetimi',
        description: 'Transfer rezervasyonları, şoför yönetimi ve uçuş takibi',
        priceMonthly: 50,
        priceYearly: 500,
        features: JSON.stringify([
          'rezervasyon-yonetimi',
          'sofor-yonetimi', 
          'ucus-takibi',
          'musteri-yonetimi',
          'raporlama'
        ])
      },
      {
        id: 'accommodation',
        name: 'Konaklama Yönetimi',
        description: 'Otel rezervasyonları ve konaklama yönetimi',
        priceMonthly: 75,
        priceYearly: 750,
        features: JSON.stringify([
          'otel-rezervasyon',
          'booking-api-entegrasyonu',
          'oda-yonetimi',
          'konaklama-raporlari',
          'musteri-tercihleri'
        ])
      },
      {
        id: 'flight',
        name: 'Uçuş Yönetimi',
        description: 'Uçuş rezervasyonları ve takibi',
        priceMonthly: 25,
        priceYearly: 250,
        features: JSON.stringify([
          'ucus-rezervasyon',
          'ucus-takibi',
          'bilet-yonetimi',
          'ucus-raporlari'
        ])
      },
      {
        id: 'tour',
        name: 'Tur Yönetimi',
        description: 'Tur paketleri, rota yönetimi ve tur rezervasyonları',
        priceMonthly: 100,
        priceYearly: 1000,
        features: JSON.stringify([
          'tur-paketleri',
          'rota-yonetimi',
          'tur-rezervasyon',
          'rehber-yonetimi',
          'tur-raporlari'
        ])
      },
      {
        id: 'website',
        name: 'Website Modülü',
        description: 'Multi-tenant website builder ve domain yönetimi',
        priceMonthly: 30,
        priceYearly: 300,
        features: JSON.stringify([
          'website-builder',
          'domain-yonetimi',
          'seo-optimizasyonu',
          'analytics-entegrasyonu',
          'custom-tasarim'
        ])
      }
    ];

    for (const moduleData of modules) {
      await prisma.module.upsert({
        where: { id: moduleData.id },
        update: moduleData,
        create: moduleData
      });
      console.log(`${moduleData.name} modülü kontrol edildi/oluşturuldu`);
    }

    console.log('Tüm modüller başarıyla oluşturuldu!');
    
  } catch (error) {
    console.error('Modül oluşturma hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUetdsModule();
