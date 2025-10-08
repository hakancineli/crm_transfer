import { NextRequest, NextResponse } from 'next/server';

// GET - Demo U-ETDS verileri (token gerektirmez)
export async function GET(request: NextRequest) {
  try {
    // Demo sefer verileri
    const demoSeferler = [
      {
        id: 'demo-1',
        uetdsSeferReferansNo: '123456789',
        aracPlaka: '34ABC123',
        hareketTarihi: '2024-01-15',
        hareketSaati: '14:30',
        seferAciklama: 'İstanbul Havalimanı Transfer',
        seferDurum: 'AKTIF',
        bildirimZamani: '2024-01-15T12:00:00Z',
        sonucKodu: 0,
        sonucMesaji: 'Başarılı',
        reservation: {
          voucherNumber: 'TRF-2024-001',
          from: 'İstanbul Havalimanı',
          to: 'Kadıköy',
          passengerNames: 'Ahmet Yılmaz, Ayşe Yılmaz'
        },
        yolcular: [
          {
            id: 'yolcu-1',
            adi: 'Ahmet',
            soyadi: 'Yılmaz',
            tcKimlikPasaportNo: '12345678901',
            durum: 'AKTIF'
          },
          {
            id: 'yolcu-2',
            adi: 'Ayşe',
            soyadi: 'Yılmaz',
            tcKimlikPasaportNo: '12345678902',
            durum: 'AKTIF'
          }
        ],
        personeller: [
          {
            id: 'personel-1',
            adi: 'Mehmet',
            soyadi: 'Şoför',
            turKodu: 0,
            durum: 'AKTIF'
          }
        ],
        gruplar: [
          {
            id: 'grup-1',
            grupAdi: 'Aile Transferi',
            durum: 'AKTIF'
          }
        ]
      },
      {
        id: 'demo-2',
        uetdsSeferReferansNo: '987654321',
        aracPlaka: '06XYZ789',
        hareketTarihi: '2024-01-16',
        hareketSaati: '09:15',
        seferAciklama: 'Sabiha Gökçen Transfer',
        seferDurum: 'AKTIF',
        bildirimZamani: '2024-01-16T07:00:00Z',
        sonucKodu: 0,
        sonucMesaji: 'Başarılı',
        reservation: {
          voucherNumber: 'TRF-2024-002',
          from: 'Sabiha Gökçen Havalimanı',
          to: 'Beşiktaş',
          passengerNames: 'Fatma Demir'
        },
        yolcular: [
          {
            id: 'yolcu-3',
            adi: 'Fatma',
            soyadi: 'Demir',
            tcKimlikPasaportNo: '98765432101',
            durum: 'AKTIF'
          }
        ],
        personeller: [
          {
            id: 'personel-2',
            adi: 'Ali',
            soyadi: 'Şoför',
            turKodu: 0,
            durum: 'AKTIF'
          }
        ],
        gruplar: []
      }
    ];

    // Demo log verileri
    const demoLogs = [
      {
        id: 'log-1',
        islemTuru: 'seferEkle',
        sonucKodu: 0,
        sonucMesaji: 'Sefer başarıyla eklendi',
        islemZamani: '2024-01-15T12:00:00Z'
      },
      {
        id: 'log-2',
        islemTuru: 'yolcuEkle',
        sonucKodu: 0,
        sonucMesaji: 'Yolcu başarıyla eklendi',
        islemZamani: '2024-01-15T12:05:00Z'
      },
      {
        id: 'log-3',
        islemTuru: 'servisTest',
        sonucKodu: 0,
        sonucMesaji: 'U-ETDS servisi aktif',
        islemZamani: '2024-01-15T11:30:00Z'
      },
      {
        id: 'log-4',
        islemTuru: 'seferEkle',
        sonucKodu: 1,
        sonucMesaji: 'Araç plaka bilgisi eksik',
        islemZamani: '2024-01-14T15:20:00Z',
        hataDetayi: 'Araç plaka bilgisi zorunlu alan'
      }
    ];

    return NextResponse.json({
      success: true,
      seferler: demoSeferler,
      logs: demoLogs,
      message: 'Demo U-ETDS verileri yüklendi'
    });

  } catch (error: any) {
    console.error('Demo U-ETDS verileri hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
