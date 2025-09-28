import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET /api/websites - Get all websites for current tenant
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if website module is enabled for tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: decoded.tenantId },
      select: { websiteModuleEnabled: true }
    });

    if (!tenant?.websiteModuleEnabled) {
      return NextResponse.json({ error: 'Website module is not enabled for this tenant' }, { status: 403 });
    }

    const websites = await prisma.tenantWebsite.findMany({
      where: {
        tenantId: decoded.tenantId,
      },
      include: {
        settings: true,
        pages: {
          where: { isPublished: true },
          orderBy: { sortOrder: 'asc' }
        },
        sections: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    return NextResponse.json(websites);
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/websites - Create new website for tenant
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if website module is enabled for tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: decoded.tenantId },
      select: { websiteModuleEnabled: true }
    });

    if (!tenant?.websiteModuleEnabled) {
      return NextResponse.json({ error: 'Website module is not enabled for this tenant' }, { status: 403 });
    }

    const body = await request.json();
    const { domain, subdomain, theme = 'default' } = body;

    // Check if domain/subdomain is already taken
    if (domain) {
      const existingDomain = await prisma.tenantWebsite.findUnique({
        where: { domain }
      });
      if (existingDomain) {
        return NextResponse.json({ error: 'Domain already taken' }, { status: 400 });
      }
    }

    if (subdomain) {
      const existingSubdomain = await prisma.tenantWebsite.findUnique({
        where: { subdomain }
      });
      if (existingSubdomain) {
        return NextResponse.json({ error: 'Subdomain already taken' }, { status: 400 });
      }
    }

    const website = await prisma.tenantWebsite.create({
      data: {
        tenantId: decoded.tenantId,
        domain,
        subdomain,
        theme,
        settings: {
          create: {
            companyName: decoded.tenantName || 'My Company',
            heroTitle: 'Welcome to Our Services',
            heroSubtitle: 'Professional travel and transfer services',
            contactInfo: {
              phone: '',
              email: '',
              address: '',
              whatsapp: ''
            },
            socialMedia: {
              facebook: '',
              instagram: '',
              twitter: '',
              linkedin: ''
            },
            seoSettings: {
              title: 'Professional Travel Services',
              description: 'Book your transfer and travel services with us',
              keywords: 'transfer, travel, booking',
              ogImage: ''
            },
            colorScheme: {
              primary: '#16a34a',
              secondary: '#6b7280',
              accent: '#dcfce7'
            }
          }
        },
        pages: {
          create: [
            {
              slug: 'home',
              title: 'Home',
              content: { type: 'homepage', sections: [] },
              isPublished: true,
              isHomepage: true,
              sortOrder: 0
            }
          ]
        },
        sections: {
          create: [
            {
              sectionType: 'hero',
              title: 'Hero Section',
              content: {
                title: 'Welcome to Our Services',
                subtitle: 'Professional travel and transfer services',
                ctaText: 'Book Now',
                ctaLink: '/reservation'
              },
              sortOrder: 0
            },
            {
              sectionType: 'features',
              title: 'Our Features',
              content: {
                features: [
                  { title: '24/7 Service', description: 'Available around the clock' },
                  { title: 'Fixed Price', description: 'No hidden costs' },
                  { title: 'Professional Drivers', description: 'Experienced and reliable' },
                  { title: 'Modern Vehicles', description: 'Comfortable and safe' }
                ]
              },
              sortOrder: 1
            }
          ]
        }
      },
      include: {
        settings: true,
        pages: true,
        sections: true
      }
    });

    return NextResponse.json(website, { status: 201 });
  } catch (error) {
    console.error('Error creating website:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
