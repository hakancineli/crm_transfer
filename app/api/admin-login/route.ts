import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'admin123'; // Basit şifre - production'da environment variable kullanın

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        if (password === ADMIN_PASSWORD) {
            const response = NextResponse.json({ success: true });
            
            // Admin authentication cookie'si set et
            response.cookies.set('admin-auth', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 gün
            });

            return response;
        } else {
            return NextResponse.json(
                { error: 'Yanlış şifre' },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}
