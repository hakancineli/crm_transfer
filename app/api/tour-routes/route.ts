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
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    const body = await request.json();

    const { name, duration, price, description } = body;

    // Validate required fields
    if (!name || !duration || price === undefined) {
      return NextResponse.json(
        { error: 'Rota adı, süre ve fiyat gereklidir' },
        { status: 400 }
      );
    }

    // Determine tenant ID
    let tenantId: string;
    if (role === 'SUPERUSER') {
      tenantId = body.tenantId || tenantIds?.[0] || '985046c2-aaa0-467b-8a10-ed965f6cdb43';
    } else if (tenantIds && tenantIds.length > 0) {
      tenantId = tenantIds[0];
    } else {
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

