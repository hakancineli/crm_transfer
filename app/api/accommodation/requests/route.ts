import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    const requests = await prisma.hotelRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        hotelBookings: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching hotel requests:', error);
    return NextResponse.json(
      { success: false, error: 'Otel talepleri alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      customerName,
      customerEmail,
      customerPhone,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      city,
      region,
      budget,
      roomType,
      breakfast,
      amenities,
      specialRequests
    } = body;

    const hotelRequest = await prisma.hotelRequest.create({
      data: {
        tenantId,
        customerName,
        customerEmail,
        customerPhone,
        checkin: new Date(checkin),
        checkout: new Date(checkout),
        adults: parseInt(adults),
        children: parseInt(children) || 0,
        rooms: parseInt(rooms) || 1,
        city,
        region,
        budget: budget ? parseFloat(budget) : null,
        roomType,
        breakfast: breakfast || false,
        amenities: amenities || [],
        specialRequests,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      data: hotelRequest
    });
  } catch (error) {
    console.error('Error creating hotel request:', error);
    return NextResponse.json(
      { success: false, error: 'Otel talebi oluşturulamadı' },
      { status: 500 }
    );
  }
}
