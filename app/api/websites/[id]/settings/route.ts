import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET /api/websites/[id]/settings - Get website settings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const website = await prisma.tenantWebsite.findFirst({
      where: {
        id: params.id,
        tenantId: decoded.tenantId,
      },
      include: {
        settings: true
      }
    });

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json(website.settings);
  } catch (error) {
    console.error('Error fetching website settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/websites/[id]/settings - Update website settings
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      companyName,
      logo,
      heroTitle,
      heroSubtitle,
      heroImage,
      contactInfo,
      socialMedia,
      seoSettings,
      colorScheme,
      customCSS,
      analyticsCode
    } = body;

    // Verify website belongs to tenant
    const website = await prisma.tenantWebsite.findFirst({
      where: {
        id: params.id,
        tenantId: decoded.tenantId,
      }
    });

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    const settings = await prisma.websiteSettings.upsert({
      where: { websiteId: params.id },
      update: {
        companyName,
        logo,
        heroTitle,
        heroSubtitle,
        heroImage,
        contactInfo,
        socialMedia,
        seoSettings,
        colorScheme,
        customCSS,
        analyticsCode,
        updatedAt: new Date()
      },
      create: {
        websiteId: params.id,
        companyName: companyName || 'My Company',
        logo,
        heroTitle: heroTitle || 'Welcome to Our Services',
        heroSubtitle: heroSubtitle || 'Professional travel and transfer services',
        heroImage,
        contactInfo: contactInfo || {
          phone: '',
          email: '',
          address: '',
          whatsapp: ''
        },
        socialMedia: socialMedia || {
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: ''
        },
        seoSettings: seoSettings || {
          title: 'Professional Travel Services',
          description: 'Book your transfer and travel services with us',
          keywords: 'transfer, travel, booking',
          ogImage: ''
        },
        colorScheme: colorScheme || {
          primary: '#16a34a',
          secondary: '#6b7280',
          accent: '#dcfce7'
        },
        customCSS,
        analyticsCode
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating website settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
