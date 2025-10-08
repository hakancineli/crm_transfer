import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UetdsCredentials {
  username: string;
  password: string;
  unetNo: string;
  testMode: boolean;
}

export interface UetdsSeferInput {
  aracPlaka: string;
  hareketTarihi: Date;
  hareketSaati: string;
  seferAciklama?: string;
  aracTelefonu?: string;
  firmaSeferNo?: string;
  seferBitisTarihi: Date;
  seferBitisSaati: string;
}

export interface UetdsYolcuInput {
  grupId?: string;
  uyrukUlke: string;
  cinsiyet: string;
  tcKimlikPasaportNo: string;
  adi: string;
  soyadi: string;
  koltukNo?: string;
  telefonNo?: string;
  hesKodu?: string;
}

export interface UetdsPersonelInput {
  turKodu: number;
  uyrukUlke: string;
  tcKimlikPasaportNo: string;
  cinsiyet: string;
  adi: string;
  soyadi: string;
  telefon?: string;
  adres?: string;
  hesKodu?: string;
}

export interface UetdsGrupInput {
  grupAdi: string;
  grupAciklama: string;
  baslangicUlke: string;
  baslangicIl?: number;
  baslangicIlce?: number;
  baslangicYer?: string;
  bitisUlke: string;
  bitisIl?: number;
  bitisIlce?: number;
  bitisYer?: string;
  grupUcret?: string;
}

export class UetdsService {
  private credentials: UetdsCredentials;
  private baseUrl: string;

  constructor(credentials: UetdsCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.testMode 
      ? 'https://servis.turkiye.gov.tr/services/g2g/kdgm/test/uetdsarizi'
      : 'https://servis.turkiye.gov.tr/services/g2g/kdgm/uetdsarizi';
  }

  /**
   * U-ETDS servis testi
   */
  async servisTest(): Promise<{ success: boolean; message: string }> {
    try {
      const soapEnvelope = this.createSoapEnvelope('servisTest', {
        testMsj1: 'Test mesajı'
      });

      const response = await this.makeSoapRequest(soapEnvelope);
      
      if (response.includes('OK')) {
        return { success: true, message: 'U-ETDS servisi aktif' };
      } else {
        return { success: false, message: 'U-ETDS servisi yanıt vermiyor' };
      }
    } catch (error) {
      console.error('U-ETDS servis testi hatası:', error);
      return { success: false, message: 'U-ETDS servisi erişilemiyor' };
    }
  }

  /**
   * Sefer ekleme
   */
  async seferEkle(seferData: UetdsSeferInput): Promise<{ success: boolean; seferReferansNo?: string; message: string }> {
    try {
      const soapEnvelope = this.createSoapEnvelope('seferEkle', {
        UetdsYtsUser: {
          kullaniciAdi: this.credentials.username,
          sifre: this.credentials.password
        },
        UetdsArıziSeferBilgileriInput: {
          aracPlaka: seferData.aracPlaka,
          hareketTarihi: seferData.hareketTarihi.toISOString().split('T')[0],
          hareketSaati: seferData.hareketSaati,
          seferAciklama: seferData.seferAciklama || '',
          aracTelefonu: seferData.aracTelefonu || '',
          firmaSeferNo: seferData.firmaSeferNo || '',
          seferBitisTarihi: seferData.seferBitisTarihi.toISOString().split('T')[0],
          seferBitisSaati: seferData.seferBitisSaati
        }
      });

      const response = await this.makeSoapRequest(soapEnvelope);
      const result = this.parseSoapResponse(response);

      if (result.sonucKodu === 0) {
        return {
          success: true,
          seferReferansNo: result.uetdsSeferReferansNo,
          message: result.sonucMesaji || 'Sefer başarıyla eklendi'
        };
      } else {
        return {
          success: false,
          message: result.sonucMesaji || 'Sefer eklenemedi'
        };
      }
    } catch (error) {
      console.error('Sefer ekleme hatası:', error);
      return { success: false, message: 'Sefer ekleme işlemi başarısız' };
    }
  }

