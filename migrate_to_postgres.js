const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function migrateData() {
  try {
    // Local SQLite'den verileri oku
    const reservationsData = fs.readFileSync('reservations.json', 'utf8');
    const reservations = reservationsData.trim().split('\n').map(line => JSON.parse(line));

    console.log(`Found ${reservations.length} reservations to migrate`);

    // PostgreSQL'e aktar
    for (const reservation of reservations) {
      try {
        // Driver'ı oluştur veya bul
        let driver = null;
        if (reservation.driverId) {
          driver = await prisma.driver.upsert({
            where: { id: reservation.driverId },
            update: {},
            create: {
              id: reservation.driverId,
              name: 'Unknown Driver', // Driver bilgisi yoksa varsayılan
              phoneNumber: null
            }
          });
        }

        // Reservation'ı oluştur veya güncelle
        await prisma.reservation.upsert({
          where: { id: reservation.id },
          update: {},
          create: {
            id: reservation.id,
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
            paymentStatus: reservation.paymentStatus,
            createdAt: new Date(reservation.createdAt),
            returnTransferId: reservation.returnTransferId,
            isReturn: Boolean(reservation.isReturn)
          }
        });

        console.log(`✅ Migrated reservation: ${reservation.voucherNumber}`);
      } catch (error) {
        console.log(`❌ Error migrating ${reservation.voucherNumber}:`, error.message);
      }
    }

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
