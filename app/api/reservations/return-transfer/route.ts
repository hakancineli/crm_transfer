import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
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
            const numbers = todayVouchers.map((v: any) => {
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
                originalTransfer: {
                    connect: { voucherNumber: originalReservation.voucherNumber }
                }
            }
        });

        // Telegram bildirimi (opsiyonel)
        try {
            const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
            const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
            if (BOT_TOKEN && CHAT_ID) {
                console.log('ReturnTransfer: Telegram sending...');
                const names = (() => { try { return JSON.parse(originalReservation.passengerNames || '[]'); } catch { return []; } })();
                const textLines = [
                    'Dönüş Transferi Oluşturuldu 🔄',
                    `Voucher: ${returnVoucherNumber}`,
                    `Orijinal: ${originalVoucherNumber}`,
                    `Tarih: ${returnDate} ${returnTime}`,
                    `Güzergah: ${originalReservation.to} → ${originalReservation.from}`,
                    names.length ? `Yolcular: ${names.join(', ')}` : undefined,
                    originalReservation.phoneNumber ? `Telefon: ${originalReservation.phoneNumber}` : undefined,
                    originalReservation.flightCode ? `Uçuş: ${originalReservation.flightCode}` : undefined
                ].filter(Boolean).join('\n');
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 1500);
                fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: String(CHAT_ID), text: textLines }),
                    signal: controller.signal
                }).then(async (tgRes) => {
                    clearTimeout(timeout);
                    if (!tgRes.ok) {
                        const errText = await tgRes.text();
                        console.error('Telegram response not ok:', tgRes.status, errText);
                    } else {
                        console.log('ReturnTransfer: Telegram sent successfully');
                    }
                }).catch((e) => {
                    clearTimeout(timeout);
                    console.error('ReturnTransfer: Telegram fetch error:', e?.name || e);
                });
            }
            else {
                console.warn('ReturnTransfer: BOT_TOKEN or CHAT_ID missing');
            }
        } catch (notifyErr) {
            console.error('ReturnTransfer: Telegram send error:', notifyErr);
        }

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
