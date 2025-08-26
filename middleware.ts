import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Admin sayfaları için şifre koruması
	const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/reservations') || pathname.startsWith('/reports') || pathname.startsWith('/drivers');

	if (isAdminRoute) {
		const adminSession = request.cookies.get('admin-auth');
		if (!adminSession || adminSession.value !== 'true') {
			return NextResponse.redirect(new URL('/admin-login', request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
};
