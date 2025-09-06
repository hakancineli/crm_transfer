import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { voucherNumber: string } }
) {
  try {
    const { voucherNumber } = params;

    // Voucher numarasına göre rezervasyonu bul
    const booking = await prisma.hotelBooking.findFirst({
      where: {
        voucherNumber: voucherNumber
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Rezervasyon bulunamadı' },
        { status: 404 }
      );
    }

    // Booking verisini döndür
    return NextResponse.json({
      success: true,
      booking: {
        voucherNumber: booking.voucherNumber,
        hotelName: booking.hotelName,
        hotelAddress: booking.hotelAddress,
        roomType: booking.roomType,
        checkin: booking.checkin.toISOString(),
        checkout: booking.checkout.toISOString(),
        adults: booking.adults,
        children: booking.children,
        rooms: booking.rooms,
        totalPrice: booking.totalPrice,
        currency: 'EUR', // Varsayılan para birimi
        customerInfo: booking.customerInfo as {
          name: string;
          email: string;
          phone: string;
        },
        specialRequests: booking.specialRequests,
        cancellationPolicy: 'Ücretsiz iptal 24 saat öncesine kadar',
        bookingReference: booking.bookingReference
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
