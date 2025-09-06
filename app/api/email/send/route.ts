import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/app/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, booking, to, subject, html, text } = body;

    let result;

    switch (type) {
      case 'booking_confirmation':
        result = await EmailService.sendBookingConfirmation(booking);
        break;
      
      case 'booking_cancellation':
        result = await EmailService.sendBookingCancellation(booking);
        break;
      
      case 'booking_modification':
        result = await EmailService.sendBookingModification(booking);
        break;
      
      case 'custom':
        result = await EmailService.sendEmail(to, subject, html, text);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Geçersiz e-posta tipi' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'E-posta başarıyla gönderildi',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'E-posta gönderilemedi' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('E-posta API hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
