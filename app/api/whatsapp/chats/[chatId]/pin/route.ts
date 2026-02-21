import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserContext } from '@/app/lib/auth/auth-utils';

const WA_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
const WA_SERVICE_KEY = process.env.WHATSAPP_SERVICE_API_KEY || '';

export async function POST(
    request: NextRequest,
    { params }: { params: { chatId: string } }
) {
    try {
        const { userId } = await getRequestUserContext(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { chatId } = params;
        const body = await request.json();

        const res = await fetch(`${WA_SERVICE_URL}/chats/${userId}/${chatId}/pin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': WA_SERVICE_KEY,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error('WA pin error:', err);
        return NextResponse.json({ error: 'Failed to toggle pin' }, { status: 500 });
    }
}
