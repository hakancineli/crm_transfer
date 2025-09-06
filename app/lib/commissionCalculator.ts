// Şoför hakedişi ve şirket hakedişi hesaplama fonksiyonları

export interface CommissionCalculation {
  salePrice: number;
  currency: string;
  driverCommission: number;
  companyCommission: number;
  exchangeRate?: number;
}

// Şoför hakedişi oranları (örnek değerler)
const DRIVER_COMMISSION_RATES = {
  USD: 0.30, // %30
  TRY: 0.25, // %25
  EUR: 0.30, // %30
};

// Kur hesaplama API'si (örnek - gerçek API entegrasyonu yapılabilir)
export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  try {
    // Gerçek API çağrısı burada yapılabilir
    // Şimdilik sabit değerler kullanıyoruz
    const rates: { [key: string]: { [key: string]: number } } = {
      USD: { TRY: 30.5, EUR: 0.85 },
      TRY: { USD: 0.033, EUR: 0.028 },
      EUR: { USD: 1.18, TRY: 35.9 }
    };

    if (fromCurrency === toCurrency) return 1;
    
    return rates[fromCurrency]?.[toCurrency] || 1;
  } catch (error) {
    console.error('Exchange rate API error:', error);
    return 1; // Hata durumunda 1 döndür
  }
}

// Şoför hakedişi hesaplama
export function calculateDriverCommission(salePrice: number, currency: string): number {
  const rate = DRIVER_COMMISSION_RATES[currency as keyof typeof DRIVER_COMMISSION_RATES] || 0.30;
  return salePrice * rate;
}

// Şirket hakedişi hesaplama (satış fiyatı - şoför hakedişi)
export function calculateCompanyCommission(salePrice: number, currency: string): number {
  const driverCommission = calculateDriverCommission(salePrice, currency);
  return salePrice - driverCommission;
}

// Tam hesaplama (şoför + şirket hakedişi)
export function calculateCommissions(salePrice: number, currency: string): CommissionCalculation {
  const driverCommission = calculateDriverCommission(salePrice, currency);
  const companyCommission = calculateCompanyCommission(salePrice, currency);

  return {
    salePrice,
    currency,
    driverCommission,
    companyCommission
  };
}

// Farklı para birimlerinde hesaplama
export async function calculateCommissionsWithExchange(
  salePrice: number, 
  fromCurrency: string, 
  toCurrency: string = 'USD'
): Promise<CommissionCalculation> {
  const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);
  const convertedPrice = salePrice * exchangeRate;
  
  const driverCommission = calculateDriverCommission(convertedPrice, toCurrency);
  const companyCommission = convertedPrice - driverCommission;

  return {
    salePrice: convertedPrice,
    currency: toCurrency,
    driverCommission,
    companyCommission,
    exchangeRate
  };
}
