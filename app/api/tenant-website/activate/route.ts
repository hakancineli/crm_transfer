import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { tenantId } = await request.json();

    // Activate website module for tenant
    await prisma.tenantModule.upsert({
      where: {
        tenantId_moduleId: {
          tenantId: tenantId,
          moduleId: 'WEBSITE'
        }
      },
      update: {
        isEnabled: true
      },
      create: {
        tenantId: tenantId,
        moduleId: 'WEBSITE',
        isEnabled: true
      }
    });

    // Create default website settings
    let website = await prisma.tenantWebsite.findFirst({
      where: { tenantId }
    });

    if (!website) {
      website = await prisma.tenantWebsite.create({
        data: {
          tenantId,
          isActive: true,
          theme: 'seref-vural'
        }
      });
    } else {
      website = await prisma.tenantWebsite.update({
        where: { id: website.id },
        data: {
          isActive: true,
          theme: 'seref-vural'
        }
      });
    }

    const defaultSettings = {
      companyName: 'Şeref Vural Turizm',
      logo: '/seref-vural-images/logo.svg',
      heroTitle: 'Şeref Vural Turizm',
      heroSubtitle: 'İstanbul\'un en güvenilir transfer hizmeti',
      heroImage: '/seref-vural-images/hero.jpg',
      contactInfo: {
        phone: '+90 212 555 0123',
        whatsapp: '+90 212 555 0123',
        email: 'info@serefvural.com'
      },
      socialMedia: {
        facebook: 'https://facebook.com/serefvural',
        instagram: 'https://instagram.com/serefvural',
        twitter: 'https://twitter.com/serefvural'
      },
      seoSettings: {
        metaTitle: {
          tr: 'Şeref Vural Turizm - İstanbul Transfer',
          en: 'Seref Vural Tourism - Istanbul Transfer',
          ar: 'شرف فورال للسياحة - نقل اسطنبول'
        },
        metaDescription: {
          tr: 'İstanbul Havalimanı ve Sabiha Gökçen transfer hizmeti. VIP araçlar, profesyonel şoförler.',
          en: 'Istanbul Airport and Sabiha Gokcen transfer service. VIP vehicles, professional drivers.',
          ar: 'خدمة نقل مطار اسطنبول وصابحة جوكجن. مركبات VIP، سائقون محترفون.'
        }
      },
      colorScheme: {
        primary: '#16a34a',
        secondary: '#059669'
      }
    };

    await prisma.websiteSettings.upsert({
      where: { websiteId: website.id },
      update: defaultSettings,
      create: {
        websiteId: website.id,
        ...defaultSettings
      }
    });

    // Create default pages
    const pages = [
      {
        slug: 'home',
        title: 'Ana Sayfa',
        content: { tr: 'Ana sayfa içeriği', en: 'Home page content', ar: 'محتوى الصفحة الرئيسية' },
        isPublished: true,
        isHomepage: true
      },
      {
        slug: 'about',
        title: 'Hakkımızda',
        content: { tr: 'Hakkımızda içeriği', en: 'About us content', ar: 'محتوى من نحن' },
        isPublished: true
      },
      {
        slug: 'services',
        title: 'Hizmetler',
        content: { tr: 'Hizmetler içeriği', en: 'Services content', ar: 'محتوى الخدمات' },
        isPublished: true
      },
      {
        slug: 'contact',
        title: 'İletişim',
        content: { tr: 'İletişim bilgileri', en: 'Contact information', ar: 'معلومات الاتصال' },
        isPublished: true
      }
    ];

    for (const page of pages) {
      await prisma.websitePage.upsert({
        where: {
          websiteId_slug: {
            websiteId: website.id,
            slug: page.slug
          }
        },
        update: page,
        create: {
          websiteId: website.id,
          ...page
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Website module activated successfully' 
    });

  } catch (error) {
    console.error('Website activation error:', error);
    return NextResponse.json({ 
      error: 'Failed to activate website module' 
    }, { status: 500 });
  }
}
