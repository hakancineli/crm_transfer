import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // JWT token'dan kullanıcı bilgilerini al
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const userRole = decoded.role;

    // Kullanıcının tenant'larını al
    const tenantUsers = await prisma.tenantUser.findMany({
      where: {
        userId: userId,
        isActive: true
      },
      select: {
        tenantId: true
      }
    });

    const tenantIds = tenantUsers.map(tu => tu.tenantId);

    if (tenantIds.length === 0) {
      return NextResponse.json({
        success: true,
        tenantModules: []
      });
    }

    // Tenant'ların modül ayarlarını al
    const tenantModules = await prisma.tenantModule.findMany({
      where: { tenantId: { in: tenantIds }, isEnabled: true },
      select: {
        moduleId: true,
        isEnabled: true,
        module: { select: { name: true } }
      }
    });

    return NextResponse.json({
      success: true,
      tenantModules
    });

  } catch (error) {
    console.error('Tenant modül kontrolü hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
