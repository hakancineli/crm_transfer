import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Reservation } from '@prisma/client';

async function getUSDRate() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        return data.rates.TRY;
    } catch (error) {
        console.error('USD kuru alınamadı:', error);
        return 31.50; // Fallback kur
    }
}

export async function POST(request: Request) {
    try {
        const { startDate, endDate } = await request.json();
        const usdRate = await getUSDRate();

        // Tarih aralığındaki tüm rezervasyonları getir
        const reservations = await prisma.reservation.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                driver: true
            }
        });

        // Toplam gelir (USD -> TL)
        const totalRevenueUSD = reservations.reduce((sum: number, res: any) => {
            if (res.currency === 'USD') {
                return sum + res.price;
            }
            return sum;
        }, 0);

        const totalRevenueTL = reservations.reduce((sum: number, res: any) => {
            if (res.currency === 'USD') {
                return sum + (res.price * usdRate);
            }
            return sum + res.price;
        }, 0);

        // Şoför ödemeleri (TL)
        const driverPayments = reservations.reduce((sum: number, res: any) => sum + (res.driverFee || 0), 0);

        // Transfer tipleri
        const transfersByType = {
            pickup: reservations.filter((r: Reservation) => r.from.includes('IST') || r.from.includes('SAW')).length,
            dropoff: reservations.filter((r: Reservation) => r.to.includes('IST') || r.to.includes('SAW')).length,
            transfer: reservations.filter((r: Reservation) => 
                (!r.from.includes('IST') && !r.from.includes('SAW')) && 
                (!r.to.includes('IST') && !r.to.includes('SAW'))
            ).length
        };

        // Popüler rotalar
        const routes = reservations.map((r: Reservation) => `${r.from} → ${r.to}`);
        const routeCounts = routes.reduce((acc: { [key: string]: number }, route: string) => {
            acc[route] = (acc[route] || 0) + 1;
            return acc;
        }, {});

        const popularRoutes = Object.entries(routeCounts)
            .map(([route, count]) => ({ route, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return NextResponse.json({
            totalRevenueUSD,
            totalRevenueTL,
            usdRate,
            totalTransfers: reservations.length,
            paidTransfers: reservations.filter(r => r.paymentStatus === 'PAID').length,
            unpaidTransfers: reservations.filter(r => r.paymentStatus === 'UNPAID').length,
            driverPayments,
            netIncome: totalRevenueTL - driverPayments,
            transfersByType,
            popularRoutes
        });
    } catch (error) {
        console.error('Rapor verisi getirme hatası:', error);
        return NextResponse.json(
            { error: 'Rapor verisi getirilemedi' },
            { status: 500 }
        );
    }
} 