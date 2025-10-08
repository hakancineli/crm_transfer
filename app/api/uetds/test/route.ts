import { NextRequest, NextResponse } from 'next/server';
import { createUetdsServiceForTenant } from '@/app/lib/uetdsService';
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

// POST - U-ETDS servis testi
export async function POST(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantUsers: {
          include: { tenant: true }
        }
      }
    });

    if (!user || user.tenantUsers.length === 0) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const tenantId = user.tenantUsers[0].tenantId;
    const uetdsService = await createUetdsServiceForTenant(tenantId);

    if (!uetdsService) {
      return NextResponse.json({ 
        error: 'U-ETDS servisi yapılandırılmamış',
        details: 'U-ETDS kullanıcı adı, şifre ve UNET numarası gerekli'
      }, { status: 400 });
    }

    const testResult = await uetdsService.servisTest();

    // Test sonucunu logla
    await prisma.uetdsLog.create({
      data: {
        tenantId,
        islemTuru: 'servisTest',
        islemParametreleri: { test: true },
        sonucKodu: testResult.success ? 0 : 1,
        sonucMesaji: testResult.message,
        sonucVerisi: testResult
      }
    });

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('U-ETDS test hatası:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token süresi dolmuş' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
