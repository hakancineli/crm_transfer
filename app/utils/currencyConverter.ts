export interface ExchangeRates {
  TRY: number;
  USD: number;
  EUR: number;
}

export interface CurrencyConversion {
  price: number;
  priceInUSD: number;
  priceInEUR: number;
  exchangeRates: ExchangeRates;
}

// Sabit döviz kurları (gerçek API'den alınabilir)
const EXCHANGE_RATES: ExchangeRates = {
  TRY: 1,
  USD: 0.0243, // 1 TRY = 0.0243 USD
  EUR: 0.0224  // 1 TRY = 0.0224 EUR
};

export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    // Gerçek API'den döviz kurlarını al
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
    const data = await response.json();
    
    return {
      TRY: 1,
      USD: data.rates.USD || EXCHANGE_RATES.USD,
      EUR: data.rates.EUR || EXCHANGE_RATES.EUR
    };
  } catch (error) {
    console.error('Döviz kuru alınamadı, sabit değerler kullanılıyor:', error);
    return EXCHANGE_RATES;
  }
}

export function convertCurrency(priceTRY: number, targetCurrency: 'TRY' | 'USD' | 'EUR', exchangeRates: ExchangeRates): number {
  switch (targetCurrency) {
    case 'TRY':
      return priceTRY;
    case 'USD':
      return priceTRY * exchangeRates.USD;
    case 'EUR':
      return priceTRY * exchangeRates.EUR;
    default:
      return priceTRY;
  }
}

export function calculatePriceWithCurrency(priceTRY: number, exchangeRates: ExchangeRates): CurrencyConversion {
  return {
    price: priceTRY,
    priceInUSD: convertCurrency(priceTRY, 'USD', exchangeRates),
    priceInEUR: convertCurrency(priceTRY, 'EUR', exchangeRates),
    exchangeRates
  };
}
