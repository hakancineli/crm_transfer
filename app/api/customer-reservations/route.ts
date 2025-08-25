import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Telefonu normalize et
        const normalized = phone.trim();
        const noSpaces = normalized.replace(/\s+/g, '');

        // Telefon numarası ile rezervasyonları ara (eşleşme öncelikli, sonra contains)
        const reservations = await prisma.reservation.findMany({
            where: {
                OR: [
                    { phoneNumber: { equals: normalized } },
                    { phoneNumber: { equals: noSpaces } },
                    { phoneNumber: { contains: normalized, mode: 'insensitive' } }
                ]
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
                price: true,
                currency: true,
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
            orderBy: { date: 'desc' },
            take: 50
        });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Müşteri rezervasyon arama hatası:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        // paylaşılan prisma istemcisi kullanılıyor; disconnect yapılmaz
    }
}
