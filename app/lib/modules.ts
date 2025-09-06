export const MODULES = {
  TRANSFER: {
    id: 'transfer',
    name: 'Transfer Yönetimi',
    description: 'Transfer rezervasyonları, şoför yönetimi ve uçuş takibi',
    priceMonthly: 50,
    priceYearly: 500,
    features: [
      'rezervasyon-yonetimi',
      'sofor-yonetimi', 
      'ucus-takibi',
      'musteri-yonetimi',
      'raporlama'
    ]
  },
  ACCOMMODATION: {
    id: 'accommodation',
    name: 'Konaklama Yönetimi',
    description: 'Otel rezervasyonları ve konaklama yönetimi',
    priceMonthly: 75,
    priceYearly: 750,
    features: [
      'otel-rezervasyon',
      'booking-api-entegrasyonu',
      'oda-yonetimi',
      'konaklama-raporlari',
      'musteri-tercihleri'
    ]
  },
  FLIGHT: {
    id: 'flight',
    name: 'Uçuş Yönetimi',
    description: 'Uçuş rezervasyonları ve takibi',
    priceMonthly: 25,
    priceYearly: 250,
    features: [
      'ucus-rezervasyon',
      'ucus-takibi',
      'bilet-yonetimi',
      'ucus-raporlari'
    ]
  }
} as const;

export const MODULE_FEATURES = {
  'rezervasyon-yonetimi': 'Rezervasyon Yönetimi',
  'sofor-yonetimi': 'Şoför Yönetimi',
  'ucus-takibi': 'Uçuş Takibi',
  'musteri-yonetimi': 'Müşteri Yönetimi',
  'raporlama': 'Raporlama',
  'otel-rezervasyon': 'Otel Rezervasyonu',
  'booking-api-entegrasyonu': 'Booking.com API Entegrasyonu',
  'oda-yonetimi': 'Oda Yönetimi',
  'konaklama-raporlari': 'Konaklama Raporları',
  'musteri-tercihleri': 'Müşteri Tercihleri',
  'ucus-rezervasyon': 'Uçuş Rezervasyonu',
  'bilet-yonetimi': 'Bilet Yönetimi',
  'ucus-raporlari': 'Uçuş Raporları'
} as const;

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Temel',
    price: 0,
    modules: ['transfer']
  },
  PROFESSIONAL: {
    id: 'professional', 
    name: 'Profesyonel',
    price: 100,
    modules: ['transfer', 'accommodation']
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Kurumsal', 
    price: 200,
    modules: ['transfer', 'accommodation', 'flight']
  }
} as const;

export type ModuleId = keyof typeof MODULES;
export type FeatureId = keyof typeof MODULE_FEATURES;
export type PlanId = keyof typeof SUBSCRIPTION_PLANS;
