import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const hostname = request.headers.get('host') || '';
	
	// Extract subdomain
	const subdomain = hostname.split('.')[0];
	
	// Public routes that don't need authentication
	const publicRoutes = ['/login', '/admin-login', '/', '/customer-reservation', '/customer-panel', '/reservation-lookup', '/marketing'];

	// Always allow public assets and manifest
	if (
		pathname.startsWith('/api/') ||
		pathname.startsWith('/website/') ||
		pathname === '/site.webmanifest' ||
		pathname === '/robots.txt' ||
		pathname === '/sitemap.xml' ||
		pathname === '/manifest.json'
	) {
		return NextResponse.next();
	}
	
	// Local development: show marketing page at root
	if (hostname.includes('localhost') || hostname.startsWith('127.')) {
		if (pathname === '/') {
			const url = request.nextUrl.clone();
			url.pathname = '/marketing';
			return NextResponse.rewrite(url);
		}
		return NextResponse.next();
	}

	// Domain-specific routing
	if (hostname.includes('proacente.com')) {
		// ProAcente CRM - redirect to admin login
		if (pathname === '/') {
			const url = request.nextUrl.clone();
			url.pathname = '/admin-login';
			return NextResponse.redirect(url);
		}
		return NextResponse.next();
	}

    // protransfer.com.tr -> Only customer website (Şeref Vural theme)
    if (hostname.includes('protransfer.com.tr')) {
        // Root should serve dedicated protransfer page (keep URL as '/')
        if (pathname === '/') {
            const url = request.nextUrl.clone();
            url.pathname = '/protransfer';
            return NextResponse.rewrite(url);
        }
        // Explicitly block CRM/auth paths on this domain and serve website content
        if (
            pathname === '/admin-login' ||
            pathname === '/login' ||
            pathname.startsWith('/admin')
        ) {
            const url = request.nextUrl.clone();
            url.pathname = '/protransfer';
            return NextResponse.rewrite(url);
        }
        // Allow only website and website API on this domain
        const isAllowed =
            pathname.startsWith('/website') ||
            pathname.startsWith('/api/website');
        if (!isAllowed) {
            const url = request.nextUrl.clone();
            url.pathname = '/protransfer';
            return NextResponse.rewrite(url);
        }
        return NextResponse.next();
    }
	
	// Custom domain handling - for other non-proacente domains, force website module
	if (!hostname.includes('proacente.com') && !hostname.includes('vercel.app')) {
		// Allow only website assets and API; redirect everything else to /website
		const isWebsitePath = pathname === '/' || pathname.startsWith('/website');
		const isWebsiteApi = pathname.startsWith('/api/website');
		if (!isWebsitePath && !isWebsiteApi) {
			const url = request.nextUrl.clone();
			url.pathname = '/website';
			return NextResponse.redirect(url);
		}
	}
	
	// Check if it's a public route
	if (publicRoutes.includes(pathname)) {
		return NextResponse.next();
	}

	// Add tenant context to request headers
	const response = NextResponse.next();
	response.headers.set('x-subdomain', subdomain);
	
	// For now, allow all routes - authentication will be handled client-side
	return response;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
};
