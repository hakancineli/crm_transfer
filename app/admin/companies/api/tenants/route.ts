import { NextRequest, NextResponse } from 'next/server';

// Legacy path proxy: /admin/companies/api/tenants -> /api/tenants
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  url.pathname = '/api/tenants';
  const res = await fetch(url.toString(), {
    headers: request.headers,
    cache: 'no-store'
  });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: res.headers });
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  url.pathname = '/api/tenants';
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: request.headers,
    body: await request.text(),
    cache: 'no-store'
  });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: res.headers });
}


