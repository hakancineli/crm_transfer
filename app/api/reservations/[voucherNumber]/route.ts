import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { createUetdsServiceForTenant } from '@/app/lib/uetdsService';

export async function GET(request: NextRequest, { params }: { params: { voucherNumber: string } }) {
  try {
    const voucherNumber = await Promise.resolve(params.voucherNumber);
    if (!voucherNumber) {
      return NextResponse.json(
        { error: 'Voucher numarası gerekli' },
        { status: 400 }
      );
    }

    // Önce transfer rezervasyonunu ara
    let reservation = await prisma.reservation.findUnique({
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

    // Transfer rezervasyonu bulunamazsa tur rezervasyonunu ara
    if (!reservation && voucherNumber.startsWith('TUR-')) {
      const tourBooking = await prisma.tourBooking.findUnique({
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

      if (tourBooking) {
        // Tur rezervasyonunu transfer formatına çevir
        reservation = {
          id: tourBooking.id,
          voucherNumber: tourBooking.voucherNumber,
          date: tourBooking.tourDate.toISOString().split('T')[0],
          time: tourBooking.tourTime || '00:00',
          from: tourBooking.pickupLocation,
          to: tourBooking.routeName,
          passengerNames: tourBooking.passengerNames,
          price: tourBooking.price,
          currency: tourBooking.currency,
          paymentStatus: tourBooking.status,
          phoneNumber: (tourBooking as any).phoneNumber || '',
          createdAt: (tourBooking as any).createdAt,
          tenantId: (tourBooking as any).tenantId,
          driver: tourBooking.driver,
          tenant: tourBooking.tenant,
          type: 'tur'
        } as any;
      }
    }

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
      include: { 
        driver: true,
        tenant: {
          select: {
            id: true,
            uetdsEnabled: true,
            uetdsUsername: true,
            uetdsPassword: true,
            uetdsUnetNo: true,
            uetdsTestMode: true
          }
        }
      }
    });

    // U-ETDS otomatik bildirimi (kendi araç ile transfer)
    if (updatedReservation.tenant?.uetdsEnabled && updatedReservation.driver && updatedReservation.tenantId) {
      try {
        const uetdsService = await createUetdsServiceForTenant(updatedReservation.tenantId as string);
        if (uetdsService) {
          const driverInfo: any = updatedReservation.driver || {};
          // Sefer ekle
          const seferResult = await uetdsService.seferEkle({
            aracPlaka: driverInfo.vehiclePlate || driverInfo.plate || '34ABC123',
            hareketTarihi: new Date(updatedReservation.date),
            hareketSaati: updatedReservation.time,
            seferAciklama: `${updatedReservation.from} - ${updatedReservation.to} Transfer`,
            aracTelefonu: driverInfo.phone || driverInfo.phoneNumber || '',
            firmaSeferNo: updatedReservation.voucherNumber,
            seferBitisTarihi: new Date(updatedReservation.date),
            seferBitisSaati: updatedReservation.time
          });

          if (seferResult.success && seferResult.seferReferansNo) {
            // U-ETDS sefer kaydı oluştur
            await prisma.uetdsSefer.create({
              data: {
                tenantId: updatedReservation.tenantId,
                reservationId: updatedReservation.id,
                uetdsSeferReferansNo: seferResult.seferReferansNo,
                aracPlaka: driverInfo.vehiclePlate || driverInfo.plate || '34ABC123',
                hareketTarihi: new Date(updatedReservation.date),
                hareketSaati: updatedReservation.time,
                seferAciklama: `${updatedReservation.from} - ${updatedReservation.to} Transfer`,
                aracTelefonu: driverInfo.phone || driverInfo.phoneNumber || '',
                firmaSeferNo: updatedReservation.voucherNumber,
                seferBitisTarihi: new Date(updatedReservation.date),
                seferBitisSaati: updatedReservation.time,
                bildirimZamani: new Date(),
                sonucKodu: 0,
                sonucMesaji: seferResult.message
              }
            });

            // Şoför ekle
            await uetdsService.personelEkle(
              seferResult.seferReferansNo as string,
              {
                turKodu: 0, // Şoför
                uyrukUlke: 'TR',
                tcKimlikPasaportNo: driverInfo.tcNo || '12345678901',
                cinsiyet: driverInfo.gender || 'E',
                adi: (driverInfo.name || '').split(' ')[0] || 'Şoför',
                soyadi: (driverInfo.name || '').split(' ').slice(1).join(' ') || 'Adı',
                telefon: driverInfo.phone || driverInfo.phoneNumber || '',
                adres: driverInfo.address || ''
              }
            );

            // Yolcuları ekle
            const passengerNames = Array.isArray(updatedReservation.passengerNames) 
              ? updatedReservation.passengerNames 
              : JSON.parse(updatedReservation.passengerNames || '[]');

            for (const passengerName of passengerNames) {
              if (passengerName && passengerName.trim()) {
                await uetdsService.yolcuEkle(
                  seferResult.seferReferansNo as string,
                  {
                    uyrukUlke: 'TR',
                    cinsiyet: 'E', // Varsayılan
                    tcKimlikPasaportNo: '12345678901', // Varsayılan - gerçek uygulamada yolcu bilgileri gerekli
                    adi: passengerName.split(' ')[0] || 'Yolcu',
                    soyadi: passengerName.split(' ').slice(1).join(' ') || 'Adı'
                  }
                );
              }
            }
          }
        }
      } catch (uetdsError) {
        console.error('U-ETDS bildirimi hatası:', uetdsError);
        // U-ETDS hatası rezervasyon güncellemesini engellemez
      }
    }

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

    // Yetkilendirme kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded?.userId;
    const role = decoded?.role;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    // Rezervasyonu bul ve tenant kontrolü yap
    let reservation = await prisma.reservation.findUnique({
      where: { voucherNumber },
      include: { tenant: true }
    });

    // Transfer rezervasyonu bulunamazsa tur rezervasyonunu kontrol et
    if (!reservation && voucherNumber.startsWith('TUR-')) {
      const tourBooking = await prisma.tourBooking.findUnique({
        where: { voucherNumber },
        include: { tenant: true }
      });

      if (tourBooking) {
        // Tur rezervasyonu için tenant kontrolü
        if (role !== 'SUPERUSER') {
          const userTenant = await prisma.tenantUser.findFirst({
            where: { userId, isActive: true },
            select: { tenantId: true }
          });

          if (!userTenant || userTenant.tenantId !== tourBooking.tenantId) {
            return NextResponse.json(
              { error: 'Bu rezervasyonu silme yetkiniz yok' },
              { status: 403 }
            );
          }
        }

        // Tur rezervasyonunu sil
        await prisma.tourBooking.delete({
          where: { voucherNumber }
        });

        return NextResponse.json({ message: 'Tur rezervasyonu başarıyla silindi' });
      }
    }

    if (!reservation) {
      return NextResponse.json(
        { error: 'Rezervasyon bulunamadı' },
        { status: 404 }
      );
    }

    // Transfer rezervasyonu için tenant kontrolü
    if (role !== 'SUPERUSER') {
      const userTenant = await prisma.tenantUser.findFirst({
        where: { userId, isActive: true },
        select: { tenantId: true }
      });

      if (!userTenant || userTenant.tenantId !== reservation.tenantId) {
        return NextResponse.json(
          { error: 'Bu rezervasyonu silme yetkiniz yok' },
          { status: 403 }
        );
      }
    }

    // Transfer rezervasyonunu sil
    await prisma.reservation.delete({
      where: { voucherNumber }
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