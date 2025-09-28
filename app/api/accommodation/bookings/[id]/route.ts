import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Rezervasyon detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const booking = await prisma.hotelBooking.findUnique({
      where: {
        id: id
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Rezervasyon bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        voucherNumber: booking.voucherNumber,
        hotelName: booking.hotelName,
        hotelAddress: booking.hotelAddress,
        roomType: booking.roomType,
        checkin: booking.checkin,
        checkout: booking.checkout,
        adults: booking.adults,
        children: booking.children,
        rooms: booking.rooms,
        totalPrice: booking.totalPrice,
        currency: 'EUR',
        status: booking.status,
        customerInfo: booking.customerInfo as {
          name: string;
          email: string;
          phone: string;
        },
        specialRequests: booking.specialRequests,
        bookingReference: booking.bookingReference,
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching hotel booking:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Rezervasyonu güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      hotelName,
      hotelAddress,
      roomType,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      totalPrice,
      status,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests
    } = body;

    // Rezervasyonu güncelle
    const updatedBooking = await prisma.hotelBooking.update({
      where: {
        id: id
      },
      data: {
        hotelName: hotelName,
        hotelAddress: hotelAddress,
        roomType: roomType,
        checkin: new Date(checkin),
        checkout: new Date(checkout),
        adults: parseInt(adults),
        children: parseInt(children),
        rooms: parseInt(rooms),
        totalPrice: parseFloat(totalPrice),
        status: status,
        customerInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        specialRequests: specialRequests || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Rezervasyon başarıyla güncellendi',
      booking: {
        id: updatedBooking.id,
        voucherNumber: updatedBooking.voucherNumber,
        hotelName: updatedBooking.hotelName,
        hotelAddress: updatedBooking.hotelAddress,
        roomType: updatedBooking.roomType,
        checkin: updatedBooking.checkin,
        checkout: updatedBooking.checkout,
        adults: updatedBooking.adults,
        children: updatedBooking.children,
        rooms: updatedBooking.rooms,
        totalPrice: updatedBooking.totalPrice,
        currency: 'EUR',
        status: updatedBooking.status,
        customerInfo: updatedBooking.customerInfo as {
          name: string;
          email: string;
          phone: string;
        },
        specialRequests: updatedBooking.specialRequests,
        bookingReference: updatedBooking.bookingReference,
        createdAt: updatedBooking.createdAt,
        updatedAt: updatedBooking.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating hotel booking:', error);
    return NextResponse.json(
      { error: 'Rezervasyon güncellenemedi' },
      { status: 500 }
    );
  }
}

// Rezervasyonu sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.hotelBooking.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Rezervasyon başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting hotel booking:', error);
    return NextResponse.json(
      { error: 'Rezervasyon silinemedi' },
      { status: 500 }
    );
  }
}
