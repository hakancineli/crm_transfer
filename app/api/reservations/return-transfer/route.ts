import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalVoucherNumber, returnDate, returnTime } = body || {};
    if (!originalVoucherNumber || !returnDate || !returnTime) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    const original = await prisma.reservation.findUnique({ where: { voucherNumber: originalVoucherNumber } });
    if (!original) {
      return NextResponse.json({ error: 'Orijinal rezervasyon bulunamadı' }, { status: 404 });
    }

    const returnVoucherNumber = `${originalVoucherNumber}-R`;
    const created = await prisma.reservation.create({
      data: {
        date: returnDate,
        time: returnTime,
        from: original.to,
        to: original.from,
        flightCode: original.flightCode,
        passengerNames: original.passengerNames,
        luggageCount: original.luggageCount,
        price: original.price,
        currency: original.currency,
        phoneNumber: original.phoneNumber,
        voucherNumber: returnVoucherNumber,
        driverFee: original.driverFee,
        paymentStatus: 'PENDING',
        isReturn: true,
        userId: original.userId || null,
        tenantId: original.tenantId || null,
        originalTransfer: { connect: { id: original.id } }
      }
    });

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (BOT_TOKEN && CHAT_ID) {
      try {
        const names = (() => { try { return JSON.parse(original.passengerNames || '[]'); } catch { return []; } })();
        const text = [
          'Dönüş Transferi Oluşturuldu 🔄',
          `Voucher: ${returnVoucherNumber}`,
          `Orijinal: ${originalVoucherNumber}`,
          `Tarih: ${returnDate} ${returnTime}`,
          `Güzergah: ${original.to} → ${original.from}`,
          names.length ? `Yolcular: ${names.join(', ')}` : undefined,
          original.phoneNumber ? `Telefon: ${original.phoneNumber}` : undefined,
          original.flightCode ? `Uçuş: ${original.flightCode}` : undefined,
        ].filter(Boolean).join('\n');
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text })
        });
      } catch (e) {
        console.error('Telegram gönderim hatası:', e);
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Return transfer hatası:', error);
    return NextResponse.json({ error: 'Dönüş transferi sırasında hata' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';


export async function POST(request: NextRequest) {
    try {
        const { originalVoucherNumber, returnDate, returnTime } = await request.json();
        const ctx = await getRequestUserContext(request);

        // Get the original reservation
        const originalReservation = await prisma.reservation.findUnique({
            where: { voucherNumber: originalVoucherNumber }
        });

        if (!originalReservation) {
            return NextResponse.json(
                { error: 'Orijinal rezervasyon bulunamadı' },
                { status: 404 }
            );
        }

        // Generate voucher number for return transfer
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        
        // Get today's voucher numbers
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
        
        // Find next number
        let nextNumber = 1;
        if (todayVouchers.length > 0) {
            const numbers = todayVouchers.map(v => {
                const match = v.voucherNumber.match(/VIP\d+-(\d+)/);
                return match ? parseInt(match[1]) : 0;
            });
            nextNumber = Math.max(...numbers) + 1;
        }
        
        const returnVoucherNumber = `VIP${formattedDate}-${nextNumber}`;

        // Create return transfer with reversed locations
        const returnTransfer = await prisma.reservation.create({
            data: {
                tenantId: originalReservation.tenantId ?? (ctx.tenantIds?.[0] || null),
                date: returnDate,
                time: returnTime,
                from: originalReservation.to, // Reversed
                to: originalReservation.from, // Reversed
                flightCode: originalReservation.flightCode,
                passengerNames: originalReservation.passengerNames,
                luggageCount: originalReservation.luggageCount,
                price: originalReservation.price,
                currency: originalReservation.currency,
                phoneNumber: originalReservation.phoneNumber,
                distanceKm: originalReservation.distanceKm,
                voucherNumber: returnVoucherNumber,
                driverId: null,
                driverFee: null,
                userId: ctx.userId ?? originalReservation.userId,
                isReturn: true,
                // Prisma nested relation alanı olduğundan null gönderme
                // yerine hiç göndermiyoruz
                originalTransfer: {
                    connect: { voucherNumber: originalReservation.voucherNumber }
                }
            }
        });

        // Update original reservation to mark it as having a return transfer
        await prisma.reservation.update({
            where: { voucherNumber: originalVoucherNumber },
            data: {
                returnTransfer: {
                    connect: { voucherNumber: returnVoucherNumber }
                }
            }
        });

        return NextResponse.json({
            success: true,
            returnTransfer: {
                ...returnTransfer,
                passengerNames: JSON.parse(returnTransfer.passengerNames)
            }
        });

    } catch (error) {
        console.error('Dönüş transferi oluşturma hatası:', error);
        return NextResponse.json(
            { error: 'Dönüş transferi oluşturulurken bir hata oluştu' },
            { status: 500 }
        );
    }
}
