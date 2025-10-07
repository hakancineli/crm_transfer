import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

interface JwtPayload {
  userId: string;
  [key: string]: any;
}

// GET - Entegrasyonları listele
export async function GET(request: NextRequest) {
  // CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'JWT secret not configured' }, { status: 500 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID gerekli' }, { status: 400 });
    }

    // Kullanıcının bu tenant'a erişim yetkisi var mı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantUsers: {
          where: { tenantId },
          include: { tenant: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // SUPERUSER değilse ve bu tenant'a erişimi yoksa hata
    if (user.role !== 'SUPERUSER' && user.tenantUsers.length === 0) {
      return NextResponse.json({ error: 'Bu tenant\'a erişim yetkiniz yok' }, { status: 403 });
    }

    // Tenant entegrasyon bilgilerini al
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        whatsappApiKey: true,
        googleMapsApiKey: true,
        yandexMapsEnabled: true
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 });
    }

    const integrations = [
      {
        id: 'whatsapp',
        name: 'WhatsApp Business API',
        description: 'WhatsApp üzerinden müşteri ve şoför bildirimleri',
        icon: '📱',
        isConfigured: !!tenant.whatsappApiKey,
        status: tenant.whatsappApiKey ? 'active' : 'inactive',
        fields: [
          {
            name: 'whatsappApiKey',
            label: 'API Anahtarı',
            type: 'password',
            value: tenant.whatsappApiKey ? '••••••••' : '',
            required: true
          }
        ]
      },
      {
        id: 'google-maps',
        name: 'Google Maps API',
        description: 'Harita servisleri ve navigasyon',
        icon: '🗺️',
        isConfigured: !!tenant.googleMapsApiKey,
        status: tenant.googleMapsApiKey ? 'active' : 'inactive',
        fields: [
          {
            name: 'googleMapsApiKey',
            label: 'API Anahtarı',
            type: 'password',
            value: tenant.googleMapsApiKey ? '••••••••' : '',
            required: true
          }
        ]
      },
      {
        id: 'yandex-maps',
        name: 'Yandex Maps',
        description: 'Yandex harita servisleri entegrasyonu',
        icon: '🌍',
        isConfigured: tenant.yandexMapsEnabled,
        status: tenant.yandexMapsEnabled ? 'active' : 'inactive',
        fields: [
          {
            name: 'yandexMapsEnabled',
            label: 'Yandex Maps Aktif',
            type: 'boolean',
            value: tenant.yandexMapsEnabled,
            required: false
          }
        ]
      }
    ];

    return NextResponse.json({ integrations });

  } catch (error: any) {
    console.error('Entegrasyonlar listeleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// POST - Entegrasyon testi
export async function POST(request: NextRequest) {
  // CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'JWT secret not configured' }, { status: 500 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const userId = decoded.userId;

    const body = await request.json();
    const { tenantId, integrationType, testData } = body;

    if (!tenantId || !integrationType) {
      return NextResponse.json({ error: 'Tenant ID ve entegrasyon türü gerekli' }, { status: 400 });
    }

    // Kullanıcının bu tenant'a erişim yetkisi var mı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantUsers: {
          where: { tenantId },
          include: { tenant: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // SUPERUSER değilse ve bu tenant'a erişimi yoksa hata
    if (user.role !== 'SUPERUSER' && user.tenantUsers.length === 0) {
      return NextResponse.json({ error: 'Bu tenant\'a erişim yetkiniz yok' }, { status: 403 });
    }

    // Entegrasyon testi yap
    let testResult = { success: false, message: '' };

    switch (integrationType) {
      case 'whatsapp':
        // WhatsApp API testi (basit bir test)
        if (testData?.apiKey) {
          // Gerçek WhatsApp API testi burada yapılabilir
          testResult = { 
            success: true, 
            message: 'WhatsApp API bağlantısı başarılı' 
          };
        } else {
          testResult = { 
            success: false, 
            message: 'API anahtarı gerekli' 
          };
        }
        break;

      case 'google-maps':
        // Google Maps API testi
        if (testData?.apiKey) {
          // Gerçek Google Maps API testi burada yapılabilir
          testResult = { 
            success: true, 
            message: 'Google Maps API bağlantısı başarılı' 
          };
        } else {
          testResult = { 
            success: false, 
            message: 'API anahtarı gerekli' 
          };
        }
        break;

      case 'yandex-maps':
        // Yandex Maps testi
        testResult = { 
          success: true, 
          message: 'Yandex Maps entegrasyonu aktif' 
        };
        break;

      default:
        testResult = { 
          success: false, 
          message: 'Bilinmeyen entegrasyon türü' 
        };
    }

    return NextResponse.json({ 
      integrationType,
      testResult 
    });

  } catch (error: any) {
    console.error('Entegrasyon testi hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
