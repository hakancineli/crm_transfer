import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Default website content - Full demo content
const DEFAULT_WEBSITE_CONTENT = {
  companyName: "Pro Transfer",
  tagline: "İstanbul Havalimanı Transfer Hizmeti",
  description: "İstanbul Havalimanı'ndan şehir merkezine konforlu ve güvenli transfer hizmeti. Profesyonel şoförlerimiz ve Mercedes Vito araçlarımızla 7/24 hizmetinizdeyiz. Ayrıca İstanbul, Sapanca, Bursa, Abant turları ve kaliteli otel konaklama seçenekleri sunuyoruz.",
  contact: {
    phone: "+905545812034",
    whatsapp: "+905545812034",
    email: "info@protransfer.com"
  },
  settings: {
    heroTitle: "Pro Transfer - İstanbul Havalimanı Transfer Hizmeti",
    heroSubtitle: "İstanbul Havalimanı'ndan şehir merkezine konforlu ve güvenli transfer hizmeti. Profesyonel şoförlerimiz ve Mercedes Vito araçlarımızla 7/24 hizmetinizdeyiz. Ayrıca İstanbul, Sapanca, Bursa, Abant turları ve kaliteli otel konaklama seçenekleri sunuyoruz.",
    contactInfo: {
      phone: "+905545812034",
      whatsapp: "+905545812034",
      email: "info@protransfer.com"
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
  vehicles: [
    {
      id: 1,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-1.jpg"
    },
    {
      id: 2,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-2.jpg"
    },
    {
      id: 3,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-3.jpg"
    },
    {
      id: 4,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-4.jpg"
    },
    {
      id: 5,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-5.jpg"
    },
    {
      id: 6,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-6.jpg"
    },
    {
      id: 7,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-7.jpg"
    },
    {
      id: 8,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-8.jpg"
    },
    {
      id: 9,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-9.jpg"
    },
    {
      id: 10,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-10.jpg"
    }
  ],
  tours: [
    {
      id: 1,
      name: "İstanbul Tarihi Yarımada Turu",
      description: "İstanbul'un en önemli tarihi mekanlarını keşfedin. Ayasofya, Sultanahmet Camii, Topkapı Sarayı ve daha fazlası.",
      duration: "8 saat",
      capacity: "7 kişilik kapasite",
      rating: 4.8,
      image: "/seref-vural-tours/istanbul/1-1.jpeg",
      prices: {
        TRY: 4500,
        USD: 150,
        EUR: 140
      },
      showPrice: true
    },
    {
      id: 2,
      name: "Sapanca Doğa Turu",
      description: "Sapanca Gölü çevresinde doğa yürüyüşü ve piknik. Temiz hava ve muhteşem manzara.",
      duration: "6 saat",
      capacity: "7 kişilik kapasite",
      rating: 4.6,
      image: "/seref-vural-tours/sapanca/1-1.jpeg",
      prices: {
        TRY: 3600,
        USD: 120,
        EUR: 110
      },
      showPrice: true
    },
    {
      id: 3,
      name: "Bursa Tarihi ve Kültürel Tur",
      description: "Osmanlı İmparatorluğu'nun ilk başkenti Bursa'yı keşfedin. Ulu Camii, Yeşil Türbe ve daha fazlası.",
      duration: "10 saat",
      capacity: "7 kişilik kapasite",
      rating: 4.7,
      image: "/seref-vural-tours/bursa/1-1.jpeg",
      prices: {
        TRY: 5400,
        USD: 180,
        EUR: 165
      },
      showPrice: true
    },
    {
      id: 4,
      name: "Abant Gölü Doğa Turu",
      description: "Abant Gölü'nde doğa yürüyüşü ve fotoğraf çekimi. Muhteşem doğa manzaraları.",
      duration: "7 saat",
      capacity: "7 kişilik kapasite",
      rating: 4.5,
      image: "/seref-vural-tours/abant/1-1.jpeg",
      prices: {
        TRY: 4200,
        USD: 140,
        EUR: 130
      },
      showPrice: true
    }
  ],
  hotels: [
    {
      id: 1,
      name: "Grand Hotel İstanbul",
      location: "Sultanahmet, İstanbul",
      description: "Sultanahmet'te lüks konaklama. Tarihi yarımadaya yürüme mesafesi.",
      rating: 4.9,
      features: ["WiFi", "Klima", "Oda Servisi", "Spa", "Fitness"],
      image: "/seref-vural-images/hotels/sultanahmet-palace.svg",
      prices: {
        TRY: 6000,
        USD: 200,
        EUR: 185
      },
      showPrice: true
    },
    {
      id: 2,
      name: "Sapanca Resort Hotel",
      location: "Sapanca, Sakarya",
      description: "Sapanca Gölü manzaralı doğa oteli. Huzurlu ve sakin bir tatil.",
      rating: 4.6,
      features: ["WiFi", "Klima", "Havuz", "Restoran", "Park Alanı"],
      image: "/seref-vural-images/hotels/modern-istanbul.svg",
      prices: {
        TRY: 4500,
        USD: 150,
        EUR: 140
      },
      showPrice: true
    }
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
    {
      id: 1,
      title: "7/24 Hizmet",
      description: "Her zaman yanınızdayız",
      icon: "clock"
    },
    {
      id: 2,
      title: "Sabit Fiyat",
      description: "Sürpriz yok",
      icon: "dollar"
    },
    {
      id: 3,
      title: "Profesyonel Şoför",
      description: "Deneyimli kadro",
      icon: "user"
    },
    {
      id: 4,
      title: "7 Kişilik Kapasite",
      description: "Mercedes Vito",
      icon: "users"
    }
  ],
  testimonials: [
    {
      name: "Ahmet Y.",
      text: "Çok profesyonel hizmet. Şoförümüz çok nazikti ve zamanında geldi. Kesinlikle tavsiye ederim.",
      rating: 5,
      type: "Transfer"
    },
    {
      name: "Fatma K.",
      text: "Uçuşum gecikmişti ama şoförümüz sabırla bekledi. Araç çok temiz ve konforluydu.",
      rating: 5,
      type: "Transfer"
    },
    {
      name: "Mehmet S.",
      text: "İstanbul Havalimanı'ndan şehir merkezine çok rahat bir yolculuk yaptık. Teşekkürler Pro Transfer.",
      rating: 5,
      type: "Transfer"
    }
  ],
  faq: [
    {
      question: "Rezervasyon nasıl yapılır?",
      answer: "Rezervasyon yapmak için 'Rezervasyon Talebi Gönder' butonuna tıklayın veya WhatsApp'tan bizimle iletişime geçin."
    },
    {
      question: "Fiyatlar sabit mi?",
      answer: "Evet, fiyatlarımız tamamen sabittir. Konumları girdiğiniz anda ücretinizi anında görürsünüz."
    },
    {
      question: "Uçuş gecikmesi durumunda ne olur?",
      answer: "Uçuşunuzu takip ederiz ve gecikme durumunda ek ücret almadan bekleriz."
    },
    {
      question: "Bagaj limiti var mı?",
      answer: "Mercedes Vito araçlarımız geniş bagaj kapasitesine sahiptir. Normal seyahat bagajları için limit yoktur."
    },
    {
      question: "Bebek koltuğu mevcut mu?",
      answer: "Evet, bebek koltuğu hizmetimiz mevcuttur. Rezervasyon yaparken bu talebinizi belirtmeniz yeterlidir."
    }
  ],
  stats: {
    happyCustomers: "500+",
    serviceHours: "7/24",
    rating: "4.9/5"
  }
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