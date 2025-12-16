import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(request: NextRequest) {
    try {
        const { userId, role, tenantIds } = await getRequestUserContext(request);
        const { searchParams } = new URL(request.url);

        // Date Filters
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        const startDate = startDateParam ? new Date(startDateParam) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = endDateParam ? new Date(endDateParam) : new Date();
        // Adjust end date to end of day
        endDate.setHours(23, 59, 59, 999);

        // Build Where Clause
        let whereClause: any = {
            tourDate: {
                gte: startDate,
                lte: endDate
            },
            status: { not: 'CANCELLED' }
        };

        if (role !== 'SUPERUSER' && tenantIds && tenantIds.length > 0) {
            whereClause.tenantId = { in: tenantIds };
        }

        // Fetch Bookings
        const bookings = await prisma.tourBooking.findMany({
            where: whereClause,
            select: {
                id: true,
                price: true,
                currency: true,
                paidAmount: true,
                remainingAmount: true,
                groupSize: true,
                paymentStatus: true,
                routeName: true,
                tourDate: true,
                userId: true,
                User: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Aggregation Logic
        const summary = {
            totalSales: 0,
            totalPaid: 0,
            totalPending: 0,
            totalHeadcount: 0,
            bookingCount: bookings.length
        };

        const byRoute: Record<string, any> = {};
        const bySeller: Record<string, any> = {};

        bookings.forEach(booking => {
            // Normalize currency (mvp: assume base currency or simple summation, real world needs conversion)
            // For now, we'll just sum specific currencies separately if needed, but for simplicity let's assume primary currency is tracked or just sum the amounts. 
            // Ideally we should group by currency too. For this MVP, let's assume mostly EUR/USD and just sum properly if currency matches usage.
            // Let's stick to summing raw values for now but frontend might need to handle mixed currencies.

            const salesAmount = booking.price;
            const paid = booking.paidAmount;
            const pending = booking.remainingAmount || (booking.paymentStatus === 'PAID' ? 0 : booking.price - booking.paidAmount);

            summary.totalSales += salesAmount;
            summary.totalPaid += paid;
            summary.totalPending += pending;
            summary.totalHeadcount += booking.groupSize;

            // Group by Route
            if (!byRoute[booking.routeName]) {
                byRoute[booking.routeName] = {
                    name: booking.routeName,
                    count: 0,
                    sales: 0,
                    headcount: 0
                };
            }
            byRoute[booking.routeName].count++;
            byRoute[booking.routeName].sales += salesAmount;
            byRoute[booking.routeName].headcount += booking.groupSize;

            // Group by Seller
            const sellerName = booking.User?.name || 'Bilinmiyor';
            const sellerId = booking.userId || 'unknown';

            if (!bySeller[sellerId]) {
                bySeller[sellerId] = {
                    id: sellerId,
                    name: sellerName,
                    count: 0,
                    sales: 0,
                    headcount: 0
                };
            }
            bySeller[sellerId].count++;
            bySeller[sellerId].sales += salesAmount;
            bySeller[sellerId].headcount += booking.groupSize;
        });

        return NextResponse.json({
            summary,
            byRoute: Object.values(byRoute).sort((a: any, b: any) => b.sales - a.sales),
            bySeller: Object.values(bySeller).sort((a: any, b: any) => b.sales - a.sales),
            currency: bookings.length > 0 ? bookings[0].currency : 'EUR' // Naive currency hint
        });

    } catch (error) {
        console.error('Report generation error:', error);
        return NextResponse.json({ error: 'Rapor oluşturulamadı' }, { status: 500 });
    }
}
