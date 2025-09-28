import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Güvenlik için basit bir token kontrolü
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MIGRATION_TOKEN || 'migration-secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    // Mevcut rezervasyonları production'a aktar
    const testData = {
      tenants: [
        {
          id: 'tenant-1',
          subdomain: 'protransfer',
          companyName: 'ProTransfer',
          domain: 'protransfer.com.tr',
          isActive: true,
          subscriptionPlan: 'premium'
        }
      ],
      modules: [
        {
          id: 'module-1',
          name: 'transfer',
          description: 'Transfer yönetimi modülü',
          isActive: true,
          priceMonthly: 50.0,
          priceYearly: 500.0,
          features: '["reservations", "drivers", "reports"]'
        },
        {
          id: 'module-2',
          name: 'accommodation',
          description: 'Konaklama modülü',
          isActive: true,
          priceMonthly: 30.0,
          priceYearly: 300.0,
          features: '["hotel_bookings", "price_pool"]'
        }
      ],
      tenantModules: [
        {
          id: 'tm-1',
          tenantId: 'tenant-1',
          moduleId: 'module-1',
          isEnabled: true,
          activatedAt: new Date()
        },
        {
          id: 'tm-2',
          tenantId: 'tenant-1',
          moduleId: 'module-2',
          isEnabled: true,
          activatedAt: new Date()
        }
      ],
      users: [
        {
          id: 'user-1',
          username: 'admin',
          email: 'admin@protransfer.com.tr',
          password: '$2b$10$ZvoVC5f/3rmoxaA9RPobrOuy2P782FT4h157jLAZ5P4vb0g4s4Mn2',
          name: 'Admin User',
          role: 'SUPERUSER' as const,
          isActive: true
        },
        {
          id: 'user-2',
          username: 'seller1',
          email: 'seller1@protransfer.com.tr',
          password: '$2b$10$zgj8DLl6n/oHmx7bKhV33usjdi1Rlox2HbBD8PKE6WdWRA/zuxZDe',
          name: 'Satış Personeli 1',
          role: 'SELLER' as const,
          isActive: true
        },
        {
          id: 'user-3',
          username: 'operation',
          email: 'operation@protransfer.com.tr',
          password: '$2b$10$bF07oxPoFLv7OiiZBwB8i.9Aifu.OYitK7apPFlfgXsRebEWj6Esi',
          name: 'Operasyon Personeli',
          role: 'OPERATION' as const,
          isActive: true
        }
      ],
      tenantUsers: [
        {
          id: 'tu-1',
          tenantId: 'tenant-1',
          userId: 'user-1',
          role: 'ADMIN',
          permissions: '["ALL"]',
          isActive: true
        },
        {
          id: 'tu-2',
          tenantId: 'tenant-1',
          userId: 'user-2',
          role: 'SELLER' as const,
          permissions: '["VIEW_OWN_SALES", "CREATE_RESERVATIONS"]',
          isActive: true
        },
        {
          id: 'tu-3',
          tenantId: 'tenant-1',
          userId: 'user-3',
          role: 'OPERATION' as const,
          permissions: '["VIEW_ALL_RESERVATIONS", "ASSIGN_DRIVERS"]',
          isActive: true
        }
      ],
      drivers: [
        {
          id: 'driver-1',
          name: 'Ahmet Yılmaz',
          phoneNumber: '+90 532 123 45 67'
        },
        {
          id: 'driver-2',
          name: 'Mehmet Demir',
          phoneNumber: '+90 533 234 56 78'
        },
        {
          id: 'driver-3',
          name: 'Ali Kaya',
          phoneNumber: '+90 534 345 67 89'
        }
      ],
      reservations: [
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
      ]
    };

    console.log('🚀 Test verileri production veritabanına aktarılıyor...');

    // Verileri sırayla oluştur
    for (const tenant of testData.tenants) {
      await prisma.tenant.upsert({
        where: { id: tenant.id },
        update: tenant,
        create: tenant
      });
    }

    for (const module of testData.modules) {
      await prisma.module.upsert({
        where: { id: module.id },
        update: module,
        create: module
      });
    }

    for (const tenantModule of testData.tenantModules) {
      await prisma.tenantModule.upsert({
        where: { id: tenantModule.id },
        update: tenantModule,
        create: tenantModule
      });
    }

    for (const user of testData.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }

    for (const tenantUser of testData.tenantUsers) {
      await prisma.tenantUser.upsert({
        where: { id: tenantUser.id },
        update: tenantUser,
        create: tenantUser
      });
    }

    for (const driver of testData.drivers) {
      await prisma.driver.upsert({
        where: { id: driver.id },
        update: driver,
        create: driver
      });
    }

    for (const reservation of testData.reservations) {
      await prisma.reservation.upsert({
        where: { id: reservation.id },
        update: reservation,
        create: reservation
      });
    }

    await prisma.$disconnect();

    return NextResponse.json({ 
      success: true, 
      message: 'Test verileri başarıyla production veritabanına aktarıldı!',
      data: {
        tenants: testData.tenants.length,
        modules: testData.modules.length,
        tenantModules: testData.tenantModules.length,
        users: testData.users.length,
        tenantUsers: testData.tenantUsers.length,
        drivers: testData.drivers.length,
        reservations: testData.reservations.length
      }
    });

  } catch (error) {
    console.error('❌ Migration hatası:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
