import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getRequestUserContext } from '@/app/lib/requestContext';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';

// Tüm sürücüleri getir
export async function GET(request: NextRequest) {
  try {
    const { role, tenantIds } = await getRequestUserContext(request);

    const whereClause: any = {};
    if (role && role !== 'SUPERUSER') {
      if (tenantIds.length > 0) {
        whereClause.tenantId = { in: tenantIds };
      } else {
        whereClause.tenantId = null; // no tenant → no drivers
      }
    }

    const drivers = await prisma.driver.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            reservations: true,
            tourBookings: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(drivers);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('Sürücü listesi getirme hatası:', msg, error);
    return NextResponse.json({ error: 'Sürücüler getirilemedi', details: msg }, { status: 500 });
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
    // Permission: require MANAGE_DRIVERS (or SUPERUSER)
    const { role, userId, tenantIds } = await getRequestUserContext(request);
    let allowed = role === 'SUPERUSER' || (role && (ROLE_PERMISSIONS as any)[role]?.includes(PERMISSIONS.MANAGE_DRIVERS));
    if (!allowed && userId) {
      const perms = await prisma.userPermission.findMany({
        where: { userId, isActive: true },
        select: { permission: true }
      });
      allowed = perms.some((p: any) => p.permission === PERMISSIONS.MANAGE_DRIVERS);
    }
    if (!allowed) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // SUPERUSER için tenantId opsiyonel, diğerleri için ilk tenantId'yi kullan
    const tenantId = role === 'SUPERUSER' ? body.tenantId : (tenantIds.length > 0 ? tenantIds[0] : null);

    const driver = await prisma.driver.create({
      data: {
        name,
        phoneNumber,
        tenantId,
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('Şoför ekleme hatası:', msg, error);
    return NextResponse.json({ error: 'Şoför eklenirken bir hata oluştu', details: msg }, { status: 500 });
  }
} 