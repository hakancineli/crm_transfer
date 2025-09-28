import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const auth = request.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.slice(7);
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded?.role !== 'SUPERUSER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || undefined;

    let userId: string | undefined = undefined;
    if (username) {
      const user = await prisma.user.findUnique({ where: { username } });
      userId = user?.id;
    }

    const whereUser: any = userId ? { userId } : {};
    const tenantId = params.tenantId;

    const updatedTransfers = await prisma.reservation.updateMany({
      where: { tenantId: null, ...whereUser },
      data: { tenantId }
    });
    const updatedTours = await prisma.tourBooking.updateMany({
      where: { tenantId: null, ...whereUser },
      data: { tenantId }
    });

    return NextResponse.json({ success: true, updatedTransfers: updatedTransfers.count, updatedTours: updatedTours.count });
  } catch (error) {
    console.error('Backfill reservations error:', error);
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 });
  }
}


