import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { ensureTenantId, assertModuleEnabled, loadActiveUserPermissions, assertPermission, getModuleManageChecker } from '@/app/lib/moduleAccess';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(request: NextRequest) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    const tenantId = await ensureTenantId({ role, tenantIds });
    await assertModuleEnabled({ role, tenantId, moduleName: 'tour' });
    // Build where clause based on user role
    let whereClause: any = role === 'SUPERUSER' ? {} : { tenantId: { in: [tenantId] } };

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      orderBy: { licensePlate: 'asc' },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true
          }
        }
      }
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Tur araçları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Tur araçları getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    const body = await request.json();
    
    const { type, capacity, licensePlate, driverName, driverPhone, tenantId } = body;

    // Validate required fields
    if (!type || !licensePlate || !driverName) {
      return NextResponse.json(
        { error: 'Araç tipi, plaka ve şoför adı gereklidir' },
        { status: 400 }
      );
    }

    // Determine tenant and guard access
    const currentTenantId = await ensureTenantId({ role, tenantIds });
    await assertModuleEnabled({ role, tenantId: currentTenantId, moduleName: 'tour' });
    const perms = await loadActiveUserPermissions(userId);
    assertPermission(role, perms, getModuleManageChecker('tour'));

    const vehicle = await prisma.vehicle.create({
      data: {
        type,
        capacity: parseInt(capacity),
        licensePlate,
        driverName: driverName || null,
        driverPhone: driverPhone || null,
        tenantId: currentTenantId
      },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true
          }
        }
      }
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Tur aracı oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Tur aracı oluşturulamadı' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    const tenantId = await ensureTenantId({ role, tenantIds });
    await assertModuleEnabled({ role, tenantId, moduleName: 'tour' });
    const perms = await loadActiveUserPermissions(userId);
    assertPermission(role, perms, getModuleManageChecker('tour'));

    // Delete only tenant vehicles for non-superuser; SUPERUSER can delete all
    const whereClause = role === 'SUPERUSER' ? {} : { tenantId };
    const result = await prisma.vehicle.deleteMany({ where: whereClause });
    return NextResponse.json({ message: `${result.count} araç silindi`, deletedCount: result.count });
  } catch (error) {
    console.error('Araçları temizleme hatası:', error);
    return NextResponse.json(
      { error: 'Araçlar temizlenemedi' },
      { status: 500 }
    );
  }
}

