import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: [
        { date: 'desc' },
        { time: 'desc' }
      ],
      include: {
        driver: true
      }
    });

    // Her rezervasyon için yolcu isimlerini parse et
    const parsedReservations = reservations.map(reservation => {
      try {
        return {
          ...reservation,
          passengerNames: JSON.parse(reservation.passengerNames || '[]'),
          createdAt: reservation.createdAt.toISOString()
        };
      } catch (error) {
        console.error('Yolcu isimleri parse hatası:', error);
        return {
          ...reservation,
          passengerNames: [],
          createdAt: reservation.createdAt.toISOString()
        };
      }
    });

    return NextResponse.json(parsedReservations);
  } catch (error) {
    console.error('Rezervasyonları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Rezervasyonlar getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        
        // Yolcu isimlerini JSON string'e çevir
        const passengerNames = Array.isArray(data.passengerNames) 
            ? JSON.stringify(data.passengerNames)
            : JSON.stringify([]);

        // Voucher numarası oluştur - tarih bazlı sıralı
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        
        // O günkü rezervasyon sayısını al
        const todayReservations = await prisma.reservation.findMany({
            where: {
                date: data.date
            }
        });
        
        // Sıradaki numara
        const nextNumber = todayReservations.length + 1;
        const voucherNumber = `VIP${formattedDate}-${nextNumber}`;

        const reservation = await prisma.reservation.create({
            data: {
                date: data.date,
                time: data.time,
                from: data.from,
                to: data.to,
                flightCode: data.flightCode,
                passengerNames,
                luggageCount: data.luggageCount,
                price: data.price,
                currency: data.currency,
                phoneNumber: data.phoneNumber,
                voucherNumber,
                driverId: null,
                driverFee: null
            }
        });

        return NextResponse.json({
            ...reservation,
            passengerNames: JSON.parse(passengerNames)
        });
    } catch (error) {
        console.error('Rezervasyon oluşturma hatası:', error);
        return NextResponse.json(
            { error: 'Rezervasyon oluşturulurken bir hata oluştu' },
            { status: 500 }
        );
    }
} 