import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { voucherNumber: string } }) {
  try {
    const voucherNumber = await Promise.resolve(params.voucherNumber);
    if (!voucherNumber) {
      return NextResponse.json(
        { error: 'Voucher numarası gerekli' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    if (!data.status || !['PENDING', 'APPROVED', 'REJECTED'].includes(data.status)) {
      return NextResponse.json(
        { error: 'Geçerli bir durum gerekli (PENDING, APPROVED, REJECTED)' },
        { status: 400 }
      );
    }

    // Rezervasyonu güncelle
    const updatedReservation = await prisma.reservation.update({
      where: { voucherNumber },
      data: {
        companyCommissionStatus: data.status
      },
      include: { driver: true }
    });

    try {
      const parsedNames = JSON.parse(updatedReservation.passengerNames || '[]');
      return NextResponse.json({
        ...updatedReservation,
        passengerNames: parsedNames
      });
    } catch (e) {
      console.error('Yolcu isimleri parse edilemedi:', e);
      return NextResponse.json({
        ...updatedReservation,
        passengerNames: []
      });
    }
  } catch (error) {
    console.error('Şirket hakedişi durumu güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Şirket hakedişi durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
