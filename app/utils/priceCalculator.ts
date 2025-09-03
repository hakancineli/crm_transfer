export interface PriceCalculation {
  price: number;
  currency: string;
  distanceKm: number;
  priceInUSD?: number;
  priceInEUR?: number;
  exchangeRates?: {
    TRY: number;
    USD: number;
    EUR: number;
  };
}

export function calculatePrice(from: string, to: string, currency: 'TRY' | 'USD' | 'EUR' = 'TRY', distanceKm?: number): PriceCalculation {
  // Mesafe hesaplama - eğer distanceKm verilmişse onu kullan, yoksa tahmin et
  const calculatedDistanceKm = distanceKm || estimateDistance(from, to);
  
  // Fiyat tarifesi
  let priceTRY = 0;
  if (calculatedDistanceKm <= 10) {
    priceTRY = 800;
  } else if (calculatedDistanceKm <= 20) {
    priceTRY = 1100;
  } else if (calculatedDistanceKm <= 30) {
    priceTRY = 1400;
  } else if (calculatedDistanceKm <= 40) {
    priceTRY = 1500;
  } else if (calculatedDistanceKm <= 45) {
    priceTRY = 1700;
  } else if (calculatedDistanceKm <= 50) {
    priceTRY = 1850;
  } else if (calculatedDistanceKm <= 60) {
    priceTRY = 2200;
  } else if (calculatedDistanceKm <= 70) {
    priceTRY = 2300;
  } else if (calculatedDistanceKm <= 80) {
    priceTRY = 2400;
  } else if (calculatedDistanceKm <= 90) {
    priceTRY = 2500;
  } else {
    // 90 km üzeri için km başına ek ücret
    priceTRY = 2500 + Math.ceil((calculatedDistanceKm - 90) / 10) * 300;
  }

  // Döviz kurları (gerçek uygulamada API'den alınabilir)
  const usdRate = 32.5; // 1 USD = 32.5 TRY
  const eurRate = 35.2; // 1 EUR = 35.2 TRY

  let price = priceTRY;
  let priceInUSD = priceTRY / usdRate;
  let priceInEUR = priceTRY / eurRate;

  if (currency === 'USD') {
    price = priceInUSD;
  } else if (currency === 'EUR') {
    price = priceInEUR;
  }

  return {
    price: Math.round(price * 100) / 100,
    currency,
    distanceKm: Math.round(calculatedDistanceKm * 10) / 10,
    priceInUSD: Math.round(priceInUSD * 100) / 100,
    priceInEUR: Math.round(priceInEUR * 100) / 100
  };
}

function estimateDistance(from: string, to: string): number {
  // Basit mesafe tahmini - gerçek uygulamada Google Maps API kullanılmalı
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();
  
  // Havalimanları
  if (fromLower.includes('ist') || toLower.includes('ist')) {
    if (fromLower.includes('saw') || toLower.includes('saw')) {
      return 85; // IST - SAW arası
    }
    if (fromLower.includes('beşiktaş') || toLower.includes('beşiktaş')) {
      return 45; // IST - Beşiktaş
    }
    if (fromLower.includes('kadıköy') || toLower.includes('kadıköy')) {
      return 55; // IST - Kadıköy
    }
    return 40; // Varsayılan IST mesafesi
  }
  
  if (fromLower.includes('saw') || toLower.includes('saw')) {
    if (fromLower.includes('beşiktaş') || toLower.includes('beşiktaş')) {
      return 65; // SAW - Beşiktaş
    }
    if (fromLower.includes('kadıköy') || toLower.includes('kadıköy')) {
      return 45; // SAW - Kadıköy
    }
    return 50; // Varsayılan SAW mesafesi
  }
  
  // Şehirler arası
  if (fromLower.includes('ankara') || toLower.includes('ankara')) {
    return 450;
  }
  if (fromLower.includes('izmir') || toLower.includes('izmir')) {
    return 480;
  }
  if (fromLower.includes('bursa') || toLower.includes('bursa')) {
    return 155;
  }
  if (fromLower.includes('antalya') || toLower.includes('antalya')) {
    return 485;
  }
  
  // Varsayılan mesafe
  return 30;
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const rates = {
    TRY: 1,
    USD: 32.5,
    EUR: 35.2
  };
  
  const fromRate = rates[fromCurrency as keyof typeof rates] || 1;
  const toRate = rates[toCurrency as keyof typeof rates] || 1;
  
  return (amount * fromRate) / toRate;
}
