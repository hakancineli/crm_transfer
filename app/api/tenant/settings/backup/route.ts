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

// GET - Tenant ayarlarını yedekle
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

    // Tenant ayarlarını al
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 });
    }

    // Yedekleme dosyası oluştur
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      tenant: {
        id: tenant.id,
        companyName: tenant.companyName,
        subdomain: tenant.subdomain,
        domain: tenant.domain,
        // Genel Bilgiler
        taxNumber: tenant.taxNumber,
        address: tenant.address,
        phone: tenant.phone,
        email: tenant.email,
        website: tenant.website,
        logoUrl: tenant.logoUrl,
        workingHours: tenant.workingHours,
        holidayDays: tenant.holidayDays,
        // Marka & Tasarım
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        fontFamily: tenant.fontFamily,
        voucherBackgroundUrl: tenant.voucherBackgroundUrl,
        // Sistem Ayarları
        defaultLanguage: tenant.defaultLanguage,
        defaultCurrency: tenant.defaultCurrency,
        timezone: tenant.timezone,
        dateFormat: tenant.dateFormat,
        temperatureUnit: tenant.temperatureUnit,
        // Entegrasyonlar
        whatsappApiKey: tenant.whatsappApiKey,
        googleMapsApiKey: tenant.googleMapsApiKey,
        yandexMapsEnabled: tenant.yandexMapsEnabled,
        // Kullanıcı Yönetimi
        maxUsers: tenant.maxUsers,
        maxConcurrentSessions: tenant.maxConcurrentSessions,
        passwordMinLength: tenant.passwordMinLength,
        passwordExpiryDays: tenant.passwordExpiryDays,
        // Raporlama & Analitik
        dataRetentionDays: tenant.dataRetentionDays,
        autoArchiveEnabled: tenant.autoArchiveEnabled,
        reportLogoEnabled: tenant.reportLogoEnabled,
        // Güvenlik
        apiKeyExpiryDays: tenant.apiKeyExpiryDays,
        auditLogRetentionDays: tenant.auditLogRetentionDays,
        dataEncryptionLevel: tenant.dataEncryptionLevel
      }
    };

    // JSON dosyası olarak döndür
    const response = new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="tenant-settings-${tenant.companyName}-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

    return response;

  } catch (error: any) {
    console.error('Tenant ayarları yedekleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// POST - Tenant ayarlarını geri yükle
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
    const { tenantId, backupData } = body;

    if (!tenantId || !backupData) {
      return NextResponse.json({ error: 'Tenant ID ve yedekleme verisi gerekli' }, { status: 400 });
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

    // Yedekleme verisini doğrula
    if (!backupData.tenant || backupData.version !== '1.0') {
      return NextResponse.json({ error: 'Geçersiz yedekleme dosyası' }, { status: 400 });
    }

    // Tenant'ı güncelle
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        // Genel Bilgiler
        taxNumber: backupData.tenant.taxNumber,
        address: backupData.tenant.address,
        phone: backupData.tenant.phone,
        email: backupData.tenant.email,
        website: backupData.tenant.website,
        logoUrl: backupData.tenant.logoUrl,
        workingHours: backupData.tenant.workingHours,
        holidayDays: backupData.tenant.holidayDays,
        // Marka & Tasarım
        primaryColor: backupData.tenant.primaryColor,
        secondaryColor: backupData.tenant.secondaryColor,
        fontFamily: backupData.tenant.fontFamily,
        voucherBackgroundUrl: backupData.tenant.voucherBackgroundUrl,
        // Sistem Ayarları
        defaultLanguage: backupData.tenant.defaultLanguage,
        defaultCurrency: backupData.tenant.defaultCurrency,
        timezone: backupData.tenant.timezone,
        dateFormat: backupData.tenant.dateFormat,
        temperatureUnit: backupData.tenant.temperatureUnit,
        // Entegrasyonlar
        whatsappApiKey: backupData.tenant.whatsappApiKey,
        googleMapsApiKey: backupData.tenant.googleMapsApiKey,
        yandexMapsEnabled: backupData.tenant.yandexMapsEnabled,
        // Kullanıcı Yönetimi
        maxUsers: backupData.tenant.maxUsers,
        maxConcurrentSessions: backupData.tenant.maxConcurrentSessions,
        passwordMinLength: backupData.tenant.passwordMinLength,
        passwordExpiryDays: backupData.tenant.passwordExpiryDays,
        // Raporlama & Analitik
        dataRetentionDays: backupData.tenant.dataRetentionDays,
        autoArchiveEnabled: backupData.tenant.autoArchiveEnabled,
        reportLogoEnabled: backupData.tenant.reportLogoEnabled,
        // Güvenlik
        apiKeyExpiryDays: backupData.tenant.apiKeyExpiryDays,
        auditLogRetentionDays: backupData.tenant.auditLogRetentionDays,
        dataEncryptionLevel: backupData.tenant.dataEncryptionLevel,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Ayarlar başarıyla geri yüklendi',
      tenant: updatedTenant 
    });

  } catch (error: any) {
    console.error('Tenant ayarları geri yükleme hatası:', error);
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
