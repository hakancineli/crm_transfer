import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;

    // Get driver with reservations
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        reservations: {
          orderBy: [
            { date: 'desc' },
            { time: 'desc' }
          ]
        }
      }
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Şoför bulunamadı' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalReservations = driver.reservations.length;
    const totalRevenue = driver.reservations.reduce((sum, res) => sum + res.price, 0);
    const totalDriverFee = driver.reservations.reduce((sum, res) => sum + (res.driverFee || 0), 0);
    
    const completedTransfers = driver.reservations.filter(res => res.paymentStatus === 'PAID').length;
    const pendingTransfers = driver.reservations.filter(res => res.paymentStatus === 'UNPAID').length;
    
    const thisMonthReservations = driver.reservations.filter(res => {
      const resDate = new Date(res.date);
      return resDate >= startOfMonth && resDate <= endOfMonth;
    }).length;
    
    const thisMonthRevenue = driver.reservations
      .filter(res => {
        const resDate = new Date(res.date);
        return resDate >= startOfMonth && resDate <= endOfMonth;
      })
      .reduce((sum, res) => sum + res.price, 0);

    const stats = {
      totalReservations,
      totalRevenue,
      totalDriverFee,
      averageRating: 0, // Placeholder for future rating system
      completedTransfers,
      pendingTransfers,
      thisMonthReservations,
      thisMonthRevenue
    };

    return NextResponse.json({
      driver,
      stats
    });

  } catch (error) {
    console.error('Şoför detayları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Şoför bilgileri alınamadı' },
      { status: 500 }
    );
  }
}
