import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Reservation } from '@prisma/client';
import jwt from 'jsonwebtoken';

async function getRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        return {
            usd: data.rates.TRY || 31.50,
            eur: (data.rates.TRY / data.rates.EUR) || 34.20
        };
    } catch (error) {
        console.error('Kurlar alınamadı:', error);
        return { usd: 31.50, eur: 34.20 }; // Fallback
    }
}

export async function POST(request: NextRequest) {
    try {
        const { startDate, endDate } = await request.json();

        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Tarih aralığı gerekli' }, { status: 400 });
        }
        const rates = await getRates();

        const authHeader = request.headers.get('authorization');
        let currentUserRole: string | null = null;
        let currentTenantIds: string[] = [];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decoded: any = jwt.decode(token);
                currentUserRole = decoded?.role || null;
                if (decoded?.userId) {
                    const links = await prisma.tenantUser.findMany({
                        where: { userId: decoded.userId, isActive: true },
                        select: { tenantId: true }
                    });
                    currentTenantIds = links.map((l: any) => l.tenantId);
                }
            } catch (_) { }
        }

        const whereClause: any = {
            date: { gte: String(startDate), lte: String(endDate) }
        };
        const tourWhereClause: any = {
            tourDate: {
                gte: new Date(startDate),
                lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            }
        };

        if (currentUserRole && currentUserRole !== 'SUPERUSER') {
            if (currentTenantIds.length > 0) {
                whereClause.tenantId = { in: currentTenantIds };
                tourWhereClause.tenantId = { in: currentTenantIds };
            } else {
                whereClause.tenantId = '__none__';
                tourWhereClause.tenantId = '__none__';
            }
        }

        // Fetch Both
        const [reservations, tourBookings] = await Promise.all([
            prisma.reservation.findMany({
                where: whereClause,
                include: { driver: true }
            }),
            prisma.tourBooking.findMany({
                where: tourWhereClause,
                include: { driver: true }
            })
        ]);

        console.log(`Rapor API: ${reservations.length} transfer, ${tourBookings.length} tur bulundu.`);

        const allItems = [
            ...reservations.map(r => ({ ...r, itemType: 'transfer' })),
            ...tourBookings.map(t => ({
                ...t,
                date: t.tourDate.toISOString().split('T')[0],
                itemType: 'tour'
            }))
        ];

        // Toplam gelir (Normalize to TL)
        let totalRevenueTL = 0;
        let totalRevenueUSD = 0;
        let totalRevenueEUR = 0;

        allItems.forEach((res: any) => {
            const price = Number(res.price) || 0;
            if (res.currency === 'USD') {
                totalRevenueUSD += price;
                totalRevenueTL += (price * rates.usd);
            } else if (res.currency === 'EUR') {
                totalRevenueEUR += price;
                totalRevenueTL += (price * rates.eur);
            } else {
                totalRevenueTL += price;
            }
        });

        const driverPayments = allItems.reduce((sum: number, res: any) => sum + (Number(res.driverFee) || 0), 0);

        const result = {
            totalRevenueUSD,
            totalRevenueEUR,
            totalRevenueTL,
            usdRate: rates.usd,
            eurRate: rates.eur,
            totalTransfers: reservations.length,
            totalTours: tourBookings.length,
            totalItems: allItems.length,
            paidItems: allItems.filter((r: any) => r.paymentStatus === 'PAID').length,
            unpaidItems: allItems.filter((r: any) => r.paymentStatus === 'UNPAID' || r.paymentStatus === 'PENDING').length,
            driverPayments,
            netIncome: totalRevenueTL - driverPayments,
            transfersByType: {
                pickup: reservations.filter((r: any) => r.from.includes('IST') || r.from.includes('SAW')).length,
                dropoff: reservations.filter((r: any) => r.to.includes('IST') || r.to.includes('SAW')).length,
                transfer: reservations.filter((r: any) =>
                    (!r.from.includes('IST') && !r.from.includes('SAW')) &&
                    (!r.to.includes('IST') && !r.to.includes('SAW'))
                ).length,
                tour: tourBookings.length
            }
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Rapor verisi getirme hatası:', error);
        return NextResponse.json({ error: 'Rapor verisi getirilemedi' }, { status: 500 });
    }
} 