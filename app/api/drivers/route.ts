import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Tüm sürücüleri getir
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let currentUserRole: string | null = null;
    let currentTenantIds: string[] = [];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded: any = jwt.decode(token);
        currentUserRole = decoded?.role || null;
        if (decoded?.userId) {
          const links = await prisma.tenantUser.findMany({
            where: { userId: decoded.userId, isActive: true },
            select: { tenantId: true }
          });
          currentTenantIds = links.map(l => l.tenantId);
        }
      } catch (_) {
        // ignore
      }
    }

    const whereClause: any = {};
    if (currentUserRole && currentUserRole !== 'SUPERUSER') {
      if (currentTenantIds.length > 0) {
        whereClause.reservations = { some: { tenantId: { in: currentTenantIds } } };
      } else {
        whereClause.reservations = { none: {} }; // no tenant → no drivers
      }
    }

    const drivers = await prisma.driver.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Sürücü listesi getirme hatası:', error);
    return NextResponse.json(
      { error: 'Sürücüler getirilemedi' },
      { status: 500 }
    );
  }
}

// Yeni sürücü ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phoneNumber } = body;

    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: 'Ad ve telefon numarası gereklidir' },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        phoneNumber,
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    console.error('Şoför ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Şoför eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 