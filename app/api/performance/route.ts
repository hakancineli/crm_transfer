import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Scope by tenant for non-SUPERUSER
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

    const reservationWhere: any = {};
    if (currentUserRole && currentUserRole !== 'SUPERUSER') {
      if (currentTenantIds.length > 0) {
        reservationWhere.tenantId = { in: currentTenantIds };
      } else {
        reservationWhere.tenantId = '__none__';
      }
    }

    // Add date filtering
    if (fromDate && toDate) {
      reservationWhere.date = {
        gte: fromDate,
        lte: toDate
      };
    }

    // Build user filter
    const userWhere: any = {
      isActive: true
    };

    // Add specific user filter if provided
    if (userId) {
      userWhere.id = userId;
    } else {
      // Only apply tenant filtering if no specific user is requested
      userWhere.tenantUsers = {
        some: {
          isActive: true,
          ...(currentUserRole !== 'SUPERUSER' && currentTenantIds.length > 0 ? {
            tenantId: { in: currentTenantIds }
          } : {})
        }
      };
    }

    // Get all users with their reservations and hotel bookings (scoped)
    const users = await prisma.user.findMany({
      where: userWhere,
      include: {
        reservations: { 
          where: reservationWhere,
          include: {
            hotelBookings: true
          }
        },
        _count: {
          select: {
            reservations: true
          }
        }
      }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Calculate performance for each user
    const performance = users.map((user: any) => {
      const totalReservations = user.reservations.length;
      
      // Calculate transfer revenue
      const transferRevenue = user.reservations.reduce((sum: number, res: any) => sum + res.price, 0);
      
      // Calculate hotel revenue from reservations
      const hotelRevenue = user.reservations.reduce((sum: number, res: any) => {
        return sum + res.hotelBookings.reduce((hotelSum: number, booking: any) => hotelSum + booking.totalPrice, 0);
      }, 0);
      
      const totalRevenue = transferRevenue + hotelRevenue;
      
      const thisMonthReservations = user.reservations.filter((res: any) => {
        const resDate = new Date(res.date);
        return resDate >= startOfMonth && resDate <= endOfMonth;
      }).length;
      
      const thisMonthTransferRevenue = user.reservations
        .filter((res: any) => {
          const resDate = new Date(res.date);
          return resDate >= startOfMonth && resDate <= endOfMonth;
        })
        .reduce((sum: number, res: any) => sum + res.price, 0);
        
      const thisMonthHotelRevenue = user.reservations
        .filter((res: any) => {
          const resDate = new Date(res.date);
          return resDate >= startOfMonth && resDate <= endOfMonth;
        })
        .reduce((sum: number, res: any) => {
          return sum + res.hotelBookings.reduce((hotelSum: number, booking: any) => hotelSum + booking.totalPrice, 0);
        }, 0);
        
      const thisMonthRevenue = thisMonthTransferRevenue + thisMonthHotelRevenue;


      // Calculate detailed sales metrics
      const paidReservations = user.reservations.filter((res: any) => res.paymentStatus === 'PAID');
      const approvedReservations = user.reservations.filter((res: any) => res.paymentStatus === 'APPROVED');
      const pendingReservations = user.reservations.filter((res: any) => res.paymentStatus === 'PENDING');
      const unpaidReservations = user.reservations.filter((res: any) => res.paymentStatus === 'UNPAID');
      
      const salesRevenue = [...paidReservations, ...approvedReservations]
        .reduce((sum: number, res: any) => sum + res.price, 0);
      
      const pendingRevenue = pendingReservations
        .reduce((sum: number, res: any) => sum + res.price, 0);
      
      const unpaidRevenue = unpaidReservations
        .reduce((sum: number, res: any) => sum + res.price, 0);

      // Count different types of sales
      const totalSalesCount = paidReservations.length + approvedReservations.length;
      const pendingSalesCount = pendingReservations.length;
      const unpaidSalesCount = unpaidReservations.length;

      // Calculate detailed costs and profitability
      const transferCommissionRate = 0.20; // 20% commission for transfers
      const hotelCommissionRate = 0.15; // 15% commission for hotels
      
      // Calculate driver fees (from reservations)
      const totalDriverFees = user.reservations.reduce((sum: number, res: any) => sum + (res.driverFee || 0), 0);
      
      // Calculate transfer commissions
      const transferCommission = transferRevenue * transferCommissionRate;
      
      // Calculate hotel commissions
      const hotelCommission = hotelRevenue * hotelCommissionRate;
      
      const totalCommission = transferCommission + hotelCommission;
      const totalCosts = totalDriverFees + totalCommission;
      const netProfit = totalRevenue - totalCosts;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      // Calculate hotel bookings count
      const totalHotelBookings = user.reservations.reduce((sum: number, res: any) => sum + res.hotelBookings.length, 0);

      // Get last activity (most recent reservation date)
      const lastActivity = user.reservations.length > 0 
        ? user.reservations.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : user.createdAt.toISOString();

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        totalReservations,
        totalRevenue,
        thisMonthReservations,
        thisMonthRevenue,
        lastActivity,
        isActive: user.isActive,
        // Revenue breakdown
        transferRevenue,
        hotelRevenue,
        thisMonthTransferRevenue,
        thisMonthHotelRevenue,
        // Sales and profitability metrics
        salesRevenue,
        pendingRevenue,
        unpaidRevenue,
        totalCommission,
        netProfit,
        profitMargin,
        // Detailed costs
        totalDriverFees,
        transferCommission,
        hotelCommission,
        totalCosts,
        // Detailed sales counts
        totalSalesCount,
        pendingSalesCount,
        unpaidSalesCount,
        paidSalesCount: paidReservations.length,
        approvedSalesCount: approvedReservations.length,
        // Hotel metrics
        totalHotelBookings
      };
    });

    // Calculate overall statistics
    const totalUsers = users.length;
    const activeUsers = users.filter((user: any) => user.isActive).length;
    const totalReservations = users.reduce((sum: number, user: any) => sum + user.reservations.length, 0);
    const totalRevenue = users.reduce((sum: number, user: any) => 
      sum + user.reservations.reduce((userSum: number, res: any) => userSum + res.price, 0), 0
    );

    // Find top performer by revenue
    const topPerformer = performance.reduce((top: any, current: any) => 
      current.totalRevenue > top.totalRevenue ? current : top, performance[0] || null
    );

    // Calculate average performance
    const averagePerformance = totalReservations / totalUsers;

    const stats = {
      totalUsers,
      activeUsers,
      totalReservations,
      totalRevenue,
      topPerformer,
      averagePerformance
    };

    return NextResponse.json({
      performance,
      stats
    });

  } catch (error) {
    console.error('Performans verileri getirme hatası:', error);
    return NextResponse.json(
      { error: 'Performans verileri alınamadı' },
      { status: 500 }
    );
  }
}
