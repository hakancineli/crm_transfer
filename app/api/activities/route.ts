import { NextRequest, NextResponse } from 'next/server';
import { ActivityLogger } from '@/app/lib/activityLogger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

    let activities;
    if (userId) {
      activities = await ActivityLogger.getUserActivities(userId, limit);
    } else {
      activities = await ActivityLogger.getActivities(limit);
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
