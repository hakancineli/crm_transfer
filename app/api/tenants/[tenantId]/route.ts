import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import jwt from 'jsonwebtoken';

export async function DELETE(request: NextRequest, { params }: { params: { tenantId: string } }) {
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

    const tenantId = params.tenantId;

    // Ensure tenant exists
    const existing = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!existing) {
      return NextResponse.json({ error: 'Şirket bulunamadı' }, { status: 404 });
    }

    // Transactional cascading delete of related records owned by tenant
    await prisma.$transaction(async (tx) => {
      // Remove tenant modules
      await tx.tenantModule.deleteMany({ where: { tenantId } });
      // Remove tenant users links
      await tx.tenantUser.deleteMany({ where: { tenantId } });
      // Optional: Remove reservations and tour bookings owned by this tenant
      await tx.reservation.deleteMany({ where: { tenantId } });
      await tx.tourBooking.deleteMany({ where: { tenantId } });
      // Finally remove tenant
      await tx.tenant.delete({ where: { id: tenantId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tenant silme hatası:', error);
    return NextResponse.json({ error: 'Şirket silinemedi' }, { status: 500 });
  }
}


