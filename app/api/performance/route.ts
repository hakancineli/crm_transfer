import { NextRequest, NextResponse } from 'next/server';
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
          currentTenantIds = links.map(l => l.tenantId);
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

    // Get all users with their reservations (scoped)
    const users = await prisma.user.findMany({
      where: userWhere,
      include: {
        reservations: { where: reservationWhere },
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
    const performance = users.map(user => {
      const totalReservations = user.reservations.length;
      const totalRevenue = user.reservations.reduce((sum, res) => sum + res.price, 0);
      
      const thisMonthReservations = user.reservations.filter(res => {
        const resDate = new Date(res.date);
        return resDate >= startOfMonth && resDate <= endOfMonth;
      }).length;
      
      const thisMonthRevenue = user.reservations
        .filter(res => {
          const resDate = new Date(res.date);
          return resDate >= startOfMonth && resDate <= endOfMonth;
        })
        .reduce((sum, res) => sum + res.price, 0);

      // Calculate average reservations per day (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentReservations = user.reservations.filter(res => {
        const resDate = new Date(res.date);
        return resDate >= thirtyDaysAgo;
      });
      const averageReservationsPerDay = recentReservations.length / 30;

      // Calculate detailed sales metrics
      const paidReservations = user.reservations.filter(res => res.status === 'PAID');
      const approvedReservations = user.reservations.filter(res => res.status === 'APPROVED');
      const pendingReservations = user.reservations.filter(res => res.status === 'PENDING');
      const unpaidReservations = user.reservations.filter(res => res.status === 'UNPAID');
      
      const salesRevenue = [...paidReservations, ...approvedReservations]
        .reduce((sum, res) => sum + res.price, 0);
      
      const pendingRevenue = pendingReservations
        .reduce((sum, res) => sum + res.price, 0);
      
      const unpaidRevenue = unpaidReservations
        .reduce((sum, res) => sum + res.price, 0);

      // Count different types of sales
      const totalSalesCount = paidReservations.length + approvedReservations.length;
      const pendingSalesCount = pendingReservations.length;
      const unpaidSalesCount = unpaidReservations.length;

      // Calculate profitability (assuming 20% commission rate for now)
      const commissionRate = 0.20; // 20% commission
      const totalCommission = totalRevenue * commissionRate;
      const netProfit = totalRevenue - totalCommission;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Get last activity (most recent reservation date)
      const lastActivity = user.reservations.length > 0 
        ? user.reservations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
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
        averageReservationsPerDay,
        lastActivity,
        isActive: user.isActive,
        // Sales and profitability metrics
        salesRevenue,
        pendingRevenue,
        unpaidRevenue,
        totalCommission,
        netProfit,
        profitMargin,
        // Detailed sales counts
        totalSalesCount,
        pendingSalesCount,
        unpaidSalesCount,
        paidSalesCount: paidReservations.length,
        approvedSalesCount: approvedReservations.length
      };
    });

    // Calculate overall statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const totalReservations = users.reduce((sum, user) => sum + user.reservations.length, 0);
    const totalRevenue = users.reduce((sum, user) => 
      sum + user.reservations.reduce((userSum, res) => userSum + res.price, 0), 0
    );

    // Find top performer by revenue
    const topPerformer = performance.reduce((top, current) => 
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
