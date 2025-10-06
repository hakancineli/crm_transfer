import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Default website content
const DEFAULT_WEBSITE_CONTENT = {
  companyName: "Şeref Vural Travel",
  tagline: "İstanbul Havalimanı Transfer Hizmeti",
  description: "İstanbul Havalimanı'ndan şehir merkezine konforlu ve güvenli transfer hizmeti. Profesyonel şoförlerimiz ve Mercedes Vito araçlarımızla 7/24 hizmetinizdeyiz. Ayrıca İstanbul, Sapanca, Bursa, Abant turları ve kaliteli otel konaklama seçenekleri sunuyoruz.",
  contact: {
    phone: "+90 531 945 89 31",
    whatsapp: "+90 531 945 89 31",
    email: "info@serefvural.com"
  },
  settings: {
    heroTitle: "İstanbul Havalimanı Transfer Hizmeti",
    heroSubtitle: "İstanbul Havalimanı'ndan şehir merkezine konforlu ve güvenli transfer hizmeti. Profesyonel şoförlerimiz ve Mercedes Vito araçlarımızla 7/24 hizmetinizdeyiz.",
    contactInfo: {
      phone: "+90 531 945 89 31",
      whatsapp: "+90 531 945 89 31",
      email: "info@serefvural.com"
    }
  },
  vehicleImages: [
    '/seref-vural-images/mercedes-vito-1.jpg',
    '/seref-vural-images/mercedes-vito-2.jpg',
    '/seref-vural-images/mercedes-vito-3.jpg',
    '/seref-vural-images/mercedes-vito-4.jpg',
    '/seref-vural-images/mercedes-vito-5.jpg',
    '/seref-vural-images/mercedes-vito-6.jpg',
    '/seref-vural-images/mercedes-vito-7.jpg',
    '/seref-vural-images/mercedes-vito-8.jpg',
    '/seref-vural-images/mercedes-vito-9.jpg',
    '/seref-vural-images/mercedes-vito-10.jpg'
  ],
  services: [
    {
      title: "Havalimanı Transfer",
      description: "İstanbul Havalimanı'ndan şehir merkezine konforlu transfer",
      icon: "✈️"
    },
    {
      title: "Şehir İçi Transfer",
      description: "İstanbul içi tüm noktalara güvenli ulaşım",
      icon: "🚗"
    },
    {
      title: "Günlük Turlar",
      description: "Sapanca, Bursa, Abant turları",
      icon: "🏔️"
    },
    {
      title: "Otel Konaklama",
      description: "Kaliteli otel konaklama seçenekleri",
      icon: "🏨"
    }
  ],
  features: [
    "7/24 Hizmet",
    "Profesyonel Şoförler",
    "Mercedes Vito Araçlar",
    "Güvenli Seyahat",
    "Uygun Fiyatlar",
    "Online Rezervasyon"
  ],
  testimonials: [
    {
      name: "Ahmet Yılmaz",
      text: "Çok memnun kaldık, şoförümüz çok nazikti.",
      rating: 5
    },
    {
      name: "Fatma Demir",
      text: "Araçlar çok temiz ve konforluydu.",
      rating: 5
    },
    {
      name: "Mehmet Kaya",
      text: "Fiyatlar çok uygun, kesinlikle tavsiye ederim.",
      rating: 5
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Get tenant's website content
    const tenantWebsite = await prisma.tenantWebsite.findFirst({
      where: { 
        tenantId,
        isActive: true
      }
    });

    if (!tenantWebsite || !tenantWebsite.content) {
      // Return default content if no custom content exists
      return NextResponse.json({
        content: DEFAULT_WEBSITE_CONTENT,
        isDefault: true
      });
    }

    return NextResponse.json({
      content: JSON.parse(tenantWebsite.content as string),
      isDefault: false
    });
  } catch (error) {
    console.error('Error fetching website content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch website content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, content } = body;

    if (!tenantId || !content) {
      return NextResponse.json(
        { error: 'Tenant ID and content are required' },
        { status: 400 }
      );
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Check if TenantWebsite already exists
    let tenantWebsite = await prisma.tenantWebsite.findFirst({
      where: { tenantId }
    });

    if (tenantWebsite) {
      // Update existing content
      tenantWebsite = await prisma.tenantWebsite.update({
        where: { id: tenantWebsite.id },
        data: {
          content: JSON.stringify(content),
          updatedAt: new Date()
        }
      });
    } else {
      // Create new TenantWebsite
      tenantWebsite = await prisma.tenantWebsite.create({
        data: {
          tenantId,
          content: JSON.stringify(content),
          isActive: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      tenantWebsite
    });
  } catch (error) {
    console.error('Error saving website content:', error);
    return NextResponse.json(
      { error: 'Failed to save website content' },
      { status: 500 }
    );
  }
}