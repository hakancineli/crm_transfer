import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Reservation } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

export async function POST(request: NextRequest) {
    try {
        const { startDate, endDate } = await request.json();

        // startDate / endDate formatını YYYY-MM-DD kabul edelim
        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Tarih aralığı gerekli' }, { status: 400 });
        }
        const usdRate = await getUSDRate();

        // Tenant scoping for non-SUPERUSER
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
            } catch (_) {}
        }

        const whereClause: any = {
            // date alanı string (YYYY-MM-DD). Postgres için doğrudan karşılaştırma yapılabilir.
            date: {
                gte: String(startDate),
                lte: String(endDate)
            }
        };
        if (currentUserRole && currentUserRole !== 'SUPERUSER') {
            if (currentTenantIds.length > 0) {
                whereClause.tenantId = { in: currentTenantIds };
            } else {
                whereClause.tenantId = '__none__';
            }
        }

        // Tarih aralığındaki tüm rezervasyonları getir
        const reservations = await prisma.reservation.findMany({
            where: whereClause,
            include: {
                driver: true
            }
        });

        console.log(`Rapor API: ${reservations.length} rezervasyon bulundu (${startDate} - ${endDate})`);

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
            .map(([route, count]) => ({ route, count: count as number }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const result = {
            totalRevenueUSD,
            totalRevenueTL,
            usdRate,
            totalTransfers: reservations.length,
            paidTransfers: reservations.filter((r: any) => r.paymentStatus === 'PAID').length,
            unpaidTransfers: reservations.filter((r: any) => r.paymentStatus === 'UNPAID').length,
            driverPayments,
            netIncome: totalRevenueTL - driverPayments,
            transfersByType,
            popularRoutes
        };

        console.log('Rapor API sonucu:', result);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Rapor verisi getirme hatası:', error);
        return NextResponse.json(
            { error: 'Rapor verisi getirilemedi' },
            { status: 500 }
        );
    }
} 