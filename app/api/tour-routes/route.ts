import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(request: NextRequest) {
  try {
    // Statik tur rotaları döndür
    const routes = [
      { id: 'istanbul-city', name: 'İstanbul Şehir Turu', duration: 10, price: 150 },
      { id: 'cappadocia', name: 'Kapadokya Turu', duration: 10, price: 300 },
      { id: 'trabzon', name: 'Trabzon Turu', duration: 10, price: 250 },
      { id: 'sapanca', name: 'Sapanca Turu', duration: 10, price: 200 },
      { id: 'abant', name: 'Abant Turu', duration: 10, price: 180 },
      { id: 'bursa', name: 'Bursa Turu', duration: 10, price: 220 },
    ];

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

    // Create custom route object
    const newRoute = {
      id: `custom-${Date.now()}`,
      name,
      duration: parseInt(duration),
      price: parseFloat(price),
      currency: body.currency || 'EUR',
      description: description || '',
      isActive: true,
      tenantId,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newRoute, { status: 201 });
  } catch (error) {
    console.error('Tur rotası oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Tur rotası oluşturulamadı' },
      { status: 500 }
    );
  }
}

