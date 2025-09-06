import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const permissionEntries = Object.entries(permissions)
      .filter(([_, isActive]) => isActive)
      .map(([permission, _]) => ({
        userId,
        permission,
        isActive: true,
        grantedBy: 'system' // In real app, this should be the current user ID
      }));

    if (permissionEntries.length > 0) {
      await prisma.userPermission.createMany({
        data: permissionEntries
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: 'system', // In real app, this should be the current user ID
        action: 'UPDATE',
        entityType: 'USER_PERMISSIONS',
        entityId: userId,
        description: `${user.name} kullanıcısının yetkileri güncellendi`,
        details: {
          permissions: Object.entries(permissions).filter(([_, isActive]) => isActive).map(([permission, _]) => permission)
        },
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || ''
      }
    });

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
