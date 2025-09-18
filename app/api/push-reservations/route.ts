import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Güvenlik için basit bir token kontrolü
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MIGRATION_TOKEN || 'migration-secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


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
    const results = [];
    for (const reservation of reservations) {
      const result = await prisma.reservation.upsert({
        where: { id: reservation.id },
        update: reservation,
        create: reservation
      });
      results.push(result);
      console.log(`✅ ${reservation.voucherNumber} rezervasyonu eklendi`);
    }


    return NextResponse.json({ 
      success: true, 
      message: 'Rezervasyonlar başarıyla production\'a aktarıldı!',
      data: {
        count: results.length,
        reservations: results.map(r => ({
          voucherNumber: r.voucherNumber,
          date: r.date,
          time: r.time,
          from: r.from,
          to: r.to,
          price: r.price,
          currency: r.currency
        }))
      }
    });

  } catch (error) {
    console.error('❌ Rezervasyon push hatası:', error);
    return NextResponse.json({ 
      error: 'Rezervasyon push failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
