import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    const bookings = await prisma.hotelBooking.findMany({
      where,
      include: {
        request: true,
        reservation: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching hotel bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Otel rezervasyonları alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      requestId,
      reservationId,
      hotelId,
      hotelName,
      hotelAddress,
      roomType,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      totalPrice,
      currency,
      customerInfo,
      specialRequests,
      cancellationPolicy
    } = body;

    const booking = await prisma.hotelBooking.create({
      data: {
        tenantId,
        requestId,
        reservationId,
        hotelId,
        hotelName,
        hotelAddress,
        roomType,
        checkin: new Date(checkin),
        checkout: new Date(checkout),
        adults: parseInt(adults),
        children: parseInt(children) || 0,
        rooms: parseInt(rooms) || 1,
        totalPrice: parseFloat(totalPrice),
        currency: currency || 'EUR',
        bookingReference: `BK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'CONFIRMED',
        customerInfo,
        specialRequests,
        cancellationPolicy
      }
    });

    return NextResponse.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error creating hotel booking:', error);
    return NextResponse.json(
      { success: false, error: 'Otel rezervasyonu oluşturulamadı' },
      { status: 500 }
    );
  }
}
