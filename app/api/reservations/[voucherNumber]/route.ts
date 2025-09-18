import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { voucherNumber: string } }) {
  try {
    const voucherNumber = await Promise.resolve(params.voucherNumber);
    if (!voucherNumber) {
      return NextResponse.json(
        { error: 'Voucher numarası gerekli' },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { voucherNumber },
      include: {
        driver: true,
        tenant: {
          select: {
            id: true,
            companyName: true,
            subdomain: true,
            paymentIban: true,
            paymentAccountHolder: true,
            paymentBank: true
          }
        }
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Rezervasyon bulunamadı' },
        { status: 404 }
      );
    }

    try {
      const parsedNames = JSON.parse(reservation.passengerNames || '[]');
      return NextResponse.json({
        ...reservation,
        passengerNames: parsedNames
      });
    } catch (e) {
      console.error('Yolcu isimleri parse edilemedi:', e);
      return NextResponse.json({
        ...reservation,
        passengerNames: []
      });
    }
  } catch (error) {
    console.error('Rezervasyon getirme hatası:', error);
    return NextResponse.json(
      { error: 'Rezervasyon getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { voucherNumber: string } }) {
  try {
    const voucherNumber = await Promise.resolve(params.voucherNumber);
    if (!voucherNumber) {
      return NextResponse.json(
        { error: 'Voucher numarası gerekli' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // Önce rezervasyonun mevcut olduğunu kontrol et
    const existingReservation = await prisma.reservation.findUnique({
      where: { voucherNumber }
    });

    if (!existingReservation) {
      return NextResponse.json(
        { error: 'Rezervasyon bulunamadı' },
        { status: 404 }
      );
    }

    // Eğer sadece ödeme durumu güncelleniyorsa
    if (data.paymentStatus && Object.keys(data).length === 1) {
      const updatedReservation = await prisma.reservation.update({
        where: { voucherNumber },
        data: {
          paymentStatus: data.paymentStatus
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
    }

    // Yolcu isimlerini JSON string'e çevir ve boş isimleri filtrele
    const passengerNames = Array.isArray(data.passengerNames) 
        ? JSON.stringify(data.passengerNames.filter((name: string) => name && name.trim() !== ''))
        : JSON.stringify([]);

    // Şoför ID'sinin geçerli olduğunu kontrol et
    if (data.driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: data.driverId }
      });

      if (!driver) {
        return NextResponse.json(
          { error: 'Geçersiz şoför ID' },
          { status: 400 }
        );
      }
    }

    const updatedReservation = await prisma.reservation.update({
      where: { voucherNumber },
      data: {
        date: data.date,
        time: data.time,
        from: data.from,
        to: data.to,
        flightCode: data.flightCode,
        passengerNames,
        luggageCount: data.luggageCount,
        price: data.price,
        currency: data.currency,
        phoneNumber: data.phoneNumber,
        driverId: data.driverId || existingReservation.driverId,
        driverFee: data.driverFee ? parseFloat(data.driverFee) : existingReservation.driverFee,
        paymentStatus: data.paymentStatus || existingReservation.paymentStatus
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
    console.error('Rezervasyon güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Rezervasyon güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

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
    
    // Şoför atama için gerekli alanları kontrol et
    if (!data.driverId || data.driverFee === undefined) {
      return NextResponse.json(
        { error: 'Şoför ID ve hakediş tutarı gerekli' },
        { status: 400 }
      );
    }

    // Şoför ID'sinin geçerli olduğunu kontrol et
    const driver = await prisma.driver.findUnique({
      where: { id: data.driverId }
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Geçersiz şoför ID' },
        { status: 400 }
      );
    }

    // Rezervasyonu güncelle
    const updatedReservation = await prisma.reservation.update({
      where: { voucherNumber },
      data: {
        driverId: data.driverId,
        driverFee: parseFloat(data.driverFee)
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
    console.error('Şoför atama hatası:', error);
    return NextResponse.json(
      { error: 'Şoför atanırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { voucherNumber: string } }) {
  try {
    const voucherNumber = params.voucherNumber;
    if (!voucherNumber) {
      return NextResponse.json(
        { error: 'Voucher numarası gerekli' },
        { status: 400 }
      );
    }

    await prisma.reservation.delete({
      where: {
        voucherNumber: voucherNumber,
      },
    });

    return NextResponse.json({ message: 'Rezervasyon başarıyla silindi' });
  } catch (error) {
    console.error('Rezervasyon silme hatası:', error);
    return NextResponse.json(
      { error: 'Rezervasyon silinemedi' },
      { status: 500 }
    );
  }
} 