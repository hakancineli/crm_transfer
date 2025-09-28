import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingApiReal } from '@/app/lib/bookingApiReal';


// Fiyat havuzundaki otelleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const checkin = searchParams.get('checkin');
    const checkout = searchParams.get('checkout');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');
    const rooms = searchParams.get('rooms');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const stars = searchParams.get('stars');

    // Filtreleme koşulları
    const where: any = {
      tenantId: 'demo', // Geçici olarak demo tenant
      isActive: true
    };

    if (city) {
      where.hotelCity = { contains: city, mode: 'insensitive' };
    }

    if (checkin && checkout) {
      where.validFrom = { lte: new Date(checkin) };
      where.validTo = { gte: new Date(checkout) };
    }

    if (minPrice) {
      where.customerPrice = { gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.customerPrice = { ...where.customerPrice, lte: parseFloat(maxPrice) };
    }

    if (stars) {
      where.hotelStars = { gte: parseInt(stars) };
    }

    // Fiyat havuzundaki otelleri getir
    const pricePool = await prisma.hotelPricePool.findMany({
      where,
      orderBy: {
        customerPrice: 'asc'
      }
    });

    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      pricePool: pricePool.map((item: any) => ({
        id: item.id,
        hotelId: item.hotelId,
        hotelName: item.hotelName,
        hotelAddress: item.hotelAddress,
        hotelCity: item.hotelCity,
        hotelCountry: item.hotelCountry,
        hotelRating: item.hotelRating,
        hotelStars: item.hotelStars,
        hotelImage: item.hotelImage,
        hotelAmenities: item.hotelAmenities,
        roomType: item.roomType,
        roomName: item.roomName,
        roomDescription: item.roomDescription,
        roomAmenities: item.roomAmenities,
        maxOccupancy: item.maxOccupancy,
        bedType: item.bedType,
        roomSize: item.roomSize,
        roomView: item.roomView,
        basePrice: item.basePrice,
        agentPrice: item.agentPrice,
        customerPrice: item.customerPrice,
        profitMargin: item.profitMargin,
        profitPercentage: item.profitPercentage,
        currency: item.currency,
        validFrom: item.validFrom,
        validTo: item.validTo,
        cancellationPolicy: item.cancellationPolicy,
        breakfastIncluded: item.breakfastIncluded,
        freeCancellation: item.freeCancellation,
        lastUpdated: item.lastUpdated,
        updatedBy: item.updatedBy
      }))
    });
  } catch (error) {
    console.error('Error fetching price pool:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Yeni fiyat havuzuna ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelId,
      hotelName,
      hotelAddress,
      hotelCity,
      hotelCountry,
      hotelRating,
      hotelStars,
      hotelImage,
      hotelAmenities,
      roomType,
      roomName,
      roomDescription,
      roomAmenities,
      maxOccupancy,
      bedType,
      roomSize,
      roomView,
      basePrice,
      agentPrice,
      customerPrice,
      profitMargin,
      profitPercentage,
      currency,
      validFrom,
      validTo,
      cancellationPolicy,
      breakfastIncluded,
      freeCancellation,
      updatedBy
    } = body;

    // Fiyat havuzuna ekle
    const pricePoolItem = await prisma.hotelPricePool.create({
      data: {
        tenantId: 'demo', // Geçici olarak demo tenant
        hotelId,
        hotelName,
        hotelAddress,
        hotelCity,
        hotelCountry,
        hotelRating: parseFloat(hotelRating),
        hotelStars: parseInt(hotelStars),
        hotelImage,
        hotelAmenities: hotelAmenities || [],
        roomType,
        roomName,
        roomDescription,
        roomAmenities: roomAmenities || [],
        maxOccupancy: parseInt(maxOccupancy),
        bedType,
        roomSize,
        roomView,
        basePrice: parseFloat(basePrice),
        agentPrice: parseFloat(agentPrice),
        customerPrice: parseFloat(customerPrice),
        profitMargin: parseFloat(profitMargin),
        profitPercentage: parseFloat(profitPercentage),
        currency: currency || 'EUR',
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        cancellationPolicy,
        breakfastIncluded: Boolean(breakfastIncluded),
        freeCancellation: Boolean(freeCancellation),
        updatedBy: updatedBy || 'system'
      }
    });

    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Fiyat havuzuna başarıyla eklendi',
      pricePoolItem: {
        id: pricePoolItem.id,
        hotelId: pricePoolItem.hotelId,
        hotelName: pricePoolItem.hotelName,
        roomName: pricePoolItem.roomName,
        customerPrice: pricePoolItem.customerPrice,
        currency: pricePoolItem.currency,
        validFrom: pricePoolItem.validFrom,
        validTo: pricePoolItem.validTo
      }
    });
  } catch (error) {
    console.error('Error adding to price pool:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { error: 'Fiyat havuzuna eklenemedi' },
      { status: 500 }
    );
  }
}
