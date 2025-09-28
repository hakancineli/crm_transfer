import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { permissions } = await request.json();

    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json(
        { error: 'Geçersiz yetki verisi' },
        { status: 400 }
      );
    }

    // Get user to verify it exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Delete existing permissions
    await prisma.userPermission.deleteMany({
      where: { userId }
    });

    // Create new permissions
    // Aktör bilgisini JWT'den al
    let grantedBy: string | null = null;
    const auth = request.headers.get('authorization') || '';
    if (auth.startsWith('Bearer ')) {
      try {
        const token = auth.slice(7);
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        grantedBy = decoded?.userId || null;
      } catch {}
    }
    const permissionEntries = Object.entries(permissions)
      .filter(([_, isActive]) => isActive)
      .map(([permission, _]) => ({
        userId,
        permission,
        isActive: true,
        grantedBy: grantedBy || 'system'
      }));

    if (permissionEntries.length > 0) {
      await prisma.userPermission.createMany({
        data: permissionEntries
      });
    }

    // Log activity - aktör olarak JWT'deki kullanıcıyı kullan
    const actorUserId = grantedBy || undefined;
    if (actorUserId) {
      await prisma.activity.create({
        data: {
          userId: actorUserId,
          action: 'UPDATE',
          entityType: 'USER_PERMISSIONS',
          entityId: params.id,
          description: `${user.name} kullanıcısının yetkileri güncellendi`,
          details: {
            permissions: Object.entries(permissions).filter(([_, isActive]) => isActive).map(([permission, _]) => permission)
          },
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: request.headers.get('user-agent') || ''
        }
      });
    }

    return NextResponse.json({
      message: 'Yetkiler başarıyla güncellendi',
      permissions: Object.keys(permissions).filter(key => permissions[key])
    });

  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
