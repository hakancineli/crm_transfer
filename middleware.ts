import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Public routes that don't need authentication
	const publicRoutes = ['/login', '/admin-login', '/', '/customer-reservation', '/customer-panel', '/reservation-lookup'];
	
	// Check if it's a public route
	if (publicRoutes.includes(pathname)) {
		return NextResponse.next();
	}

	// Admin routes that need authentication
	const isAdminRoute = pathname.startsWith('/admin') || 
		pathname.startsWith('/reservations') || 
		pathname.startsWith('/reports') || 
		pathname.startsWith('/drivers') ||
		pathname.startsWith('/new-reservation');

	if (isAdminRoute) {
		// Check for JWT token in localStorage (we'll handle this client-side)
		// For now, redirect to login
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
};
