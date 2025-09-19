import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import jwt from 'jsonwebtoken';


export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    // Only SUPERUSER can access tenant users
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Bu işlem için SUPERUSER yetkisi gerekli' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const excludeUsernamesParam = searchParams.get('excludeUsernames') || '';
    const excludeUsernames = excludeUsernamesParam
      .split(',')
      .map(u => u.trim())
      .filter(Boolean);

    const tenantUsers = await prisma.tenantUser.findMany({
      where: {
        tenantId: params.tenantId,
        ...(excludeUsernames.length > 0
          ? { user: { username: { notIn: excludeUsernames } } }
          : {})
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(tenantUsers);
  } catch (error) {
    console.error('Error fetching tenant users:', error);
    return NextResponse.json(
      { error: 'Şirket kullanıcıları getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Bu işlem için SUPERUSER yetkisi gerekli' }, { status: 403 });
    }

    const body = await request.json();
    const { username, userId, role = 'AGENCY_ADMIN', isActive = true } = body as { username?: string; userId?: string; role?: string; isActive?: boolean };
    if (!username && !userId) {
      return NextResponse.json({ error: 'username veya userId gerekli' }, { status: 400 });
    }

    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { username: username! } });
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const link = await prisma.tenantUser.upsert({
      where: { tenantId_userId: { tenantId: params.tenantId, userId: user.id } },
      update: { isActive, role },
      create: { tenantId: params.tenantId, userId: user.id, role, isActive, permissions: '[]' }
    });

    // Ensure comprehensive permissions for admins
    if (role === 'AGENCY_ADMIN') {
      const perms = [
        'VIEW_DASHBOARD','VIEW_OWN_SALES','VIEW_ALL_RESERVATIONS','CREATE_RESERVATIONS','EDIT_RESERVATIONS','DELETE_RESERVATIONS',
        'VIEW_DRIVERS','MANAGE_DRIVERS','ASSIGN_DRIVERS','VIEW_REPORTS','EXPORT_REPORTS','VIEW_ACCOUNTING','MANAGE_PAYMENTS',
        'MANAGE_COMMISSIONS','MANAGE_CUSTOMERS','VIEW_CUSTOMER_DATA','MANAGE_USERS','MANAGE_PERMISSIONS','VIEW_ACTIVITIES',
        'SYSTEM_SETTINGS','BACKUP_RESTORE','AUDIT_LOGS','VIEW_FINANCIAL_DATA','VIEW_PERFORMANCE','MANAGE_PERFORMANCE',
        'VIEW_TOUR_MODULE','MANAGE_TOUR_BOOKINGS','MANAGE_TOUR_ROUTES','MANAGE_TOUR_VEHICLES','VIEW_TOUR_REPORTS'
      ];
      for (const p of perms) {
        try { await prisma.userPermission.create({ data: { userId: user.id, permission: p, isActive: true } }); } catch {}
      }
    }

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error('Tenant user link error:', error);
    return NextResponse.json({ error: 'Kullanıcı bağlanamadı' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Bu işlem için SUPERUSER yetkisi gerekli' }, { status: 403 });
    }

    const body = await request.json();
    const { tenantUserId, isActive } = body as { tenantUserId: string; isActive: boolean };
    if (!tenantUserId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'tenantUserId ve isActive zorunlu' }, { status: 400 });
    }

    const updated = await prisma.tenantUser.update({
      where: { id: tenantUserId },
      data: { isActive }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Tenant user update error:', error);
    return NextResponse.json({ error: 'Kullanıcı güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Bu işlem için SUPERUSER yetkisi gerekli' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tenantUserId = searchParams.get('tenantUserId');
    if (!tenantUserId) {
      return NextResponse.json({ error: 'tenantUserId zorunlu' }, { status: 400 });
    }

    // unlink tenant-user; kullanıcıyı silmeyiz
    await prisma.tenantUser.delete({ where: { id: tenantUserId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tenant user delete error:', error);
    return NextResponse.json({ error: 'Kullanıcı silinemedi' }, { status: 500 });
  }
}

