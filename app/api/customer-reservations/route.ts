import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Telefon numarası ile rezervasyonları ara
        const reservations = await prisma.reservation.findMany({
            where: {
                phoneNumber: {
                    contains: phone,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                voucherNumber: true,
                date: true,
                time: true,
                from: true,
                to: true,
                flightCode: true,
                luggageCount: true,
                passengerNames: true,
                phoneNumber: true,
                isReturn: true,
                returnTransfer: {
                    select: {
                        voucherNumber: true,
                        date: true,
                        time: true
                    }
                },
                originalTransfer: {
                    select: {
                        voucherNumber: true,
                        date: true,
                        time: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Fiyat bilgilerini gizle
        const sanitizedReservations = reservations.map(reservation => ({
            ...reservation,
            // Fiyat bilgileri gösterilmiyor
            price: undefined,
            currency: undefined,
            driverFee: undefined,
            driver: undefined,
            paymentStatus: undefined
        }));

        return NextResponse.json(sanitizedReservations);
    } catch (error) {
        console.error('Müşteri rezervasyon arama hatası:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
