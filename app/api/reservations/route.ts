import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Rezervasyonlar getiriliyor...');
    
    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const offset = (page - 1) * pageSize;
    let tenantId = searchParams.get('tenantId');

    // If caller is an agency user and didn't pass tenantId, scope by token
    try {
      const authHeader = request.headers.get('authorization');
      if (!tenantId && authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const role = decoded?.role;
        if (role && role !== 'SUPERUSER') {
          const link = await prisma.tenantUser.findFirst({
            where: { userId: decoded.userId, isActive: true },
            select: { tenantId: true }
          });
          if (link?.tenantId) {
            tenantId = link.tenantId;
          } else {
            // Non-superuser without tenant link should see nothing
            return NextResponse.json([]);
          }
        }
      }
    } catch (e) {
      // ignore scoping errors and continue unscoped only for superuser or public
    }

    const whereClause: any = tenantId ? { tenantId } : undefined;
    
    console.log(`API: Sayfa ${page}, Boyut ${pageSize}, Offset ${offset}`);
    
    // Transfer rezervasyonlarını getir
    const reservations = await prisma.reservation.findMany({
      take: pageSize,
      skip: offset,
      where: whereClause,
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
      where: whereClause,
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
      phoneNumber: r.phoneNumber,
      createdAt: (r as any).createdAt ?? null,
      tenantId: (r as any).tenantId ?? r.tenant?.id ?? null,
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
      phoneNumber: (t as any).phoneNumber ?? '',
      createdAt: (t as any).createdAt ?? null,
      tenantId: (t as any).tenantId ?? t.tenant?.id ?? null,
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
    // Determine user and tenant from token
    let userIdFromToken: string | null = null;
    let tenantIdFromToken: string | null = null;
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userIdFromToken = decoded?.userId || null;
        if (decoded?.role && decoded.role !== 'SUPERUSER') {
          const link = await prisma.tenantUser.findFirst({ where: { userId: userIdFromToken || '', isActive: true }, select: { tenantId: true } });
          tenantIdFromToken = link?.tenantId || null;
        } else if (decoded?.role === 'SUPERUSER' && body.tenantId) {
          tenantIdFromToken = body.tenantId; // allow superuser to specify
        }
      }
    } catch {}
    
    // Website rezervasyonu için tenant ID'yi domain'den bul
    let targetTenantId = body.tenantId || tenantIdFromToken;
    
    if (body.source === 'website' && body.tenantId) {
      // Domain'den tenant ID'yi bul
      const tenant = await prisma.tenant.findFirst({
        where: { 
          OR: [
            { domain: body.tenantId },
            { subdomain: body.tenantId }
          ]
        }
      });
      if (tenant) {
        targetTenantId = tenant.id;
        console.log('API: Website tenant bulundu:', tenant.id, tenant.companyName);
      } else {
        console.log('API: Website tenant bulunamadı:', body.tenantId);
      }
    }

    // Basit rezervasyon oluşturma
    const reservation = await prisma.reservation.create({
      data: {
        date: body.date || new Date().toISOString().split('T')[0],
        time: body.time || '12:00',
        from: body.from || 'IST',
        to: body.to || 'Merkez',
        flightCode: body.flightCode || '',
        passengerNames: JSON.stringify(body.passengerNames || [body.name || 'Test Yolcu']),
        luggageCount: body.luggageCount || body.passengers || 1,
        price: body.price || 50.0,
        currency: body.currency || 'USD',
        phoneNumber: body.phoneNumber || body.phone || '',
        voucherNumber: body.voucherNumber || `VIP${new Date().toISOString().slice(2,10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`,
        driverFee: body.driverFee || 0,
        userId: userIdFromToken,
        paymentStatus: body.paymentStatus || 'PENDING',
        isReturn: body.isReturn || false,
        tenantId: targetTenantId,
        notes: body.notes || '',
        email: body.email || '',
        type: body.type || 'transfer'
      }
    });
    
    console.log('API: Rezervasyon oluşturuldu:', reservation.id);
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Rezervasyon oluşturma hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Rezervasyon oluşturulamadı', details: errorMessage },
      { status: 500 }
    );
  }
}