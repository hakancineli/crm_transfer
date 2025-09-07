const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importProductionData() {
  try {
    console.log('🔄 Production verilerini import ediliyor...');

    // Rezervasyonları oku
    const reservationsData = JSON.parse(fs.readFileSync('production_reservations.json', 'utf8'));
    const driversData = JSON.parse(fs.readFileSync('production_drivers.json', 'utf8'));

    console.log(`📊 ${reservationsData.length} rezervasyon bulundu`);
    console.log(`👨‍💼 ${driversData.length} şoför bulundu`);

    // Önce şoförleri import et
    console.log('👨‍💼 Şoförler import ediliyor...');
    for (const driver of driversData) {
      await prisma.driver.upsert({
        where: { id: driver.id },
        update: {
          name: driver.name,
          phoneNumber: driver.phoneNumber,
        },
        create: {
          id: driver.id,
          name: driver.name,
          phoneNumber: driver.phoneNumber,
          createdAt: new Date(driver.createdAt),
        },
      });
    }

    // Rezervasyonları import et
    console.log('📋 Rezervasyonlar import ediliyor...');
    for (const reservation of reservationsData) {
      await prisma.reservation.upsert({
        where: { id: reservation.id },
        update: {
          date: reservation.date,
          time: reservation.time,
          from: reservation.from,
          to: reservation.to,
          flightCode: reservation.flightCode,
          passengerNames: JSON.stringify(reservation.passengerNames),
          luggageCount: reservation.luggageCount,
          price: reservation.price,
          currency: reservation.currency,
          phoneNumber: reservation.phoneNumber,
          distanceKm: reservation.distanceKm,
          voucherNumber: reservation.voucherNumber,
          driverFee: reservation.driverFee,
          driverId: reservation.driverId,
          userId: reservation.userId,
          paymentStatus: reservation.paymentStatus,
          companyCommissionStatus: reservation.companyCommissionStatus,
          returnTransferId: reservation.returnTransferId,
          isReturn: reservation.isReturn,
          createdAt: new Date(reservation.createdAt),
        },
        create: {
          id: reservation.id,
          tenantId: reservation.tenantId,
          date: reservation.date,
          time: reservation.time,
          from: reservation.from,
          to: reservation.to,
          flightCode: reservation.flightCode,
          passengerNames: JSON.stringify(reservation.passengerNames),
          luggageCount: reservation.luggageCount,
          price: reservation.price,
          currency: reservation.currency,
          phoneNumber: reservation.phoneNumber,
          distanceKm: reservation.distanceKm,
          voucherNumber: reservation.voucherNumber,
          driverFee: reservation.driverFee,
          driverId: reservation.driverId,
          userId: reservation.userId,
          paymentStatus: reservation.paymentStatus,
          companyCommissionStatus: reservation.companyCommissionStatus,
          returnTransferId: reservation.returnTransferId,
          isReturn: reservation.isReturn,
          createdAt: new Date(reservation.createdAt),
        },
      });
    }

    console.log('✅ Production verileri başarıyla import edildi!');
    
    // İstatistikleri göster
    const totalReservations = await prisma.reservation.count();
    const totalDrivers = await prisma.driver.count();
    
    console.log(`📊 Toplam rezervasyon: ${totalReservations}`);
    console.log(`👨‍💼 Toplam şoför: ${totalDrivers}`);

  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importProductionData();
