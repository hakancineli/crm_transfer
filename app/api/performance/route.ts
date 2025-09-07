import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all users with their reservations
    const users = await prisma.user.findMany({
      include: {
        reservations: true,
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
        isActive: user.isActive
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
