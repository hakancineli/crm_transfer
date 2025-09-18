import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'SUPERUSER gerekli' }, { status: 403 });
    }

    // Aggregate counts by tenant and by user
    const [tenants, users, reservations] = await Promise.all([
      prisma.tenant.findMany({ select: { id: true, companyName: true, subdomain: true } }),
      prisma.user.findMany({ select: { id: true, username: true, email: true, role: true } }),
      prisma.reservation.findMany({ select: { id: true, tenantId: true, userId: true } })
    ]);

    const tenantMap: Record<string, { id: string; companyName: string; subdomain: string }> = {};
    for (const t of tenants) tenantMap[t.id] = t;
    const userMap: Record<string, { id: string; username: string; email: string; role: string }> = {};
    for (const u of users) userMap[u.id] = u;

    const byTenant: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    for (const r of reservations) {
      if (r.tenantId) byTenant[r.tenantId] = (byTenant[r.tenantId] || 0) + 1;
      if (r.userId) byUser[r.userId] = (byUser[r.userId] || 0) + 1;
    }

    const tenantsList = Object.entries(byTenant)
      .map(([tenantId, count]) => ({
        tenantId,
        count,
        tenant: tenantMap[tenantId] || null
      }))
      .sort((a, b) => b.count - a.count);

    const usersList = Object.entries(byUser)
      .map(([userId, count]) => ({
        userId,
        count,
        user: userMap[userId] || null
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ tenants: tenantsList, users: usersList, total: reservations.length });
  } catch (err) {
    console.error('Reservation stats error:', err);
    return NextResponse.json({ error: 'İstatistikler getirilemedi' }, { status: 500 });
  }
}



