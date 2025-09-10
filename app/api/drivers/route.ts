import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getRequestUserContext } from '@/app/lib/requestContext';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';

// Tüm sürücüleri getir
export async function GET(request: NextRequest) {
  try {
    const { role, tenantIds } = await getRequestUserContext(request);
    // Permission: require VIEW_DRIVERS unless SUPERUSER
    if (role !== 'SUPERUSER') {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      let hasViewDrivers = false;
      if (token) {
        try {
          const decoded: any = jwt.decode(token);
          const permissions = await prisma.userPermission.findMany({
            where: { userId: decoded?.userId, isActive: true },
            select: { permission: true }
          });
          const roleHas = role && (ROLE_PERMISSIONS as any)[role]?.includes(PERMISSIONS.VIEW_DRIVERS);
          hasViewDrivers = roleHas || permissions.some(p => p.permission === PERMISSIONS.VIEW_DRIVERS);
        } catch {}
      }
      if (!hasViewDrivers) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
      }
    }

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
    // Permission: require MANAGE_DRIVERS (or SUPERUSER)
    const { role, userId, tenantIds } = await getRequestUserContext(request);
    let allowed = role === 'SUPERUSER' || (role && (ROLE_PERMISSIONS as any)[role]?.includes(PERMISSIONS.MANAGE_DRIVERS));
    if (!allowed && userId) {
      const perms = await prisma.userPermission.findMany({
        where: { userId, isActive: true },
        select: { permission: true }
      });
      allowed = perms.some(p => p.permission === PERMISSIONS.MANAGE_DRIVERS);
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
    console.error('Şoför ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Şoför eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 