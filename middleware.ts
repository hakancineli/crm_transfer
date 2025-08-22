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
	// Geçici olarak Basic Auth'u kapat
	return NextResponse.next();
}

export const config = {
	matcher: ['/(.*)'],
};
