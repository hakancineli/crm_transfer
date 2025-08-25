import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Admin sayfaları için şifre koruması
	const adminRoutes = ['/reservations', '/reports', '/drivers'];
	const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

	if (isAdminRoute) {
		// Basit şifre kontrolü - session'da admin flag var mı?
		const adminSession = request.cookies.get('admin-auth');
		
		if (!adminSession || adminSession.value !== 'true') {
			// Admin giriş sayfasına yönlendir
			return NextResponse.redirect(new URL('/admin-login', request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/reservations/:path*', '/reports/:path*', '/drivers/:path*', '/admin-login']
};
