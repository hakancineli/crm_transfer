import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function safeDbHost(url: string | undefined) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.host; // only host:port, no creds
  } catch {
    return 'invalid-url';
  }
}

export async function GET(_request: NextRequest) {
  try {
    const [reservations, tourBookings, users, drivers, tenants] = await Promise.all([
      prisma.reservation.count(),
      prisma.tourBooking.count(),
      prisma.user.count(),
      prisma.driver.count(),
      prisma.tenant.count()
    ]);

    return NextResponse.json({
      env: {
        dbHost: safeDbHost(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL)
      },
      counts: { reservations, tourBookings, users, drivers, tenants }
    });
  } catch (error) {
    return NextResponse.json({ error: 'debug failed', details: (error as Error).message }, { status: 500 });
  }
}


