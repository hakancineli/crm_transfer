import { NextRequest, NextResponse } from 'next/server';

// Bu endpoint varsayılan olarak kapalıdır. Prod'da kesinlikle açmayın.
export async function POST(request: NextRequest) {
    const enabled = (process.env.ADMIN_LOGIN_ENABLE || 'false').toLowerCase() === 'true';
    if (!enabled) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    try {
        const { password } = await request.json();
        const adminPassword = process.env.ADMIN_LOGIN_PASSWORD || '';
        if (adminPassword && password === adminPassword) {
            const response = NextResponse.json({ success: true });
            response.cookies.set('admin-auth', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
            });
            return response;
        }
        return NextResponse.json({ error: 'Yanlış şifre' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
