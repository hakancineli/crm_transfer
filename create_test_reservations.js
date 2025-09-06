const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestReservations() {
  try {
    console.log('Test rezervasyonları oluşturuluyor...');

    // Test rezervasyonları oluştur
    const reservations = [
      {
        voucherNumber: 'VIP20250117-001',
        date: '2025-01-20',
        time: '14:30',
        from: 'İstanbul Havalimanı (IST)',
        to: 'Sultanahmet Hotel',
        flightCode: 'TK001',
        passengerNames: JSON.stringify(['Ahmet Yılmaz', 'Fatma Yılmaz']),
        luggageCount: 3,
        price: 150.00,
        currency: 'USD',
        phoneNumber: '+905551234567',
        distanceKm: 45,
        paymentStatus: 'PENDING'
      },
      {
        voucherNumber: 'VIP20250117-002',
        date: '2025-01-21',
        time: '09:15',
        from: 'Sabiha Gökçen (SAW)',
        to: 'Taksim Square',
        flightCode: 'PC123',
        passengerNames: JSON.stringify(['Mehmet Demir']),
        luggageCount: 1,
        price: 75.00,
        currency: 'USD',
        phoneNumber: '+905559876543',
        distanceKm: 35,
        paymentStatus: 'PAID'
      },
      {
        voucherNumber: 'VIP20250117-003',
        date: '2025-01-22',
        time: '16:45',
        from: 'Kadıköy',
        to: 'İstanbul Havalimanı (IST)',
        flightCode: 'TK456',
        passengerNames: JSON.stringify(['Ayşe Kaya', 'Ali Kaya', 'Zeynep Kaya']),
        luggageCount: 5,
        price: 200.00,
        currency: 'USD',
        phoneNumber: '+905551112233',
        distanceKm: 50,
        paymentStatus: 'PENDING'
      }
    ];

    for (const reservation of reservations) {
      await prisma.reservation.create({
        data: reservation
      });
      console.log(`Rezervasyon oluşturuldu: ${reservation.voucherNumber}`);
    }

    console.log('Tüm test rezervasyonları başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Test rezervasyonları oluşturulurken hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReservations();

