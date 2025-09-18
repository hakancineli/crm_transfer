import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { ensureTenantId, assertModuleEnabled } from '@/app/lib/moduleAccess';

// Tüm konaklama rezervasyonlarını getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Filtreleme koşulları
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { voucherNumber: { contains: search, mode: 'insensitive' } },
        { hotelName: { contains: search, mode: 'insensitive' } },
        { customerInfo: { path: ['name'], string_contains: search } },
        { customerInfo: { path: ['email'], string_contains: search } }
      ];
    }

    // Rezervasyonları getir
    const bookings = await prisma.hotelBooking.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      bookings: bookings.map(booking => ({
        id: booking.id,
        voucherNumber: booking.voucherNumber,
        hotelName: booking.hotelName,
        hotelAddress: booking.hotelAddress,
        roomType: booking.roomType,
        checkin: booking.checkin,
        checkout: booking.checkout,
        adults: booking.adults,
        children: booking.children,
        rooms: booking.rooms,
        totalPrice: booking.totalPrice,
        currency: 'EUR', // Varsayılan para birimi
        status: booking.status,
        customerInfo: booking.customerInfo as {
          name: string;
          email: string;
          phone: string;
        },
        specialRequests: booking.specialRequests,
        bookingReference: booking.bookingReference,
        createdAt: booking.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching hotel bookings:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Yeni konaklama rezervasyonu oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelId,
      roomTypeId,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      totalPrice,
      currency,
      customerInfo,
      specialRequests,
      voucherNumber
    } = body;

    // Determine tenant and guard module
    const { role, tenantIds } = await (await import('@/app/lib/requestContext')).getRequestUserContext(request);
    const tenantId = await ensureTenantId({ role, tenantIds, bodyTenantId: body.tenantId });
    await assertModuleEnabled({ role, tenantId, moduleName: 'accommodation' });

    // Rezervasyon oluştur
    const booking = await prisma.hotelBooking.create({
      data: {
        hotelId,
        tenantId,
        hotelName: 'Hotel', // Geçici
        hotelAddress: 'Address', // Geçici
        roomType: roomTypeId || 'Standard Room',
        checkin: new Date(checkin),
        checkout: new Date(checkout),
        adults: parseInt(adults),
        children: parseInt(children),
        rooms: parseInt(rooms),
        totalPrice: parseFloat(totalPrice),
        currency: currency || 'EUR',
        status: 'PENDING',
        customerInfo: customerInfo || {},
        specialRequests: specialRequests || null,
        voucherNumber: voucherNumber || `HT-${Date.now()}`,
        bookingReference: `REF-${Date.now()}`,
        customerPrice: parseFloat(totalPrice),
        agentPrice: parseFloat(totalPrice) * 0.8, // %20 indirim
        profitMargin: parseFloat(totalPrice) * 0.2
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Rezervasyon başarıyla oluşturuldu',
      booking: {
        id: booking.id,
        voucherNumber: booking.voucherNumber,
        hotelName: booking.hotelName,
        hotelAddress: booking.hotelAddress,
        roomType: booking.roomType,
        checkin: booking.checkin,
        checkout: booking.checkout,
        adults: booking.adults,
        children: booking.children,
        rooms: booking.rooms,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        status: booking.status,
        customerInfo: booking.customerInfo,
        specialRequests: booking.specialRequests,
        bookingReference: booking.bookingReference,
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating hotel booking:', error);
    return NextResponse.json(
      { error: 'Rezervasyon oluşturulamadı' },
      { status: 500 }
    );
  }
}