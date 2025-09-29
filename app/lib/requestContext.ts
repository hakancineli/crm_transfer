import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export interface RequestUserContext {
  userId: string | null;
  role: string | null;
  tenantIds: string[];
}

export async function getRequestUserContext(request: NextRequest): Promise<RequestUserContext> {
  const authHeader = request.headers.get('authorization');
  let userId: string | null = null;
  let role: string | null = null;
  let tenantIds: string[] = [];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      userId = decoded.userId || null;
      role = decoded.role || null;
      
      if (decoded?.userId) {
        const links = await prisma.tenantUser.findMany({
          where: { userId: decoded.userId, isActive: true },
          select: { tenantId: true }
        });
        tenantIds = links.map((l) => l.tenantId);
      }
    } catch (e) {
      // Token verification failed - ignore
    }
  }

  return { userId, role, tenantIds };
}

export function buildTenantWhere(role: string | null, tenantIds: string[], explicitTenantId?: string) {
  const where: any = {};
  if (explicitTenantId && role === 'SUPERUSER') {
    where.tenantId = explicitTenantId;
    return where;
  }
  if (role === 'AGENCY_ADMIN' || role === 'AGENCY_USER') {
    if (tenantIds.length > 0) {
      where.tenantId = { in: tenantIds };
    } else {
      // Eğer kullanıcının hiç tenant'ı yoksa, hiçbir rezervasyon görmesin
      where.tenantId = '__no_such_tenant__';
    }
  }
  return where;
}



