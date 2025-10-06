import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const rawDomain = params.domain || '';
    const normalized = rawDomain.replace(/^www\./i, '').toLowerCase();

    // Resolve tenant by TenantWebsite domain mapping first (authoritative)
    const tenantWebsite = await prisma.tenantWebsite.findFirst({
      where: {
        isActive: true,
        OR: [
          { domain: normalized },
          { domain: `www.${normalized}` }
        ]
      },
      include: {
        tenant: true,
        pages: true,
        sections: true
      }
    });

    // Fallback: try to find by tenant subdomain/company name if no TenantWebsite found
    const tenant = tenantWebsite?.tenant || await prisma.tenant.findFirst({
      where: {
        OR: [
          { subdomain: normalized },
          { companyName: { contains: normalized, mode: 'insensitive' } }
        ]
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get website content for this specific tenant
    const websiteContent = tenantWebsite || await prisma.tenantWebsite.findFirst({
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
