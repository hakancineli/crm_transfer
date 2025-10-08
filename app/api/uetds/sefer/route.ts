import { NextRequest, NextResponse } from 'next/server';
import { createUetdsServiceForTenant } from '@/app/lib/uetdsService';
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

// POST - Sefer ekleme
export async function POST(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantUsers: {
          include: { tenant: true }
        }
      }
    });

    if (!user || user.tenantUsers.length === 0) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const tenantId = user.tenantUsers[0].tenantId;
    const body = await request.json();
    const { reservationId, ...seferData } = body;

    const uetdsService = await createUetdsServiceForTenant(tenantId);

    if (!uetdsService) {
      return NextResponse.json({ 
        error: 'U-ETDS servisi yapılandırılmamış'
      }, { status: 400 });
    }

    // Sefer ekleme
    const result = await uetdsService.seferEkle(seferData);

    if (result.success) {
      // Veritabanına kaydet
      const uetdsSefer = await prisma.uetdsSefer.create({
        data: {
          tenantId,
          reservationId: reservationId || null,
          uetdsSeferReferansNo: result.seferReferansNo,
          aracPlaka: seferData.aracPlaka,
          hareketTarihi: new Date(seferData.hareketTarihi),
          hareketSaati: seferData.hareketSaati,
          seferAciklama: seferData.seferAciklama,
          aracTelefonu: seferData.aracTelefonu,
          firmaSeferNo: seferData.firmaSeferNo,
          seferBitisTarihi: new Date(seferData.seferBitisTarihi),
          seferBitisSaati: seferData.seferBitisSaati,
          bildirimZamani: new Date(),
          sonucKodu: 0,
          sonucMesaji: result.message
        }
      });

      // Şoför ekle (varsa)
      if (body.personel) {
        await uetdsService.personelEkle({
          seferReferansNo: result.seferReferansNo,
          turKodu: body.personel.turKodu,
          uyrukUlke: body.personel.uyrukUlke,
          tcKimlikPasaportNo: body.personel.tcKimlikPasaportNo,
          cinsiyet: body.personel.cinsiyet,
          adi: body.personel.adi,
          soyadi: body.personel.soyadi,
          telefon: body.personel.telefon,
          adres: body.personel.adres
        });
      }

      // Yolcuları ekle (varsa)
      if (body.yolcular && Array.isArray(body.yolcular)) {
        for (const yolcu of body.yolcular) {
          await uetdsService.yolcuEkle({
            seferReferansNo: result.seferReferansNo,
            uyrukUlke: yolcu.uyrukUlke,
            cinsiyet: yolcu.cinsiyet,
            tcKimlikPasaportNo: yolcu.tcKimlikPasaportNo,
            adi: yolcu.adi,
            soyadi: yolcu.soyadi
          });
        }
      }

      // Log kaydet
      await prisma.uetdsLog.create({
        data: {
          tenantId,
          seferId: uetdsSefer.id,
          islemTuru: 'seferEkle',
          islemParametreleri: seferData,
          sonucKodu: 0,
          sonucMesaji: result.message,
          sonucVerisi: result
        }
      });

      return NextResponse.json({
        success: true,
        seferId: uetdsSefer.id,
        uetdsSeferReferansNo: result.seferReferansNo,
        message: result.message
      });
    } else {
      // Hata logu
      await prisma.uetdsLog.create({
        data: {
          tenantId,
          islemTuru: 'seferEkle',
          islemParametreleri: seferData,
          sonucKodu: 1,
          sonucMesaji: result.message,
          hataDetayi: result.message
        }
      });

      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('U-ETDS sefer ekleme hatası:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token süresi dolmuş' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// GET - Sefer listesi
export async function GET(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantUsers: {
          include: { tenant: true }
        }
      }
    });

    if (!user || user.tenantUsers.length === 0) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const tenantId = user.tenantUsers[0].tenantId;

    const seferler = await prisma.uetdsSefer.findMany({
      where: { tenantId },
      include: {
        reservation: {
          select: {
            voucherNumber: true,
            from: true,
            to: true,
            passengerNames: true
          }
        },
        yolcular: {
          select: {
            id: true,
            adi: true,
            soyadi: true,
            tcKimlikPasaportNo: true,
            durum: true
          }
        },
        personeller: {
          select: {
            id: true,
            adi: true,
            soyadi: true,
            turKodu: true,
            durum: true
          }
        },
        gruplar: {
          select: {
            id: true,
            grupAdi: true,
            durum: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ seferler });

  } catch (error: any) {
    console.error('U-ETDS sefer listesi hatası:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token süresi dolmuş' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
