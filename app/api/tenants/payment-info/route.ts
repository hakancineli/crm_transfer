import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getRequestUserContext } from '@/app/lib/requestContext';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { role, tenantIds } = await getRequestUserContext(request);
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || undefined;

    const where: any = {};
    if (tenantId) where.id = tenantId;
    if (role !== 'SUPERUSER') {
      where.id = { in: tenantIds || [] };
    }

    const tenants = await prisma.tenant.findMany({
      where,
      select: {
        id: true,
        companyName: true,
        subdomain: true,
        paymentIban: true,
        paymentAccountHolder: true,
        paymentBank: true,
      },
      orderBy: { companyName: 'asc' }
    });

    if (tenantId) {
      const one = tenants[0];
      if (!one) return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 });
      return NextResponse.json(one);
    }
    return NextResponse.json(tenants);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Beklenmeyen hata' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { role, tenantIds } = await getRequestUserContext(request);
    const body = await request.json();
    const { tenantId, paymentIban, paymentAccountHolder, paymentBank } = body || {};

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId gerekli' }, { status: 400 });
    }
    if (role !== 'SUPERUSER') {
      if (!tenantIds || !tenantIds.includes(tenantId)) {
        return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
      }
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        paymentIban: paymentIban ?? null,
        paymentAccountHolder: paymentAccountHolder ?? null,
        paymentBank: paymentBank ?? null,
      },
      select: {
        id: true,
        companyName: true,
        subdomain: true,
        paymentIban: true,
        paymentAccountHolder: true,
        paymentBank: true,
      }
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Beklenmeyen hata' }, { status: 500 });
  }
}


