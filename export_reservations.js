const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./prisma/dev.db"
    }
  }
});

async function exportReservations() {
  try {
    console.log('📊 Rezervasyonlar export ediliyor...');
    
    const reservations = await prisma.reservation.findMany({
      include: {
        driver: true,
        user: true
      }
    });
    
    console.log(`✅ ${reservations.length} rezervasyon bulundu`);
    
    // JSON formatında yazdır
    console.log('\n📋 Rezervasyonlar:');
    reservations.forEach((res, index) => {
      console.log(`\n${index + 1}. ${res.voucherNumber}`);
      console.log(`   Tarih: ${res.date} ${res.time}`);
      console.log(`   Güzergah: ${res.from} → ${res.to}`);
      console.log(`   Yolcular: ${res.passengerNames}`);
      console.log(`   Fiyat: ${res.price} ${res.currency}`);
      console.log(`   Şoför: ${res.driver?.name || 'Atanmamış'}`);
      console.log(`   Durum: ${res.paymentStatus}`);
    });
    
    return reservations;
    
  } catch (error) {
    console.error('❌ Export hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportReservations();
