import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserContext } from '@/app/lib/requestContext';

const WA_SERVICE_URL = (process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001').trim();
const WA_SERVICE_KEY = (process.env.WHATSAPP_SERVICE_API_KEY || '').trim();

function waHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-api-key': WA_SERVICE_KEY,
    };
}

// GET /api/whatsapp/status → get current user's session status
export async function GET(request: NextRequest) {
    try {
        const { userId } = await getRequestUserContext(request);
        if (!userId) return NextResponse.json({ error: 'CRM_AUTH_ERROR: Oturum geçersiz' }, { status: 401 });

        const res = await fetch(`${WA_SERVICE_URL}/sessions/${userId}/status`, {
            headers: waHeaders(),
        });

        if (res.status === 401) {
            return NextResponse.json({ error: 'WA_SERVICE_AUTH_ERROR: Railway API Key geçersiz' }, { status: 401 });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error('WA status error:', err);
        return NextResponse.json({ status: 'SERVICE_UNAVAILABLE', qr: null, phone: null });
    }
}

// POST /api/whatsapp/status → connect (start QR flow)
export async function POST(request: NextRequest) {
    try {
        const { userId, tenantIds } = await getRequestUserContext(request);
        if (!userId) return NextResponse.json({ error: 'CRM_AUTH_ERROR: Oturum geçersiz' }, { status: 401 });
        const tenantId = tenantIds?.[0] || '';

        const res = await fetch(`${WA_SERVICE_URL}/sessions/${userId}/connect`, {
            method: 'POST',
            headers: waHeaders(),
            body: JSON.stringify({ tenantId }),
        });

        if (res.status === 401) {
            return NextResponse.json({ error: 'WA_SERVICE_AUTH_ERROR: Railway API Key geçersiz' }, { status: 401 });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error('WA connect error:', err);
        return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
}

// DELETE /api/whatsapp/status → disconnect
export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await getRequestUserContext(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const res = await fetch(`${WA_SERVICE_URL}/sessions/${userId}/disconnect`, {
            method: 'DELETE',
            headers: waHeaders(),
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error('WA disconnect error:', err);
        return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
}
