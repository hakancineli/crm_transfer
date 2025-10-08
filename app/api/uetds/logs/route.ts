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

// GET - U-ETDS logları
export async function GET(request: NextRequest) {
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

    const logs = await prisma.uetdsLog.findMany({
      where: { tenantId },
      orderBy: { islemZamani: 'desc' },
      take: 100 // Son 100 log
    });

    return NextResponse.json({ logs });

  } catch (error: any) {
    console.error('U-ETDS log listesi hatası:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token süresi dolmuş' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
