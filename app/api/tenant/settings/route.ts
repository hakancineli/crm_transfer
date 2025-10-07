import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

interface JwtPayload {
  userId: string;
  [key: string]: any;
}

// GET - Tenant ayarlarını getir
export async function GET(request: NextRequest) {
  // CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'JWT secret not configured' }, { status: 500 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const userId = decoded.userId;

    // Kullanıcının tenant bilgilerini al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantUsers: {
          include: {
            tenant: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // SUPERUSER ise tüm tenantları, değilse sadece kendi tenantını al
    let tenants;
    if (user.role === 'SUPERUSER') {
      tenants = await prisma.tenant.findMany({
        orderBy: { companyName: 'asc' }
      });
    } else {
      tenants = user.tenantUsers.map(tu => tu.tenant);
    }

    return NextResponse.json({ tenants }, { headers });

  } catch (error: any) {
    console.error('Tenant ayarları getirme hatası:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token süresi dolmuş' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// PUT - Tenant ayarlarını güncelle
export async function PUT(request: NextRequest) {
  // CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'JWT secret not configured' }, { status: 500 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const userId = decoded.userId;

    const body = await request.json();
    const { tenantId, ...settings } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID gerekli' }, { status: 400 });
    }

    // Kullanıcının bu tenant'a erişim yetkisi var mı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantUsers: {
          where: { tenantId },
          include: { tenant: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // SUPERUSER değilse ve bu tenant'a erişimi yoksa hata
    if (user.role !== 'SUPERUSER' && user.tenantUsers.length === 0) {
      return NextResponse.json({ error: 'Bu tenant\'a erişim yetkiniz yok' }, { status: 403 });
    }

    // Tenant'ı güncelle
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...settings,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Ayarlar başarıyla güncellendi',
      tenant: updatedTenant 
    }, { headers });

  } catch (error: any) {
    console.error('Tenant ayarları güncelleme hatası:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token süresi dolmuş' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}