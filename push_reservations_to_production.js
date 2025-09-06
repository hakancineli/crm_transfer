const { PrismaClient } = require('@prisma/client');

// Production veritabanına bağlan
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function pushReservationsToProduction() {
  try {
    console.log('🚀 Rezervasyonlar production\'a aktarılıyor...');

    // Mevcut rezervasyonlar
    const reservations = [
      {
        id: 'res-1',
        tenantId: 'tenant-1',
        date: '2025-01-15',
        time: '14:30',
        from: 'İstanbul Havalimanı',
        to: 'Beşiktaş',
        flightCode: 'TK1234',
        passengerNames: '["Ahmet Yılmaz", "Ayşe Yılmaz"]',
        luggageCount: 2,
        price: 150.0,
        currency: 'USD',
        phoneNumber: '+90 532 111 22 33',
        distanceKm: 45.5,
        voucherNumber: 'TK1234-001',
        driverFee: 75.0,
        driverId: 'driver-1',
        userId: 'user-2',
        paymentStatus: 'RECEIVED',
        companyCommissionStatus: 'APPROVED'
      },
      {
        id: 'res-2',
        tenantId: 'tenant-1',
        date: '2025-01-16',
        time: '09:15',
        from: 'Sabiha Gökçen',
        to: 'Kadıköy',
        flightCode: 'PC5678',
        passengerNames: '["Mehmet Demir"]',
        luggageCount: 1,
        price: 120.0,
        currency: 'USD',
        phoneNumber: '+90 533 222 33 44',
        distanceKm: 38.2,
        voucherNumber: 'PC5678-002',
        driverFee: 60.0,
        driverId: 'driver-2',
        userId: 'user-2',
        paymentStatus: 'PENDING',
        companyCommissionStatus: 'PENDING'
      },
      {
        id: 'res-3',
        tenantId: 'tenant-1',
        date: '2025-01-17',
        time: '16:45',
        from: 'Taksim',
        to: 'İstanbul Havalimanı',
        flightCode: 'TK9012',
        passengerNames: '["Ali Kaya", "Fatma Kaya", "Zeynep Kaya"]',
        luggageCount: 3,
        price: 180.0,
        currency: 'USD',
        phoneNumber: '+90 534 333 44 55',
        distanceKm: 42.8,
        voucherNumber: 'TK9012-003',
        driverFee: 90.0,
        driverId: 'driver-3',
        userId: 'user-2',
        paymentStatus: 'RECEIVED',
        companyCommissionStatus: 'APPROVED'
      }
    ];

    // Rezervasyonları production'a ekle
    for (const reservation of reservations) {
      await prisma.reservation.upsert({
        where: { id: reservation.id },
        update: reservation,
        create: reservation
      });
      console.log(`✅ ${reservation.voucherNumber} rezervasyonu eklendi`);
    }

    console.log('🎉 Tüm rezervasyonlar başarıyla production\'a aktarıldı!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

pushReservationsToProduction();
