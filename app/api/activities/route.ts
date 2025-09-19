import { NextRequest, NextResponse } from 'next/server';
import { ActivityLogger } from '@/app/lib/activityLogger';

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
