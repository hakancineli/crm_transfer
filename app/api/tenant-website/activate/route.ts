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
        tenantId_module: {
          tenantId: tenantId,
          module: 'WEBSITE'
        }
      },
      update: {
        isActive: true
      },
      create: {
        tenantId: tenantId,
        module: 'WEBSITE',
        isActive: true
      }
    });

    // Create default website settings
    const defaultSettings = {
      logo: '/seref-vural-images/logo.svg',
      primaryColor: '#16a34a',
      secondaryColor: '#059669',
      phone: '+90 212 555 0123',
      whatsapp: '+90 212 555 0123',
      email: 'info@serefvural.com',
      facebook: 'https://facebook.com/serefvural',
      instagram: 'https://instagram.com/serefvural',
      twitter: 'https://twitter.com/serefvural',
      heroTitle: {
        tr: 'Şeref Vural Turizm',
        en: 'Seref Vural Tourism',
        ar: 'شرف فورال للسياحة'
      },
      heroSubtitle: {
        tr: 'İstanbul\'un en güvenilir transfer hizmeti',
        en: 'Istanbul\'s most reliable transfer service',
        ar: 'خدمة النقل الأكثر موثوقية في اسطنبول'
      },
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
    };

    await prisma.tenantWebsiteSettings.upsert({
      where: { tenantId },
      update: defaultSettings,
      create: {
        tenantId,
        ...defaultSettings
      }
    });

    // Create default pages
    const pages = [
      {
        slug: 'home',
        title: { tr: 'Ana Sayfa', en: 'Home', ar: 'الرئيسية' },
        content: { tr: 'Ana sayfa içeriği', en: 'Home page content', ar: 'محتوى الصفحة الرئيسية' }
      },
      {
        slug: 'about',
        title: { tr: 'Hakkımızda', en: 'About Us', ar: 'من نحن' },
        content: { tr: 'Hakkımızda içeriği', en: 'About us content', ar: 'محتوى من نحن' }
      },
      {
        slug: 'services',
        title: { tr: 'Hizmetler', en: 'Services', ar: 'الخدمات' },
        content: { tr: 'Hizmetler içeriği', en: 'Services content', ar: 'محتوى الخدمات' }
      },
      {
        slug: 'contact',
        title: { tr: 'İletişim', en: 'Contact', ar: 'اتصل بنا' },
        content: { tr: 'İletişim bilgileri', en: 'Contact information', ar: 'معلومات الاتصال' }
      }
    ];

    for (const page of pages) {
      await prisma.websitePage.upsert({
        where: {
          tenantId_slug: {
            tenantId,
            slug: page.slug
          }
        },
        update: page,
        create: {
          tenantId,
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
