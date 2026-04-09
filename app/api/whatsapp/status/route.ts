import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserContext } from '@/app/lib/requestContext';

const WA_SERVICE_URL = (process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001').trim();
const WA_SERVICE_KEY = (process.env.WHATSAPP_SERVICE_API_KEY || '').trim();

type UpstreamErrorCode =
    | 'X_WA_SERVICE_KEY_FAIL'
    | 'X_WA_SERVICE_URL_NOT_FOUND'
    | 'X_WA_SERVICE_BAD_RESPONSE'
    | 'X_WA_SERVICE_UNAVAILABLE';

function waHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-api-key': WA_SERVICE_KEY,
    };
}

async function readUpstreamBody(res: Response) {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text || null;
    }
}

function upstreamErrorResponse(code: UpstreamErrorCode, status: number, details?: unknown) {
    return NextResponse.json({
        error: code,
        status: 'SERVICE_UNAVAILABLE',
        qr: null,
        phone: null,
        details,
    }, { status });
}

async function parseUpstreamResponse(res: Response, action: string, userId: string) {
    const payload = await readUpstreamBody(res);

    if (res.ok) {
        return { ok: true as const, payload };
    }

    console.error(`[WA_${action}] ${userId} upstream error ${res.status}:`, payload);

    if (res.status === 401) {
        return {
            ok: false as const,
            response: upstreamErrorResponse('X_WA_SERVICE_KEY_FAIL', 401),
        };
    }

    if (res.status === 404) {
        return {
            ok: false as const,
            response: upstreamErrorResponse('X_WA_SERVICE_URL_NOT_FOUND', 502, payload),
        };
    }

    return {
        ok: false as const,
        response: upstreamErrorResponse('X_WA_SERVICE_BAD_RESPONSE', 502, payload),
    };
}

// GET /api/whatsapp/status → get current user's session status
export async function GET(request: NextRequest) {
    try {
        const { userId } = await getRequestUserContext(request);
        if (!userId) return NextResponse.json({ error: 'X_CRM_AUTH_FAIL: Oturum Bulunamadı' }, { status: 401 });

        const connect = request.nextUrl.searchParams.get('connect') === 'true';
        if (connect) {
            console.log(`[WA_CONNECT_ALT] Triggering connect via GET for ${userId}`);
            fetch(`${WA_SERVICE_URL}/sessions/${userId}/connect`, {
                method: 'POST',
                headers: waHeaders(),
                body: JSON.stringify({ tenantId: 'default_tenant' }),
            }).catch(e => console.error('[WA_CONNECT_ALT_ERR]', e));
            return NextResponse.json({ success: true, message: 'Connection started via GET' });
        }

        const res = await fetch(`${WA_SERVICE_URL}/sessions/${userId}/status`, {
            headers: waHeaders(),
        });

        console.log(`[WA_STATUS] ${userId} response: ${res.status}`);

        const parsed = await parseUpstreamResponse(res, 'STATUS', userId);
        if (!parsed.ok) return parsed.response;

        return NextResponse.json(parsed.payload);
    } catch (err) {
        console.error('WA status error:', err);
        return upstreamErrorResponse('X_WA_SERVICE_UNAVAILABLE', 503);
    }
}

// POST /api/whatsapp/status → connect (start QR flow)
export async function POST(request: NextRequest) {
    try {
        const { userId, tenantIds } = await getRequestUserContext(request);
        if (!userId) return NextResponse.json({ error: 'X_CRM_AUTH_FAIL: Oturum Bulunamadı' }, { status: 401 });
        const tenantId = tenantIds?.[0] || '';

        console.log(`[WA_CONNECT] Attempting for ${userId} with tenant ${tenantId} at ${WA_SERVICE_URL}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(`${WA_SERVICE_URL}/sessions/${userId}/connect`, {
            method: 'POST',
            headers: waHeaders(),
            body: JSON.stringify({ tenantId }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        console.log(`[WA_CONNECT] Result: ${res.status}`);

        const parsed = await parseUpstreamResponse(res, 'CONNECT', userId);
        if (!parsed.ok) return parsed.response;

        return NextResponse.json(parsed.payload ?? {});
    } catch (err) {
        console.error('WA connect error:', err);
        return upstreamErrorResponse('X_WA_SERVICE_UNAVAILABLE', 503);
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

        const parsed = await parseUpstreamResponse(res, 'DISCONNECT', userId);
        if (!parsed.ok) return parsed.response;

        return NextResponse.json(parsed.payload ?? { success: true });
    } catch (err) {
        console.error('WA disconnect error:', err);
        return upstreamErrorResponse('X_WA_SERVICE_UNAVAILABLE', 503);
    }
}
