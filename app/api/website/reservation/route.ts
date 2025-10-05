import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { tenantId, source = 'website', ...reservationData } = await request.json();

    // Create reservation with website source
    const reservation = await prisma.reservation.create({
      data: {
        ...reservationData,
        tenantId,
        source,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      success: true, 
      reservation 
    });

  } catch (error) {
    console.error('Website reservation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create reservation' 
    }, { status: 500 });
  }
}
