import { NextRequest, NextResponse } from 'next/server';

function parseBasicAuth(header: string | null): { username: string; password: string } | null {
	if (!header || !header.startsWith('Basic ')) return null;
	try {
		const base64 = header.replace('Basic ', '');
		const decoded = Buffer.from(base64, 'base64').toString('utf8');
		const [username, password] = decoded.split(':');
		if (!username || !password) return null;
		return { username, password };
	} catch {
		return null;
	}
}

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Allow Next.js internals and common public assets
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/public') ||
		pathname === '/api/health'
	) {
		return NextResponse.next();
	}

	const expected = process.env.BASIC_AUTH || '';
	const [expectedUser, expectedPass] = expected.split(':');
	if (!expectedUser || !expectedPass) {
		// If not configured, allow through (to avoid lockout during setup)
		return NextResponse.next();
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
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
