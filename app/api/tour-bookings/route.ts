import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(request: NextRequest) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    let whereClause: any = {};
    if (role !== 'SUPERUSER' && tenantIds && tenantIds.length > 0) {
      whereClause.tenantId = { in: tenantIds };
    }

    const bookings = await prisma.tourBooking.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.tourBooking.count({ where: whereClause });

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Tur rezervasyonları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Tur rezervasyonları getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    console.log('Tour bookings POST - User context:', { userId, role, tenantIds });
    const body = await request.json();
    const {
      routeId,
      customRouteName,
      vehicleType,
      groupSize,
      price,
      currency,
      pickupLocation,
      tourDate,
      tourTime,
      tourDuration,
      passengerNames,
      notes
    } = body;

    // Determine tenant ID based on user role
    let tenantId: string;
    if (role === 'SUPERUSER') {
      // SUPERUSER için tenant ID'yi body'den al veya default kullan
      tenantId = body.tenantId || '985046c2-aaa0-467b-8a10-ed965f6cdb43';
    } else if (tenantIds && tenantIds.length > 0) {
      // Diğer kullanıcılar için kendi tenant ID'lerini kullan
      tenantId = tenantIds[0];
    } else {
      return NextResponse.json(
        { error: 'Tenant ID bulunamadı' },
        { status: 400 }
      );
    }

    // Voucher numarası oluştur
    const voucherNumber = `TUR-${Date.now()}`;

    // Rota adını belirle
    let routeName = 'Özel Tur';
    if (routeId === 'custom' && customRouteName) {
      routeName = customRouteName;
    } else if (routeId !== 'custom') {
      // Önceden tanımlı rotalar için rota adını bul
      const predefinedRoutes = [
        { id: 'istanbul-city', name: 'İstanbul Şehir Turu' },
        { id: 'cappadocia', name: 'Kapadokya Turu' },
        { id: 'trabzon', name: 'Trabzon Turu' },
        { id: 'sapanca', name: 'Sapanca Turu' },
        { id: 'abant', name: 'Abant Turu' },
        { id: 'bursa', name: 'Bursa Turu' },
      ];
      const route = predefinedRoutes.find(r => r.id === routeId);
      if (route) {
        routeName = route.name;
      }
    }

    // Kur çevirisi yap (USD bazında) - sadece fiyat varsa
    let usdPrice = price;
    if (price > 0) {
      if (currency === 'EUR') {
        usdPrice = price / 0.85; // EUR to USD
      } else if (currency === 'TRY') {
        usdPrice = price / 30.5; // TRY to USD
      }
      // Round to 2 decimal places
      usdPrice = Math.round(usdPrice * 100) / 100;
    }

    // Rezervasyon oluştur
    const booking = await prisma.tourBooking.create({
      data: {
        voucherNumber,
        routeName,
        vehicleType,
        groupSize: parseInt(groupSize),
        price: usdPrice, // USD olarak kaydet (yuvarlanmış)
        currency: 'USD', // Her zaman USD olarak kaydet
        pickupLocation,
        tourDate: new Date(tourDate),
        tourTime,
        tourDuration: parseInt(tourDuration) || 1, // Gün cinsinden
        passengerNames: JSON.stringify(passengerNames.filter((name: string) => name.trim() !== '')),
        notes: notes || '',
        status: 'PENDING',
        tenantId: tenantId,
        userId: userId, // Kullanıcı ID'sini ekle
      },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      booking,
      voucherNumber: booking.voucherNumber,
      originalPrice: price,
      originalCurrency: currency,
      convertedPrice: usdPrice,
      convertedCurrency: 'USD'
    });
  } catch (error) {
    console.error('Tur rezervasyonu oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Tur rezervasyonu oluşturulamadı' },
      { status: 500 }
    );
  }
}

