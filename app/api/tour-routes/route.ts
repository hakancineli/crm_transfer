import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(request: NextRequest) {
  try {
    const context = await getRequestUserContext(request);
    let tenantId = '985046c2-aaa0-467b-8a10-ed965f6cdb43'; // Default tenant

    if (context && context.tenantIds && context.tenantIds.length > 0) {
      tenantId = context.tenantIds[0];
    }

    const routes = await prisma.tourRoute.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Tur rotaları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Tur rotaları getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let { userId, role, tenantIds } = await getRequestUserContext(request);
    const body = await request.json();

    console.log('🔍 Tour Routes POST - Initial context:', { userId, role, tenantIds });

    const { name, duration, price, description } = body;

    // Validate required fields
    if (!name || !duration || price === undefined) {
      return NextResponse.json(
        { error: 'Rota adı, süre ve fiyat gereklidir' },
        { status: 400 }
      );
    }

    // Check for x-tenant-id header (used by frontend)
    const headerTenantId = request.headers.get('x-tenant-id');
    if (headerTenantId && (!tenantIds || !tenantIds.includes(headerTenantId))) {
      console.log('📋 Found x-tenant-id header:', headerTenantId);
      tenantIds = [headerTenantId];
    }

    // Hydrate tenantIds if missing (for non-SUPERUSER)
    if (role !== 'SUPERUSER' && (!tenantIds || tenantIds.length === 0) && userId) {
      console.log('🔄 Hydrating tenantIds for userId:', userId);
      const links = await prisma.tenantUser.findMany({
        where: { userId, isActive: true },
        select: { tenantId: true }
      });
      tenantIds = links.map((l: any) => l.tenantId);
      console.log('✅ Hydrated tenantIds:', tenantIds);
    }

    // Determine tenant ID
    let tenantId: string;
    if (role === 'SUPERUSER') {
      tenantId = headerTenantId || body.tenantId || tenantIds?.[0] || '985046c2-aaa0-467b-8a10-ed965f6cdb43';
      console.log('👑 SUPERUSER tenantId:', tenantId);
    } else if (tenantIds && tenantIds.length > 0) {
      tenantId = tenantIds[0];
      console.log('✅ Using tenantId:', tenantId);
    } else {
      console.error('❌ No tenant ID found. userId:', userId, 'role:', role, 'tenantIds:', tenantIds);
      return NextResponse.json(
        { error: 'Tenant ID bulunamadı' },
        { status: 400 }
      );
    }

    // Create route in database
    const newRoute = await prisma.tourRoute.create({
      data: {
        tenantId,
        name,
        duration: parseInt(duration),
        basePrice: parseFloat(price), // Schema uses basePrice, correct this from price
        currency: body.currency || 'EUR',
        description: description || '',
        regions: body.regions || JSON.stringify([]),
        isActive: true
      }
    });

    return NextResponse.json(newRoute, { status: 201 });
  } catch (error) {
    console.error('Tur rotası oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Tur rotası oluşturulamadı' },
      { status: 500 }
    );
  }
}

