import { NextResponse } from 'next/server';

export async function POST() {
  try {
    return NextResponse.json({ 
      message: 'Server restart initiated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Restart API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
