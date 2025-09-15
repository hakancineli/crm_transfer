import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(request: NextRequest) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    
    // Build where clause based on user role
    let whereClause: any = {};
    if (role !== 'SUPERUSER' && tenantIds && tenantIds.length > 0) {
      whereClause.tenantId = { in: tenantIds };
    }

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

    // Determine tenant ID
    let currentTenantId: string | null = null;
    
    if (role === 'SUPERUSER') {
      // For superuser, use first available tenant from database
      const firstTenant = await prisma.tenant.findFirst({
        select: { id: true }
      });
      currentTenantId = firstTenant?.id || null;
    } else {
      // For other roles, use their tenant
      currentTenantId = tenantIds && tenantIds[0];
    }

    if (!currentTenantId) {
      return NextResponse.json(
        { error: 'Tenant ID gerekli' },
        { status: 400 }
      );
    }

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
    
    // Only superuser can clear all vehicles
    if (role !== 'SUPERUSER') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Delete all vehicles
    const result = await prisma.vehicle.deleteMany({});
    
    return NextResponse.json({ 
      message: `${result.count} araç silindi`,
      deletedCount: result.count 
    });
  } catch (error) {
    console.error('Araçları temizleme hatası:', error);
    return NextResponse.json(
      { error: 'Araçlar temizlenemedi' },
      { status: 500 }
    );
  }
}

