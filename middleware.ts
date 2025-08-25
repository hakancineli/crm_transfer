import { NextRequest, NextResponse } from 'next/server';

// Tüm şifre korumalarını kapat: middleware no-op
export function middleware(_req: NextRequest) {
	return NextResponse.next();
}

// Hiçbir route için middleware çalıştırmayı gerektirmiyoruz
export const config = {
	matcher: [],
};
