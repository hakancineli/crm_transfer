import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
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
        websites: {
          include: {
            settings: true,
            pages: true
          }
        },
        modules: {
          where: { moduleId: 'WEBSITE', isEnabled: true }
        }
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (tenant.modules.length === 0) {
      return NextResponse.json({ error: 'Website module not active' }, { status: 403 });
    }

    const website = tenant.websites[0];
    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.companyName,
        domain: tenant.domain
      },
      settings: website.settings,
      pages: website.pages
    });

  } catch (error) {
    console.error('Website data fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch website data' 
    }, { status: 500 });
  }
}
