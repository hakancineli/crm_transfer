import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    // If phone parameter is provided, search by phone number
    if (phone) {
      const normalized = phone.trim();
      const noSpaces = normalized.replace(/\s+/g, '');
      const digitsOnly = normalized.replace(/\D+/g, ''); // keep only numbers
      const digitsNoLeadingZero = digitsOnly.replace(/^0+/, '');

      const reservations = await prisma.reservation.findMany({
        where: {
          OR: [
            { phoneNumber: { equals: normalized } },
            { phoneNumber: { equals: noSpaces } },
            { phoneNumber: { contains: normalized, mode: 'insensitive' } },
            { phoneNumber: { contains: digitsOnly, mode: 'insensitive' } },
            { phoneNumber: { contains: digitsNoLeadingZero, mode: 'insensitive' } },
            { phoneNumber: { contains: `+${digitsNoLeadingZero}`, mode: 'insensitive' } }
          ]
        },
        orderBy: [
          { date: 'desc' },
          { time: 'desc' }
        ],
        include: {
          driver: true
        }
      });

      // Parse passenger names for each reservation
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
    }

    // If no phone parameter, return all reservations (admin panel)
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

        // Voucher numarası oluştur - daha güvenli algoritma
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        
        // O günkü mevcut voucher numaralarını al
        const todayVouchers = await prisma.reservation.findMany({
            where: {
                voucherNumber: {
                    startsWith: `VIP${formattedDate}-`
                }
            },
            select: {
                voucherNumber: true
            }
        });
        
        // Sıradaki numarayı bul
        let nextNumber = 1;
        if (todayVouchers.length > 0) {
            const numbers = todayVouchers.map(v => {
                const match = v.voucherNumber.match(/VIP\d+-(\d+)/);
                return match ? parseInt(match[1]) : 0;
            });
            nextNumber = Math.max(...numbers) + 1;
        }
        
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
                distanceKm: data.distanceKm,
                voucherNumber,
                driverId: null,
                driverFee: null
            }
        });

        // Telegram bildirimi (opsiyonel)
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        if (BOT_TOKEN && CHAT_ID) {
            try {
                const textLines = [
                    `Yeni Müşteri Talebi ✅`,
                    `Voucher: ${voucherNumber}`,
                    `Tarih: ${data.date} ${data.time}`,
                    `Güzergah: ${data.from} → ${data.to}`,
                    `Yolcular: ${(Array.isArray(data.passengerNames) ? data.passengerNames.join(', ') : '') || '-'}`,
                    `Telefon: ${data.phoneNumber}`,
                    data.flightCode ? `Uçuş: ${data.flightCode}` : undefined,
                    data.specialRequests ? `Not: ${data.specialRequests}` : undefined
                ].filter(Boolean).join('\n');

                const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: String(CHAT_ID), text: textLines })
                });

                if (!tgRes.ok) {
                    const errText = await tgRes.text();
                    console.error('Telegram bildirim hatası (response):', errText);
                }
            } catch (notifyErr) {
                console.error('Telegram bildirim hatası (fetch):', notifyErr);
            }
        }

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