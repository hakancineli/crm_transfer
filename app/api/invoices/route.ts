import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { items: true }
    });
    return NextResponse.json({ success: true, invoices });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Faturalar getirilemedi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, reservationId, customerName, items = [], ...rest } = body;

    // totals
    let subtotal = 0;
    let vatAmount = 0;
    for (const it of items) {
      const line = (it.quantity ?? 1) * (it.unitPrice ?? 0);
      subtotal += line;
      vatAmount += line * ((it.vatRate ?? 20) / 100);
    }
    const total = subtotal + vatAmount;

    const created = await prisma.invoice.create({
      data: {
        tenantId,
        reservationId: reservationId ?? null,
        number: rest.number ?? `INV-${Date.now()}`,
        type: rest.type ?? 'EARSIV',
        currency: rest.currency ?? 'TRY',
        customerName,
        customerTaxId: rest.customerTaxId ?? null,
        customerEmail: rest.customerEmail ?? null,
        customerAddress: rest.customerAddress ?? null,
        vatRate: rest.vatRate ?? 20,
        subtotal,
        vatAmount,
        total,
        notes: rest.notes ?? null,
        items: {
          create: items.map((it: any) => ({
            description: it.description,
            quantity: it.quantity ?? 1,
            unitPrice: it.unitPrice ?? 0,
            vatRate: it.vatRate ?? 20,
            total: (it.quantity ?? 1) * (it.unitPrice ?? 0) * (1 + (it.vatRate ?? 20) / 100)
          }))
        }
      },
      include: { items: true }
    });
    return NextResponse.json({ success: true, invoice: created });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Fatura oluşturulamadı' }, { status: 500 });
  }
}

