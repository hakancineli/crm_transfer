import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { getRequestUserContext } from '@/app/lib/requestContext';


// Authentication helper (JWT-based)
async function authenticateUser(request: NextRequest) {
  try {
    const ctx = await getRequestUserContext(request);
    if (!ctx || !ctx.userId) return null;
    return ctx; // { userId, role, tenantIds }
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true, permissions: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Kullanıcı getirilemedi' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication kontrolü
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const targetUserId = params.id;
    const body = await request.json();
    const { username, email, name, password, role, isActive } = body;

    // Kullanıcının var olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Authorization: SUPERUSER her şeyi yapabilir; AGENCY_ADMIN sadece kendi tenantındaki kullanıcıları güncelleyebilir
    if (authUser.role !== 'SUPERUSER') {
      // Hedef kullanıcı, auth kullanıcının tenantlarından birinde mi?
      const link = await prisma.tenantUser.findFirst({
        where: {
          userId: targetUserId,
          tenantId: { in: authUser.tenantIds || [] },
          isActive: true
        },
        select: { id: true }
      });
      if (!link) {
        return NextResponse.json({ error: 'Bu kullanıcıyı güncelleme yetkiniz yok' }, { status: 403 });
      }
      // AGENCY_ADMIN, SUPERUSER rolüne terfi veremez
      if (role === 'SUPERUSER') {
        return NextResponse.json({ error: 'SUPERUSER rolü atanamaz' }, { status: 403 });
      }
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {
      username,
      email,
      name,
      role,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date()
    };

    // Şifre verilmişse hash'le
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Kullanıcı güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const { default: jwt } = await import('jsonwebtoken');
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded?.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Bu işlem için SUPERUSER gerekli' }, { status: 403 });
    }

    const userId = params.id;

    await prisma.$transaction(async (tx) => {
      await tx.tenantUser.deleteMany({ where: { userId } });
      await tx.userPermission.deleteMany({ where: { userId } });
      await tx.reservation.updateMany({ where: { userId }, data: { userId: null } });
      await tx.tourBooking.updateMany({ where: { userId }, data: { userId: null } });
      await tx.user.updateMany({ where: { createdBy: userId }, data: { createdBy: null } });
      try { await tx.activity.deleteMany({ where: { userId } }); } catch {}
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ error: 'Kullanıcı silinemedi' }, { status: 500 });
  }
}