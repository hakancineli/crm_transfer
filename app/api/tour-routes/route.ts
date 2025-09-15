import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(request: NextRequest) {
  try {
    // Statik tur rotaları döndür
    const routes = [
      { id: 'istanbul-city', name: 'İstanbul Şehir Turu', duration: 10, price: 150 },
      { id: 'cappadocia', name: 'Kapadokya Turu', duration: 10, price: 300 },
      { id: 'trabzon', name: 'Trabzon Turu', duration: 10, price: 250 },
      { id: 'sapanca', name: 'Sapanca Turu', duration: 10, price: 200 },
      { id: 'abant', name: 'Abant Turu', duration: 10, price: 180 },
      { id: 'bursa', name: 'Bursa Turu', duration: 10, price: 220 },
    ];

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Tur rotaları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Tur rotaları getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Şimdilik statik rotalar kullanıyoruz, POST işlemi desteklenmiyor
    return NextResponse.json(
      { error: 'Tur rotası oluşturma şu anda desteklenmiyor' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Tur rotası oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Tur rotası oluşturulamadı' },
      { status: 500 }
    );
  }
}

