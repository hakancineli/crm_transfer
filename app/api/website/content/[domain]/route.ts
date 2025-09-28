import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const domain = params.domain;

    // Find tenant by subdomain
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { subdomain: domain },
          { companyName: { contains: domain, mode: 'insensitive' } }
        ]
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get website content for this specific tenant
    const websiteContent = await prisma.tenantWebsite.findFirst({
      where: { 
        tenantId: tenant.id,
        isActive: true
      },
      include: {
        pages: true,
        sections: true
      }
    });

    return NextResponse.json(websiteContent || {});
  } catch (error) {
    console.error('Error fetching website content by domain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch website content' },
      { status: 500 }
    );
  }
}
