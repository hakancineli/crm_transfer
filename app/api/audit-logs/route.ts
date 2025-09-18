import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = 20;
    const action = searchParams.get('action') || '';
    const entityType = searchParams.get('entityType') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const userId = searchParams.get('userId') || '';

    const { role, tenantIds, userId: requesterId } = await getRequestUserContext(request);

    // Permission: SUPERUSER or AUDIT_LOGS (role or explicit)
    const roleAllows = role === 'SUPERUSER' || (role && (ROLE_PERMISSIONS as any)[role]?.includes(PERMISSIONS.AUDIT_LOGS));
    let hasExplicit = false;
    if (!roleAllows && requesterId) {
      const perms = await prisma.userPermission.findMany({
        where: { userId: requesterId, isActive: true },
        select: { permission: true }
      });
      hasExplicit = perms.some((p: any) => p.permission === PERMISSIONS.AUDIT_LOGS);
    }
    if (!(roleAllows || hasExplicit)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const where: any = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Optional tenant scoping: if not SUPERUSER and there is tenant context, filter to those tenants where applicable
    // Activities table may have tenantId; add filter only if column exists in schema
    try {
      if (role !== 'SUPERUSER' && Array.isArray(tenantIds) && tenantIds.length > 0) {
        // @ts-ignore - add if model has tenantId
        where.tenantId = { in: tenantIds };
      }
    } catch {}

    const total = await prisma.activity.count({ where });
    const logs = await prisma.activity.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, username: true } }
      }
    });

    return NextResponse.json({
      logs,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    });
  } catch (error) {
    console.error('Audit logları getirilemedi:', error);
    return NextResponse.json({ error: 'Audit logları getirilemedi' }, { status: 500 });
  }
}


