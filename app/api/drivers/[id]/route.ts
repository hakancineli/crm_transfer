import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

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
    const totalRevenue = driver.reservations.reduce((sum: number, res: any) => sum + res.price, 0);
    const totalDriverFee = driver.reservations.reduce((sum: number, res: any) => sum + (res.driverFee || 0), 0);
    
    const completedTransfers = driver.reservations.filter((res: any) => res.paymentStatus === 'PAID').length;
    const pendingTransfers = driver.reservations.filter((res: any) => res.paymentStatus === 'UNPAID').length;
    
    const thisMonthReservations = driver.reservations.filter((res: any) => {
      const resDate = new Date(res.date);
      return resDate >= startOfMonth && resDate <= endOfMonth;
    }).length;
    
    const thisMonthRevenue = driver.reservations
      .filter((res: any) => {
        const resDate = new Date(res.date);
        return resDate >= startOfMonth && resDate <= endOfMonth;
      })
      .reduce((sum: number, res: any) => sum + res.price, 0);

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

// Şoför güncelleme (ad/telefon)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;
    const body = await request.json();
    const { name, phoneNumber } = body || {};

    if (!name && !phoneNumber) {
      return NextResponse.json(
        { error: 'Güncellenecek en az bir alan gerekli' },
        { status: 400 }
      );
    }

    // Basit yetkilendirme: Token zorunlu
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const role = decoded?.role;
    const userId = decoded?.userId;

    // SUPERUSER serbest; diğer roller için tenant eşleşmesi kontrolü
    if (role !== 'SUPERUSER' && userId) {
      const link = await prisma.tenantUser.findFirst({ where: { userId, isActive: true }, select: { tenantId: true } });
      const driver = await prisma.driver.findUnique({ where: { id: driverId }, select: { tenantId: true } });
      if (!link?.tenantId || !driver?.tenantId || link.tenantId !== driver.tenantId) {
        return NextResponse.json({ error: 'Bu sürücüyü güncelleme yetkiniz yok' }, { status: 403 });
      }
    }

    const updated = await prisma.driver.update({
      where: { id: driverId },
      data: {
        ...(name ? { name } : {}),
        ...(phoneNumber ? { phoneNumber } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('Şoför güncelleme hatası:', msg, error);
    return NextResponse.json({ error: 'Şoför güncellenemedi', details: msg }, { status: 500 });
  }
}
