import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Rezervasyonlar getiriliyor...');
    
    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const offset = (page - 1) * pageSize;
    
    console.log(`API: Sayfa ${page}, Boyut ${pageSize}, Offset ${offset}`);
    
    // Transfer rezervasyonlarını getir
    const reservations = await prisma.reservation.findMany({
      take: pageSize,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
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

    // Tur rezervasyonlarını getir
    const tourBookings = await prisma.tourBooking.findMany({
      take: pageSize,
      skip: offset,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
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

    console.log('API: Bulunan transfer sayısı:', reservations.length);
    console.log('API: Bulunan tur sayısı:', tourBookings.length);

    // Transfer rezervasyonlarını formatla
    const transferResults = reservations.map(r => ({
      id: r.id,
      voucherNumber: r.voucherNumber,
      date: r.date,
      time: r.time,
      from: r.from,
      to: r.to,
      passengerNames: JSON.parse(r.passengerNames || '[]'),
      price: r.price,
      currency: r.currency,
      paymentStatus: r.paymentStatus,
      user: r.user,
      driver: r.driver,
      tenant: r.tenant,
      type: 'transfer'
    }));

    // Tur rezervasyonlarını formatla
    const tourResults = tourBookings.map(t => ({
      id: t.id,
      voucherNumber: t.voucherNumber,
      date: t.tourDate.toISOString().split('T')[0],
      time: t.tourTime || '00:00',
      from: t.pickupLocation,
      to: t.routeName,
      passengerNames: JSON.parse(t.passengerNames || '[]'),
      price: t.price,
      currency: t.currency,
      paymentStatus: t.status,
      user: t.User,
      driver: t.driver,
      tenant: t.tenant,
      type: 'tur'
    }));

    // Tüm rezervasyonları birleştir ve tarihe göre sırala
    const allResults = [...transferResults, ...tourResults]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('API: Toplam rezervasyon sayısı:', allResults.length);
    console.log('API: Rezervasyon detayları:', allResults.map(r => ({ id: r.id, type: r.type, voucherNumber: r.voucherNumber })));

    return NextResponse.json(allResults);
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
    const body = await request.json();
    console.log('API: Yeni rezervasyon oluşturuluyor...', body);
    
    // Basit rezervasyon oluşturma
    const reservation = await prisma.reservation.create({
      data: {
        date: body.date || new Date().toISOString().split('T')[0],
        time: body.time || '12:00',
        from: body.from || 'IST',
        to: body.to || 'Merkez',
        flightCode: body.flightCode || '',
        passengerNames: JSON.stringify(body.passengerNames || ['Test Yolcu']),
        luggageCount: body.luggageCount || 1,
        price: body.price || 50.0,
        currency: body.currency || 'USD',
        phoneNumber: body.phoneNumber || '',
        voucherNumber: body.voucherNumber || `VIP${new Date().toISOString().slice(2,10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`,
        driverFee: body.driverFee || 0,
        userId: body.userId || null,
        paymentStatus: body.paymentStatus || 'PENDING',
        isReturn: body.isReturn || false
      }
    });
    
    console.log('API: Rezervasyon oluşturuldu:', reservation.id);
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Rezervasyon oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Rezervasyon oluşturulamadı' },
      { status: 500 }
    );
  }
}