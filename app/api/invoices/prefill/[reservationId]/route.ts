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
    // Müşteri adı: voucher'daki ilk yolcunun virgülden önceki adı-soyadı; virgül yoksa tam ad
    let customerName = reservation.email || 'Müşteri';
    try {
      const names = JSON.parse((reservation as any).passengerNames || '[]');
      if (Array.isArray(names) && names.length > 0) {
        const raw = String(names[0] ?? '').trim();
        const beforeComma = raw.includes(',') ? raw.split(',')[0] : raw;
        customerName = beforeComma || customerName;
      }
    } catch {}

    // Hizmet türünü belirle (sadece: Transfer, Tur, Konaklama)
    let serviceType = 'Transfer';
    if (reservation.voucherNumber?.startsWith('TUR-')) {
      serviceType = 'Tur';
    } else if (reservation.voucherNumber?.includes('HOTEL') || reservation.voucherNumber?.includes('OTEL')) {
      serviceType = 'Konaklama';
    } else {
      serviceType = 'Transfer';
    }

    const draft = {
      type: 'EARSIV',
      currency: reservation.currency || 'TRY',
      customerName,
      subtotal: Number(subtotal.toFixed(2)),
      vatRate,
      vatAmount: Number(vatAmount.toFixed(2)),
      total: Number(price.toFixed(2)),
      items: [
        {
          description: `${serviceType} Hizmeti`,
          quantity: 1,
          unitPrice: Number(subtotal.toFixed(2)),
          vatRate,
          unit: 'ADET'
        }
      ]
    };

    return NextResponse.json({ success: true, draft, meta: { baseCurrency: reservation.currency, baseTotal: price, voucherNumber: reservation.voucherNumber, date: reservation.date, time: reservation.time, route: `${reservation.from} → ${reservation.to}` } });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Ön doldurma başarısız' }, { status: 500 });
  }
}

