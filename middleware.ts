import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
	
	// Custom domain handling - check if hostname belongs to a tenant
	let tenantId = null;
	try {
		const tenant = await prisma.tenant.findFirst({
			where: {
				OR: [
					{ domain: hostname },
					{ domain: `www.${hostname}` }
				]
			},
			select: { id: true }
		});
		
		if (tenant) {
			tenantId = tenant.id;
		}
	} catch (error) {
		console.error('Tenant lookup error:', error);
	}
	
	// If custom domain found, redirect to website
	if (tenantId && pathname === '/') {
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
	if (tenantId) {
		response.headers.set('x-tenant-id', tenantId);
	}
	
	// For now, allow all routes - authentication will be handled client-side
	return response;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
};
