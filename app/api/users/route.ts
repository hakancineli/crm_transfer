import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ActivityLogger } from '@/app/lib/activityLogger';
import jwt from 'jsonwebtoken';

// Kullanıcıları listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeUsernamesParam = searchParams.get('excludeUsernames') || '';
    const excludeUsernames = excludeUsernamesParam
      .split(',')
      .map(u => u.trim())
      .filter(Boolean);
    // Scope by tenant for AGENCY roles
    const authHeader = request.headers.get('authorization');
    let currentUserRole: string | null = null;
    let currentTenantIds: string[] = [];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded: any = jwt.decode(token);
        currentUserRole = decoded?.role || null;
        if (decoded?.userId) {
          const links = await prisma.tenantUser.findMany({
            where: { userId: decoded.userId, isActive: true },
            select: { tenantId: true }
          });
          currentTenantIds = links.map((l: any) => l.tenantId);
        }
      } catch (_) {}
    }

    const whereClause: any = {};
    if (currentUserRole && currentUserRole !== 'SUPERUSER') {
      if (currentTenantIds.length > 0) {
        whereClause.tenantUsers = { some: { tenantId: { in: currentTenantIds } } };
      } else {
        whereClause.id = '__none__';
      }
    }

    if (excludeUsernames.length > 0) {
      whereClause.username = { notIn: excludeUsernames } as any;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        creator: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            reservations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar getirilemedi' },
      { status: 500 }
    );
  }
}

// Yeni kullanıcı oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, name, role, createdBy } = body;

    // Only SUPERUSER or AGENCY_ADMIN (within tenant) can create users
    const authHeader = request.headers.get('authorization');
    let currentUserRole: string | null = null;
    let currentUserId: string | null = null;
    let currentTenantIds: string[] = [];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded: any = jwt.decode(token);
        currentUserRole = decoded?.role || null;
        currentUserId = decoded?.userId || null;
        if (decoded?.userId) {
          const links = await prisma.tenantUser.findMany({
            where: { userId: decoded.userId, isActive: true },
            select: { tenantId: true }
          });
          currentTenantIds = links.map((l: any) => l.tenantId);
        }
      } catch (_) {}
    }

    if (!currentUserRole || (currentUserRole !== 'SUPERUSER' && currentUserRole !== 'AGENCY_ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    // Kullanıcı sayısını kontrol et
    const userCount = await prisma.user.count();
    if (userCount >= 10) {
      return NextResponse.json(
        { error: 'Maksimum 10 kullanıcı oluşturabilirsiniz' },
        { status: 400 }
      );
    }

    // Kullanıcı adı ve email kontrolü
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya email zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role,
        createdBy
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // If creator is AGENCY_ADMIN, ensure the new user is linked to same tenant(s)
    if (currentUserRole === 'AGENCY_ADMIN' && currentUserId) {
      const adminLinks = await prisma.tenantUser.findMany({
        where: { userId: currentUserId, isActive: true },
        select: { tenantId: true }
      });
      await Promise.all(adminLinks.map((l: any) =>
        prisma.tenantUser.upsert({
          where: { tenantId_userId: { tenantId: l.tenantId, userId: user.id } },
          update: { isActive: true },
          create: { tenantId: l.tenantId, userId: user.id, role: 'AGENCY_USER', permissions: '[]' }
        })
      ));
    }

    // Activity log - use the created user's ID as the actor
    await ActivityLogger.logActivity({
      userId: user.id, // Use the created user's ID as the actor
      action: 'CREATE',
      entityType: 'USER',
      entityId: user.id,
      description: `Yeni kullanıcı oluşturuldu: ${user.name} (${user.username})`,
      details: {
        username: user.username,
        email: user.email,
        role: user.role
      },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || ''
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulamadı' },
      { status: 500 }
    );
  }
}

// Kullanıcı sil (by id or username)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded?.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Bu işlem için SUPERUSER gerekli' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    const usernameParam = searchParams.get('username');

    let userId: string | null = userIdParam;
    if (!userId) {
      if (!usernameParam) return NextResponse.json({ error: 'userId veya username gerekli' }, { status: 400 });
      const user = await prisma.user.findUnique({ where: { username: usernameParam } });
      if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
      userId = user.id;
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.tenantUser.deleteMany({ where: { userId: userId! } });
        await tx.userPermission.deleteMany({ where: { userId: userId! } });
        await tx.user.updateMany({ where: { createdBy: userId! }, data: { createdBy: null } });
        await tx.reservation.updateMany({ where: { userId: userId! }, data: { userId: null } });
        await tx.tourBooking.updateMany({ where: { userId: userId! }, data: { userId: null } });
        try { await tx.activity.deleteMany({ where: { userId: userId! } }); } catch {}
        await tx.user.delete({ where: { id: userId! } });
      });
      return NextResponse.json({ success: true });
    } catch (hardErr) {
      // Fallback: Deactivate and unlink so it disappears everywhere
      await prisma.$transaction(async (tx) => {
        await tx.tenantUser.deleteMany({ where: { userId: userId! } });
        await tx.userPermission.deleteMany({ where: { userId: userId! } });
        await tx.user.update({ where: { id: userId! }, data: { isActive: false } });
      });
      return NextResponse.json({ success: true, deactivated: true });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Kullanıcı silinemedi' },
      { status: 500 }
    );
  }
}
