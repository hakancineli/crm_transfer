import { NextRequest, NextResponse } from 'next/server';
import { ActivityLogger } from '@/app/lib/activityLogger';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');
    const excludeUsernamesParam = searchParams.get('excludeUsernames') || '';
    const excludeUsernames = excludeUsernamesParam
      .split(',')
      .map(u => u.trim())
      .filter(Boolean);

    let activities;
    if (userId) {
      activities = await ActivityLogger.getUserActivities(userId, limit);
    } else {
      activities = await ActivityLogger.getActivities(limit);
    }

    if (excludeUsernames.length > 0) {
      activities = activities.filter((a: any) => !excludeUsernames.includes(a.user?.username));
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Aktiviteler getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, entityType, entityId, description, details, ipAddress, userAgent } = body;

    const activity = await ActivityLogger.logActivity({
      userId,
      action,
      entityType,
      entityId,
      description,
      details,
      ipAddress: ipAddress || request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: userAgent || request.headers.get('user-agent') || ''
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Aktivite oluşturulamadı' },
      { status: 500 }
    );
  }
}
