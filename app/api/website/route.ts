import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const hostname = request.headers.get('host') || '';
    
    // Find tenant by domain
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { domain: hostname },
          { domain: `www.${hostname}` }
        ]
      },
      include: {
        websiteSettings: true,
        modules: {
          where: { module: 'WEBSITE', isActive: true }
        }
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (tenant.modules.length === 0) {
      return NextResponse.json({ error: 'Website module not active' }, { status: 403 });
    }

    // Get pages for this tenant
    const pages = await prisma.websitePage.findMany({
      where: { tenantId: tenant.id }
    });

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain
      },
      settings: tenant.websiteSettings,
      pages
    });

  } catch (error) {
    console.error('Website data fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch website data' 
    }, { status: 500 });
  }
}
