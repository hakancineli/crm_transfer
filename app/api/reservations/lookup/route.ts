import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const voucher = searchParams.get('voucher');
    const phone = searchParams.get('phone');
    const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 20);

    if (!voucher && !phone) {
      return NextResponse.json({ error: 'voucher veya phone parametresi gerekli' }, { status: 400 });
    }

    const where: any = {};
    if (voucher) where.voucherNumber = voucher;
    if (phone) where.phoneNumber = { contains: phone };

    const results = await prisma.reservation.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      select: {
        id: true,
        voucherNumber: true,
        date: true,
        time: true,
        from: true,
        to: true,
        price: true,
        currency: true,
        paymentStatus: true,
        phoneNumber: true,
        tenantId: true,
      },
    });

    return NextResponse.json({ results });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('Lookup API error:', msg, error);
    return NextResponse.json({ error: 'Lookup başarısız', details: msg }, { status: 500 });
  }
}
