import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        url: (process.env.WHATSAPP_SERVICE_URL || 'not set').trim(),
        hasKey: !!process.env.WHATSAPP_SERVICE_API_KEY
    });
}
