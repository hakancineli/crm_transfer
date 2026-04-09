import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserContext } from '@/app/lib/requestContext';

const WA_SERVICE_URL = (process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001').trim();
const WA_SERVICE_KEY = (process.env.WHATSAPP_SERVICE_API_KEY || '').trim();

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const tokenFromQuery = searchParams.get('token');

        let userId: string | null = null;
        if (tokenFromQuery) {
            const authReq = new NextRequest(request.url, {
                headers: {
                    authorization: `Bearer ${tokenFromQuery}`,
                },
            });
            const ctx = await getRequestUserContext(authReq);
            userId = ctx.userId;
        } else {
            const ctx = await getRequestUserContext(request);
            userId = ctx.userId;
        }

        if (!userId) return new NextResponse('Unauthorized', { status: 401 });

        const { filename } = params;
        const res = await fetch(`${WA_SERVICE_URL}/media/${filename}`, {
            headers: {
                'x-api-key': WA_SERVICE_KEY
            }
        });

        if (!res.ok) return new NextResponse('Not Found', { status: 404 });

        const blob = await res.blob();
        return new NextResponse(blob, {
            headers: {
                'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (err) {
        console.error('Media proxy error:', err);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