  /**
   * Yolcu ekleme
   */
  async yolcuEkle(seferReferansNo: string, yolcuData: UetdsYolcuInput): Promise<{ success: boolean; yolcuRefNo?: string; message: string }> {
    try {
      const soapEnvelope = this.createSoapEnvelope('yolcuEkle', {
        UetdsYtsUser: {
          kullaniciAdi: this.credentials.username,
          sifre: this.credentials.password
        },
        uetdsSeferReferansNo: seferReferansNo,
        UetdsAriziSeferYolcuBilgileriInput: {
          grupId: yolcuData.grupId || 0,
          uyrukUlke: yolcuData.uyrukUlke,
          cinsiyet: yolcuData.cinsiyet,
          tcKimlikPasaportNo: yolcuData.tcKimlikPasaportNo,
          adi: yolcuData.adi,
          soyadı: yolcuData.soyadi,
          koltukNo: yolcuData.koltukNo || '',
          telefonNo: yolcuData.telefonNo || '',
          hesKodu: yolcuData.hesKodu || ''
        }
      });

      const response = await this.makeSoapRequest(soapEnvelope);
      const result = this.parseSoapResponse(response);

      if (result.sonucKodu === 0) {
        return {
          success: true,
          yolcuRefNo: result.uetdsYolcuRefNo,
          message: result.sonucMesaji || 'Yolcu başarıyla eklendi'
        };
      } else {
        return {
          success: false,
          message: result.sonucMesaji || 'Yolcu eklenemedi'
        };
      }
    } catch (error) {
      console.error('Yolcu ekleme hatası:', error);
      return { success: false, message: 'Yolcu ekleme işlemi başarısız' };
    }
  }

  /**
   * Personel ekleme
   */
  async personelEkle(seferReferansNo: string, personelData: UetdsPersonelInput): Promise<{ success: boolean; message: string }> {
    try {
      const soapEnvelope = this.createSoapEnvelope('personelEkle', {
        UetdsYtsUser: {
          kullaniciAdi: this.credentials.username,
          sifre: this.credentials.password
        },
        uetdsSeferReferansNo: seferReferansNo,
        UetdsSeferPersonelBilgileriInput: {
          turKodu: personelData.turKodu,
          uyrukUlke: personelData.uyrukUlke,
          tcKimlikPasaportno: personelData.tcKimlikPasaportNo,
          cinsiyet: personelData.cinsiyet,
          adi: personelData.adi,
          soyadi: personelData.soyadi,
          telefon: personelData.telefon || '',
          adres: personelData.adres || '',
          hesKodu: personelData.hesKodu || ''
        }
      });

      const response = await this.makeSoapRequest(soapEnvelope);
      const result = this.parseSoapResponse(response);

      if (result.sonucKodu === 0) {
        return {
          success: true,
          message: result.sonucMesaji || 'Personel başarıyla eklendi'
        };
      } else {
        return {
          success: false,
          message: result.sonucMesaji || 'Personel eklenemedi'
        };
      }
    } catch (error) {
      console.error('Personel ekleme hatası:', error);
      return { success: false, message: 'Personel ekleme işlemi başarısız' };
    }
  }

  /**
   * Grup ekleme
   */
  async grupEkle(seferReferansNo: string, grupData: UetdsGrupInput): Promise<{ success: boolean; grupRefNo?: string; message: string }> {
    try {
      const soapEnvelope = this.createSoapEnvelope('seferGrupEkle', {
        UetdsYtsUser: {
          kullaniciAdi: this.credentials.username,
          sifre: this.credentials.password
        },
        uetdsSeferReferansNo: seferReferansNo,
        UetdsAriziGrupBilgileriInput: {
          grupAdi: grupData.grupAdi,
          grupAciklama: grupData.grupAciklama,
          baslangicUlke: grupData.baslangicUlke,
          baslangicIl: grupData.baslangicIl || 0,
          baslangicIlce: grupData.baslangicIlce || 0,
          baslangicYer: grupData.baslangicYer || '',
          bitisUlke: grupData.bitisUlke,
          bitisIl: grupData.bitisIl || 0,
          bitisIlce: grupData.bitisIlce || 0,
          bitisYer: grupData.bitisYer || '',
          grupUcret: grupData.grupUcret || ''
        }
      });

      const response = await this.makeSoapRequest(soapEnvelope);
      const result = this.parseSoapResponse(response);

      if (result.sonucKodu === 0) {
        return {
          success: true,
          grupRefNo: result.uetdsGrupRefNo,
          message: result.sonucMesaji || 'Grup başarıyla eklendi'
        };
      } else {
        return {
          success: false,
          message: result.sonucMesaji || 'Grup eklenemedi'
        };
      }
    } catch (error) {
      console.error('Grup ekleme hatası:', error);
      return { success: false, message: 'Grup ekleme işlemi başarısız' };
    }
  }

  /**
   * Sefer iptal etme
   */
  async seferIptal(seferReferansNo: string, iptalAciklama: string): Promise<{ success: boolean; message: string }> {
    try {
      const soapEnvelope = this.createSoapEnvelope('seferIptal', {
        UetdsYtsUser: {
          kullaniciAdi: this.credentials.username,
          sifre: this.credentials.password
        },
        uetdsSeferReferansNo: seferReferansNo,
        iptalAciklama: iptalAciklama
      });

      const response = await this.makeSoapRequest(soapEnvelope);
      const result = this.parseSoapResponse(response);

      if (result.sonucKodu === 0) {
        return {
          success: true,
          message: result.sonucMesaji || 'Sefer başarıyla iptal edildi'
        };
      } else {
        return {
          success: false,
          message: result.sonucMesaji || 'Sefer iptal edilemedi'
        };
      }
    } catch (error) {
      console.error('Sefer iptal hatası:', error);
      return { success: false, message: 'Sefer iptal işlemi başarısız' };
    }
  }

