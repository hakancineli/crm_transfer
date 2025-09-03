import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    const totalRevenue = reservations.reduce((sum, res) => sum + (res.price || 0), 0);
    const totalReservations = reservations.length;

    return NextResponse.json({
      reservations,
      totalRevenue,
      totalReservations
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
