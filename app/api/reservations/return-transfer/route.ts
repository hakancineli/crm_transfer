import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { originalVoucherNumber, returnDate, returnTime } = await request.json();

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
                isReturn: true,
                returnTransfer: null,
                originalTransfer: {
                    voucherNumber: originalReservation.voucherNumber,
                    date: originalReservation.date,
                    time: originalReservation.time
                }
            }
        });

        // Update original reservation to mark it as having a return transfer
        await prisma.reservation.update({
            where: { voucherNumber: originalVoucherNumber },
            data: {
                returnTransfer: {
                    voucherNumber: returnVoucherNumber,
                    date: returnDate,
                    time: returnTime
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
