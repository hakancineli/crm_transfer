import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Only SUPERUSER can access all tenants
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            tenantUsers: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Şirketler getirilemedi' },
      { status: 500 }
    );
  }
}
