import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserContext } from '@/app/lib/requestContext';

const WA_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
const WA_SERVICE_KEY = process.env.WHATSAPP_SERVICE_API_KEY || '';

// POST /api/whatsapp/parse → AI parse a conversation into reservation fields
export async function POST(request: NextRequest) {
    try {
        const { userId } = await getRequestUserContext(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { messageText, type } = await request.json();

        const res = await fetch(`${WA_SERVICE_URL}/parse/reservation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': WA_SERVICE_KEY,
            },
            body: JSON.stringify({ messageText, type }),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error('WA parse error:', err);
        return NextResponse.json({ error: 'Failed to parse' }, { status: 500 });
    }
}
