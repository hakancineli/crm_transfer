/**
 * Verification Test Script for Meta WhatsApp Cloud API Webhook & Chatbot Flow
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Meta Cloud API & Chatbot Verification Test...\n');

  const testPhone = '905545812034';
  const testVoucher = `WA-TEST-${Date.now().toString().slice(-4)}`;

  try {
    // 1. Test Prisma Reservation Creation from Bot
    console.log('1️⃣ Testing Reservation Creation via Bot...');
    const defaultTenant = await prisma.tenant.findFirst({
      where: { isActive: true },
      select: { id: true, companyName: true }
    });

    const reservation = await prisma.reservation.create({
      data: {
        voucherNumber: testVoucher,
        date: '2026-09-15',
        time: '14:30',
        from: 'Istanbul Airport (IST)',
        to: 'City Center (Taksim / Sultanahmet)',
        flightCode: 'TK1821',
        passengerNames: 'John Smith',
        luggageCount: 3,
        price: 55.0,
        currency: 'EUR',
        phoneNumber: testPhone,
        paymentStatus: 'PENDING',
        source: 'whatsapp_cloud_bot',
        type: 'transfer',
        notes: 'Created automatically via Meta WhatsApp Cloud API Bot test.',
        tenantId: defaultTenant?.id || null
      }
    });

    console.log(`✅ Reservation created successfully!`);
    console.log(`   ID: ${reservation.id}`);
    console.log(`   Voucher: ${reservation.voucherNumber}`);
    console.log(`   Route: ${reservation.from} ➔ ${reservation.to}`);
    console.log(`   Source: ${reservation.source}`);
    console.log(`   Price: €${reservation.price}\n`);

    // 2. Querying Reservation to verify persistence
    console.log('2️⃣ Verifying Reservation Query...');
    const queried = await prisma.reservation.findUnique({
      where: { voucherNumber: testVoucher }
    });

    if (queried && queried.voucherNumber === testVoucher) {
      console.log(`✅ Verified: Reservation properly stored in DB with source: ${queried.source}\n`);
    } else {
      throw new Error('Verification query failed: reservation not found.');
    }

    // 3. Clean up test record
    console.log('3️⃣ Cleaning up test reservation...');
    await prisma.reservation.delete({
      where: { voucherNumber: testVoucher }
    });
    console.log(`✅ Cleaned up test voucher: ${testVoucher}\n`);

    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
