import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { reservationId: string } }) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.reservationId }
    });
    if (!reservation) return NextResponse.json({ success: false, error: 'Rezervasyon bulunamadı' }, { status: 404 });

    const vatRate = 20;
    const price = reservation.price ?? 0;
    const subtotal = price / (1 + vatRate / 100);
    const vatAmount = price - subtotal;

    const draft = {
      type: 'EARSIV',
      currency: reservation.currency || 'TRY',
      customerName: reservation.email || 'Müşteri',
      subtotal: Number(subtotal.toFixed(2)),
      vatRate,
      vatAmount: Number(vatAmount.toFixed(2)),
      total: Number(price.toFixed(2)),
      items: [
        {
          description: `${reservation.from} → ${reservation.to} Transfer (${reservation.voucherNumber})`,
          quantity: 1,
          unitPrice: Number(subtotal.toFixed(2)),
          vatRate
        }
      ]
    };

    return NextResponse.json({ success: true, draft });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Ön doldurma başarısız' }, { status: 500 });
  }
}

