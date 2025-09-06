// Voucher numarası oluşturma ve yönetimi
export class VoucherUtils {
  // Transfer + Konaklama paketi için voucher numarası oluştur
  static generateVoucherNumber(tenantId: string, type: 'TRANSFER' | 'HOTEL' | 'PACKAGE' = 'PACKAGE'): string {
    const timestamp = Date.now().toString().slice(-6); // Son 6 hanesi
    const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 karakter
    const tenantPrefix = tenantId.substring(0, 3).toUpperCase(); // Tenant'ın ilk 3 karakteri
    
    const typePrefix = {
      'TRANSFER': 'TR',
      'HOTEL': 'HT',
      'PACKAGE': 'PK'
    }[type];
    
    return `${typePrefix}-${tenantPrefix}-${timestamp}-${random}`;
  }

  // Voucher numarasından bilgi çıkar
  static parseVoucherNumber(voucherNumber: string): {
    type: string;
    tenantPrefix: string;
    timestamp: string;
    random: string;
  } | null {
    const parts = voucherNumber.split('-');
    if (parts.length !== 4) return null;
    
    return {
      type: parts[0],
      tenantPrefix: parts[1],
      timestamp: parts[2],
      random: parts[3]
    };
  }

  // Transfer + Konaklama paketi voucher'ı oluştur
  static generatePackageVoucher(tenantId: string): {
    transferVoucher: string;
    hotelVoucher: string;
    packageVoucher: string;
  } {
    const baseTimestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const tenantPrefix = tenantId.substring(0, 3).toUpperCase();
    
    return {
      transferVoucher: `TR-${tenantPrefix}-${baseTimestamp}-${random}`,
      hotelVoucher: `HT-${tenantPrefix}-${baseTimestamp}-${random}`,
      packageVoucher: `PK-${tenantPrefix}-${baseTimestamp}-${random}`
    };
  }

  // Voucher geçerlilik kontrolü
  static isValidVoucher(voucherNumber: string): boolean {
    const parsed = this.parseVoucherNumber(voucherNumber);
    if (!parsed) return false;
    
    // Timestamp kontrolü (24 saat içinde oluşturulmuş mu?)
    const now = Date.now();
    const voucherTime = parseInt(parsed.timestamp + '000'); // 6 haneli timestamp'i 13 haneye çevir
    const timeDiff = now - voucherTime;
    
    return timeDiff < 24 * 60 * 60 * 1000; // 24 saat
  }
}
