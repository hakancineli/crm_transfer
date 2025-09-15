import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

// Modül durumunu kontrol eden yardımcı fonksiyon
async function getModuleStatus(userRole: string | null, tenantIds: string[]) {
  // SUPERUSER için tüm modüller aktif
  if (userRole === 'SUPERUSER') {
    return {
      transfer: true,
      accommodation: true,
      flight: true,
      tour: true
    };
  }

  // Diğer roller için tenant modüllerini kontrol et
  if (tenantIds && tenantIds.length > 0) {
    try {
      const tenantModules = await prisma.tenantModule.findMany({
        where: {
          tenantId: { in: tenantIds },
          isEnabled: true
        },
        include: {
          module: true
        }
      });

      const modules = {
        transfer: true, // Transfer her zaman aktif
        accommodation: false,
        flight: false,
        tour: false
      };

      tenantModules.forEach(tm => {
        const moduleName = tm.module.name.toLowerCase();
        if (moduleName.includes('konaklama') || moduleName.includes('accommodation')) {
          modules.accommodation = true;
        } else if (moduleName.includes('uçuş') || moduleName.includes('flight')) {
          modules.flight = true;
        } else if (moduleName.includes('tur') || moduleName.includes('tour')) {
          modules.tour = true;
        }
      });

      return modules;
    } catch (error) {
      console.error('Modül durumu kontrol hatası:', error);
    }
  }

  // Varsayılan durum
  return {
    transfer: true,
    accommodation: false,
    flight: false,
    tour: false
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('API: Rezervasyonlar getiriliyor...');
    
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    
    // Modül durumunu kontrol et
    const moduleStatus = await getModuleStatus(role, tenantIds || []);
    console.log('API: Modül durumu:', moduleStatus);
    
    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const filter = searchParams.get('filter') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Where clause oluştur
    let whereClause: any = {};

    // Tenant filtrelemesi ekle
    if (role !== 'SUPERUSER' && tenantIds && tenantIds.length > 0) {
      whereClause.tenantId = { in: tenantIds };
    }

    // Tarih filtresi
    if (dateFrom && dateTo) {
      whereClause.date = {
        gte: dateFrom,
        lte: dateTo
      };
    }

    // Durum filtresi
    if (filter !== 'all') {
      whereClause.paymentStatus = filter;
    }

    console.log('API: Where clause:', whereClause);

    // Transfer rezervasyonlarını getir
    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      orderBy: [
        { date: 'desc' },
        { time: 'desc' }
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        tenant: {
          select: {
            id: true,
            companyName: true,
            subdomain: true
          }
        }
      }
    });

    console.log('API: Bulunan rezervasyon sayısı:', reservations.length);

    // Rezervasyonları parse et
    const parsedReservations = reservations.map(reservation => {
      // Rezervasyon tipini belirle
      let reservationType = 'Transfer';
      
      // Modül durumuna göre tip belirleme
      if (moduleStatus.tour && reservation.from?.toLowerCase().includes('tur')) {
        reservationType = 'Tur';
      } else if (moduleStatus.accommodation && reservation.from?.toLowerCase().includes('otel')) {
        reservationType = 'Konaklama';
      }
      // Uçuş etiketi kaldırıldı - sadece Transfer, Tur ve Konaklama kullanılıyor
      
      return {
        id: reservation.id,
        voucherNumber: reservation.voucherNumber,
        date: reservation.date,
        time: reservation.time,
        from: reservation.from,
        to: reservation.to,
        passengerNames: JSON.parse(reservation.passengerNames || '[]'),
        price: reservation.price,
        currency: reservation.currency,
        paymentStatus: reservation.paymentStatus,
        driverFee: reservation.driverFee,
        user: reservation.user,
        createdAt: reservation.createdAt.toISOString(),
        companyCommissionStatus: reservation.companyCommissionStatus,
        type: 'transfer' as const
      };
    });

    // Tur rezervasyonlarını getir - sadece tur modülü aktifse
    let tourBookings: any[] = [];
    console.log('API: Tur modülü aktif mi?', moduleStatus.tour);
    if (moduleStatus.tour) {
      // Tur rezervasyonları için ayrı where clause
      const tourWhereClause: any = {};
      if (role !== 'SUPERUSER' && tenantIds && tenantIds.length > 0) {
        tourWhereClause.tenantId = { in: tenantIds };
      }
      
      // Tarih filtresi
      if (dateFrom && dateTo) {
        tourWhereClause.tourDate = {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        };
      }
      
      // Durum filtresi
      if (filter !== 'all') {
        tourWhereClause.status = filter;
      }

      tourBookings = await prisma.tourBooking.findMany({
        where: tourWhereClause,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          tenant: {
            select: {
              id: true,
              companyName: true,
              subdomain: true
            }
          },
          driver: {
            select: {
              id: true,
              name: true,
              phoneNumber: true
            }
          }
        }
      });
      console.log('API: Bulunan tur rezervasyon sayısı:', tourBookings.length);
    }

    const parsedTourBookings = tourBookings.map(booking => ({
      id: booking.id,
      voucherNumber: booking.voucherNumber,
      date: booking.tourDate.toISOString().split('T')[0],
      time: booking.tourTime || '00:00',
      from: booking.pickupLocation,
      to: booking.routeName,
      passengerNames: JSON.parse(booking.passengerNames || '[]'),
      price: booking.price,
      currency: booking.currency,
      paymentStatus: booking.status,
      driverFee: null,
      user: null,
      createdAt: booking.createdAt.toISOString(),
      companyCommissionStatus: 'PENDING',
      type: 'Tur' as const
    }));

    // Tüm rezervasyonları birleştir ve tarihe göre sırala
    const allReservations = [...parsedReservations, ...parsedTourBookings]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(allReservations);
  } catch (error) {
    console.error('Rezervasyonları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Rezervasyonlar getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { userId: currentUserId, role, tenantIds } = await getRequestUserContext(request);

        // Check if this is a customer reservation (no auth token)
        const isCustomerReservation = !currentUserId;
        
        // Permission: require CREATE_RESERVATIONS unless SUPERUSER or customer reservation
        if (role !== 'SUPERUSER' && !isCustomerReservation) {
          let allowed = false;
          if (currentUserId) {
            const perms = await prisma.userPermission.findMany({
              where: { userId: currentUserId, isActive: true },
              select: { permission: true }
            });
            allowed = perms.some(p => p.permission === 'CREATE_RESERVATIONS');
          }
          if (!allowed) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
          }
        }

        // Determine tenant
        const currentTenantId: string | null = role === 'SUPERUSER' ? null : (tenantIds && tenantIds.length > 0 ? tenantIds[0] : null);
        
        // Yolcu isimlerini JSON string'e çevir
        const passengerNames = Array.isArray(data.passengerNames) 
            ? JSON.stringify(data.passengerNames)
            : JSON.stringify([]);

        // Voucher numarası oluştur - daha güvenli algoritma
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        
        // O günkü mevcut voucher numaralarını al
        const todayVouchers = await prisma.reservation.findMany({
            where: {
                voucherNumber: {
                    startsWith: `VIP${formattedDate}-`
                }
            },
            select: {
                voucherNumber: true
            }
        });
        
        // Sıradaki numarayı bul
        let nextNumber = 1;
        if (todayVouchers.length > 0) {
            const numbers = todayVouchers.map(v => {
                const match = v.voucherNumber.match(/VIP\d+-(\d+)/);
                return match ? parseInt(match[1]) : 0;
            });
            nextNumber = Math.max(...numbers) + 1;
        }
        
        const voucherNumber = `VIP${formattedDate}-${nextNumber}`;

        const reservation = await prisma.reservation.create({
            data: {
                date: data.date,
                time: data.time,
                from: data.from,
                to: data.to,
                flightCode: data.flightCode,
                passengerNames,
                luggageCount: data.luggageCount,
                price: data.price,
                currency: data.currency,
                phoneNumber: data.phoneNumber,
                distanceKm: data.distanceKm,
                voucherNumber,
                driverId: null,
                driverFee: null,
                userId: currentUserId || null,
                tenantId: currentTenantId || null
            }
        });

        // Telegram bildirimi (opsiyonel + log)
        let telegramAttempted = false;
        let telegramOk = false;
        try {
            const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
            const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
            if (BOT_TOKEN && CHAT_ID) {
                telegramAttempted = true;
                const textLines = [
                    isCustomerReservation ? 'Yeni Müşteri Talebi ✅' : 'Yeni Rezervasyon Oluşturuldu ✅',
                    `Voucher: ${voucherNumber}`,
                    `Tarih: ${data.date} ${data.time}`,
                    `Güzergah: ${data.from} → ${data.to}`,
                    `Yolcular: ${(Array.isArray(data.passengerNames) ? data.passengerNames.join(', ') : '') || '-'}`,
                    data.phoneNumber ? `Telefon: ${data.phoneNumber}` : undefined,
                    data.flightCode ? `Uçuş: ${data.flightCode}` : undefined,
                    data.specialRequests ? `Not: ${data.specialRequests}` : undefined
                ].filter(Boolean).join('\n');

                // Fire-and-forget with timeout (prevents slow create)
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 1500);
                fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: String(CHAT_ID), text: textLines }),
                    signal: controller.signal
                })
                .then(async (tgRes) => {
                    clearTimeout(timeout);
                    if (!tgRes.ok) {
                        const errText = await tgRes.text();
                        console.error('Telegram bildirim hatası (response):', tgRes.status, errText);
                    } else {
                        telegramOk = true;
                    }
                })
                .catch((e) => {
                    clearTimeout(timeout);
                    console.error('Telegram fetch error:', e?.name || e);
                });
            } else {
                console.warn('Telegram env eksik: BOT_TOKEN veya CHAT_ID yok');
            }
        } catch (notifyErr) {
            console.error('Telegram bildirim hatası (fetch):', notifyErr);
        }

        return NextResponse.json({
            ...reservation,
            passengerNames: JSON.parse(passengerNames),
            telegramAttempted,
            telegramOk
        });
    } catch (error) {
        console.error('Rezervasyon oluşturma hatası:', error);
        return NextResponse.json(
            { error: 'Rezervasyon oluşturulurken bir hata oluştu' },
            { status: 500 }
        );
    }
} 

