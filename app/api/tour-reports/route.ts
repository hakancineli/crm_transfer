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
        const summary: any = {
            totalSales: {},
            totalPaid: {},
            totalPending: {},
            totalHeadcount: 0,
            bookingCount: bookings.length
        };

        const byRoute: Record<string, any> = {};
        const bySeller: Record<string, any> = {};

        bookings.forEach(booking => {
            const curr = booking.currency || 'EUR';
            const salesAmount = booking.price;
            const paid = booking.paidAmount;
            const pending = booking.remainingAmount || (booking.paymentStatus === 'PAID' ? 0 : booking.price - booking.paidAmount);

            summary.totalSales[curr] = (summary.totalSales[curr] || 0) + salesAmount;
            summary.totalPaid[curr] = (summary.totalPaid[curr] || 0) + paid;
            summary.totalPending[curr] = (summary.totalPending[curr] || 0) + pending;
            summary.totalHeadcount += booking.groupSize;

            // Group by Route
            if (!byRoute[booking.routeName]) {
                byRoute[booking.routeName] = {
                    name: booking.routeName,
                    count: 0,
                    sales: {},
                    headcount: 0
                };
            }
            byRoute[booking.routeName].count++;
            byRoute[booking.routeName].sales[curr] = (byRoute[booking.routeName].sales[curr] || 0) + salesAmount;
            byRoute[booking.routeName].headcount += booking.groupSize;

            // Group by Seller
            const sellerName = booking.User?.name || 'Bilinmiyor';
            const sellerId = booking.userId || 'unknown';

            if (!bySeller[sellerId]) {
                bySeller[sellerId] = {
                    id: sellerId,
                    name: sellerName,
                    count: 0,
                    sales: {},
                    headcount: 0
                };
            }
            bySeller[sellerId].count++;
            bySeller[sellerId].sales[curr] = (bySeller[sellerId].sales[curr] || 0) + salesAmount;
            bySeller[sellerId].headcount += booking.groupSize;
        });

        return NextResponse.json({
            summary,
            byRoute: Object.values(byRoute),
            bySeller: Object.values(bySeller),
            // Multi-currency support
            currencies: Array.from(new Set(bookings.map(b => b.currency)))
        });

    } catch (error) {
        console.error('Report generation error:', error);
        return NextResponse.json({ error: 'Rapor oluşturulamadı' }, { status: 500 });
    }
}
