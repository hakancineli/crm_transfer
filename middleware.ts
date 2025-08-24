import { NextRequest, NextResponse } from 'next/server';

function parseBasicAuth(header: string | null): { username: string; password: string } | null {
	if (!header || !header.startsWith('Basic ')) return null;
	try {
		const base64 = header.replace('Basic ', '');
		// Use Web API atob in the Edge runtime
		const decoded = atob(base64);
		const [username, password] = decoded.split(':');
		if (!username || !password) return null;
		return { username, password };
	} catch {
		return null;
	}
}

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Allow framework internals and assets without auth
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/public')
	) {
		return NextResponse.next();
	}

	// Müşteri sayfalarına şifresiz erişim
	const customerPaths = [
		'/customer-reservation',
		'/customer-panel',
		'/customer-reservation/thank-you'
	];

	if (customerPaths.some(path => pathname.startsWith(path))) {
		return NextResponse.next();
	}

	// Admin sayfaları için Basic Auth gerekli
	const expected = process.env.BASIC_AUTH || '';
	const [expectedUser, expectedPass] = expected.split(':');
	if (!expectedUser || !expectedPass) {
		// If BASIC_AUTH is missing, still require auth to be safe (use a dummy realm)
		const res = new NextResponse('Authentication required', { status: 401 });
		res.headers.set('WWW-Authenticate', 'Basic realm="Protected"');
		return res;
	}

	const creds = parseBasicAuth(req.headers.get('authorization'));
	if (creds && creds.username === expectedUser && creds.password === expectedPass) {
		return NextResponse.next();
	}

	const res = new NextResponse('Authentication required', { status: 401 });
	res.headers.set('WWW-Authenticate', 'Basic realm="Protected"');
	return res;
}

export const config = {
	matcher: ['/(.*)'],
};
