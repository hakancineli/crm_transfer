import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FlightTracker } from '@/app/lib/flightTracker';

export async function POST(request: NextRequest) {
  try {
    // Tüm aktif rezervasyonları al (bugün ve gelecek)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: today.toISOString().split('T')[0]
        },
        flightCode: {
          not: null
        }
      },
      select: {
        id: true,
        voucherNumber: true,
        flightCode: true,
        date: true,
        time: true,
        from: true,
        to: true
      }
    });

    const results = [];
    
    for (const reservation of reservations) {
      if (!reservation.flightCode) continue;
      
      try {
        const flightInfo = await FlightTracker.getFlightInfo(reservation.flightCode);
        
        if (flightInfo) {
          // Uçuş durumunu rezervasyona kaydet (opsiyonel)
          // Burada uçuş durumunu veritabanında saklayabiliriz
          results.push({
            voucherNumber: reservation.voucherNumber,
            flightCode: reservation.flightCode,
            status: flightInfo.status,
            delay: flightInfo.delay || 0
          });
        }
      } catch (error) {
        console.error(`Uçuş ${reservation.flightCode} güncellenirken hata:`, error);
      }
    }

    return NextResponse.json({
      message: 'Uçuş durumları güncellendi',
      updated: results.length,
      results
    });
  } catch (error) {
    console.error('Uçuş durumu güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Uçuş durumları güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// GET endpoint for manual trigger
export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/flights/update-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Manuel uçuş durumu güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Uçuş durumları güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
