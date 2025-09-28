import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all users with their roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        permissions: {
          select: {
            permission: true,
            isActive: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'User debug info',
      users: users,
      totalUsers: users.length,
      superusers: users.filter((u: any) => u.role === 'SUPERUSER')
    });

  } catch (error) {
    console.error('Debug user error:', error);
    return NextResponse.json(
      { error: 'Debug bilgileri alınamadı' },
      { status: 500 }
    );
  }
}