  /**
   * Bildirim özeti alma
   */
  async bildirimOzeti(seferReferansNo: string): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const soapEnvelope = this.createSoapEnvelope('bildirimOzeti', {
        UetdsYtsUser: {
          kullaniciAdi: this.credentials.username,
          sifre: this.credentials.password
        },
        uetdsSeferReferansNo: seferReferansNo
      });

      const response = await this.makeSoapRequest(soapEnvelope);
      const result = this.parseSoapResponse(response);

      if (result.sonucKodu === 0) {
        return {
          success: true,
          data: result,
          message: result.sonucMesaji || 'Bildirim özeti alındı'
        };
      } else {
        return {
          success: false,
          message: result.sonucMesaji || 'Bildirim özeti alınamadı'
        };
      }
    } catch (error) {
      console.error('Bildirim özeti hatası:', error);
      return { success: false, message: 'Bildirim özeti işlemi başarısız' };
    }
  }

  /**
   * SOAP envelope oluşturma
   */
  private createSoapEnvelope(method: string, data: any): string {
    const dataXml = this.objectToXml(data);
    
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:uetds="http://uetds.ws.uetdsarizi.uetds.gov.tr/">
  <soap:Header/>
  <soap:Body>
    <uetds:${method}>
      ${dataXml}
    </uetds:${method}>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Object'i XML'e çevirme
   */
  private objectToXml(obj: any, rootName?: string): string {
    let xml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        xml += `<${key}>${this.objectToXml(value)}</${key}>`;
      } else if (Array.isArray(value)) {
        for (const item of value) {
          xml += `<${key}>${this.objectToXml(item)}</${key}>`;
        }
      } else {
        xml += `<${key}>${value}</${key}>`;
      }
    }
    
    return xml;
  }

  /**
   * SOAP request gönderme
   */
  private async makeSoapRequest(soapEnvelope: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': `"${this.baseUrl}#${this.extractMethodName(soapEnvelope)}"`
      },
      body: soapEnvelope
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  }

  /**
   * SOAP response parse etme
   */
  private parseSoapResponse(response: string): any {
    // Basit XML parsing - production'da daha gelişmiş bir parser kullanılmalı
    const result: any = {};
    
    // sonucKodu
    const sonucKoduMatch = response.match(/<sonucKodu>(\d+)<\/sonucKodu>/);
    if (sonucKoduMatch) {
      result.sonucKodu = parseInt(sonucKoduMatch[1]);
    }
    
    // sonucMesaji
    const sonucMesajiMatch = response.match(/<sonucMesaji>(.*?)<\/sonucMesaji>/);
    if (sonucMesajiMatch) {
      result.sonucMesaji = sonucMesajiMatch[1];
    }
    
    // uetdsSeferReferansNo
    const seferRefMatch = response.match(/<uetdsSeferReferansNo>(\d+)<\/uetdsSeferReferansNo>/);
    if (seferRefMatch) {
      result.uetdsSeferReferansNo = seferRefMatch[1];
    }
    
    // uetdsYolcuRefNo
    const yolcuRefMatch = response.match(/<uetdsYolcuRefNo>(.*?)<\/uetdsYolcuRefNo>/);
    if (yolcuRefMatch) {
      result.uetdsYolcuRefNo = yolcuRefMatch[1];
    }
    
    // uetdsGrupRefNo
    const grupRefMatch = response.match(/<uetdsGrupRefNo>(.*?)<\/uetdsGrupRefNo>/);
    if (grupRefMatch) {
      result.uetdsGrupRefNo = grupRefMatch[1];
    }
    
    return result;
  }

  /**
   * SOAP envelope'dan method adını çıkarma
   */
  private extractMethodName(soapEnvelope: string): string {
    const match = soapEnvelope.match(/<uetds:(\w+)>/);
    return match ? match[1] : '';
  }
}

/**
 * Tenant için U-ETDS servisi oluşturma
 */
export async function createUetdsServiceForTenant(tenantId: string): Promise<UetdsService | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        uetdsEnabled: true,
        uetdsUsername: true,
        uetdsPassword: true,
        uetdsUnetNo: true,
        uetdsTestMode: true
      }
    });

    if (!tenant || !tenant.uetdsEnabled || !tenant.uetdsUsername || !tenant.uetdsPassword) {
      return null;
    }

    return new UetdsService({
      username: tenant.uetdsUsername,
      password: tenant.uetdsPassword,
      unetNo: tenant.uetdsUnetNo || '',
      testMode: tenant.uetdsTestMode || true
    });
  } catch (error) {
    console.error('U-ETDS servisi oluşturma hatası:', error);
    return null;
  }
}
