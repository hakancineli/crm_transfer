import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

async function generateVoucherNumber(): Promise<string> {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const prefix = `VIP${y}${m}${d}-`;
  const today = await prisma.reservation.findMany({
    where: { voucherNumber: { startsWith: prefix } },
    select: { voucherNumber: true }
  });
  let max = 0;
  for (const r of today) {
    const match = r.voucherNumber.match(/-(\d+)$/);
    const n = match ? parseInt(match[1], 10) : 0;
    if (n > max) max = n;
  }
  return `${prefix}${max + 1}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (phone) {
      const normalized = phone.trim();
      const noSpaces = normalized.replace(/\s+/g, '');
      const reservations = await prisma.reservation.findMany({
        where: {
          OR: [
            { phoneNumber: { equals: normalized } },
            { phoneNumber: { equals: noSpaces } },
            { phoneNumber: { contains: normalized, mode: 'insensitive' } }
          ]
        },
        orderBy: { date: 'desc' },
        take: 100
      });
      return NextResponse.json(reservations);
    }

    const reservations = await prisma.reservation.findMany({
      orderBy: { date: 'desc' },
      take: 200
    });
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Reservations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      time,
      from,
      to,
      flightCode,
      passengerNames,
      luggageCount,
      price,
      currency,
      phoneNumber,
      distanceKm
    } = body || {};

    const voucherNumber = await generateVoucherNumber();

    const created = await prisma.reservation.create({
      data: {
        date,
        time,
        from,
        to,
        flightCode: flightCode || null,
        passengerNames: Array.isArray(passengerNames) ? JSON.stringify(passengerNames) : String(passengerNames || '[]'),
        luggageCount: typeof luggageCount === 'number' ? luggageCount : null,
        price: Number(price) || 0,
        currency: String(currency || 'TRY'),
        phoneNumber: phoneNumber || null,
        distanceKm: typeof distanceKm === 'number' ? distanceKm : null,
        voucherNumber,
        driverId: null,
        driverFee: null,
        isReturn: false
      }
    });

    return NextResponse.json({ voucherNumber: created.voucherNumber });
  } catch (error) {
    console.error('Reservations POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


