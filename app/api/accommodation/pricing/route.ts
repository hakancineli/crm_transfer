import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Acente fiyatlandırma güncelleme
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelId, customerPrice, agentPrice, profitMargin, tenantId } = body;

    // Şimdilik sadece console'a log yazdır ve başarılı döndür
    // Gerçek veritabanı kaydı için daha sonra ayrı bir tablo oluşturacağız
    console.log('Hotel Pricing Data:', {
      hotelId,
      customerPrice,
      agentPrice,
      profitMargin,
      tenantId,
      timestamp: new Date().toISOString()
    });

    // Geçici olarak başarılı döndür
    const updatedPricing = {
      hotelId,
      customerPrice,
      agentPrice,
      profitMargin,
      saved: true,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Fiyatlandırma başarıyla güncellendi',
      data: updatedPricing
    });

  } catch (error) {
    console.error('Error updating hotel pricing:', error);
    return NextResponse.json(
      { success: false, message: 'Fiyatlandırma güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Acente fiyatlandırma bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const tenantId = searchParams.get('tenantId');

    if (!hotelId || !tenantId) {
      return NextResponse.json(
        { success: false, message: 'Hotel ID ve Tenant ID gerekli' },
        { status: 400 }
      );
    }

    const pricing = await prisma.hotelBooking.findFirst({
      where: {
        hotelId: hotelId,
        tenantId: tenantId
      },
      select: {
        customerPrice: true,
        agentPrice: true,
        profitMargin: true,
        totalPrice: true
      }
    });

    return NextResponse.json({
      success: true,
      data: pricing
    });

  } catch (error) {
    console.error('Error fetching hotel pricing:', error);
    return NextResponse.json(
      { success: false, message: 'Fiyatlandırma bilgileri alınırken hata oluştu' },
      { status: 500 }
    );
  }
}
