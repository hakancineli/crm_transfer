import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const hostname = request.headers.get('host') || '';
	
	// Extract subdomain
	const subdomain = hostname.split('.')[0];
	
	// Public routes that don't need authentication
	const publicRoutes = ['/login', '/admin-login', '/', '/customer-reservation', '/customer-panel', '/reservation-lookup'];

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
	
	// Custom domain handling - redirect to website for non-proacente domains
	if (!hostname.includes('proacente.com') && !hostname.includes('vercel.app') && pathname === '/') {
		const url = request.nextUrl.clone();
		url.pathname = '/website';
		return NextResponse.redirect(url);
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
