import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserContext } from '@/app/lib/requestContext';

const WA_SERVICE_URL = (process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001').trim();
const WA_SERVICE_KEY = (process.env.WHATSAPP_SERVICE_API_KEY || '').trim();

export async function POST(request: NextRequest) {
    try {
        const { userId } = await getRequestUserContext(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { to, file, fileName, caption } = body;

        const res = await fetch(`${WA_SERVICE_URL}/sessions/${userId}/send-media`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': WA_SERVICE_KEY,
            },
            body: JSON.stringify({ to, file, fileName, caption }),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error('WA send media error:', err);
        return NextResponse.json({ error: 'Failed to send media' }, { status: 500 });
    }
}
