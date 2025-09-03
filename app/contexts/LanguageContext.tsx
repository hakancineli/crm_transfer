'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'tr' | 'en' | 'de' | 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Basit çeviri fonksiyonu
const translations: Record<string, Record<Language, string>> = {
  'landing.title': {
    tr: 'İstanbul Transfer & VIP Transfer Hizmeti',
    en: 'Istanbul Transfer & VIP Transfer Service',
    de: 'Istanbul Transfer & VIP Transfer Service',
    fr: 'Service de Transfert Istanbul & VIP',
    ar: 'خدمة النقل في اسطنبول والفخامة'
  },
  'landing.description': {
    tr: 'İstanbul Havalimanı ve Sabiha Gökçen transfer hizmeti. 7/24 VIP Mercedes Vito, lüks sedan ve şehirler arası transfer.',
    en: 'Istanbul Airport and Sabiha Gokcen transfer service. 24/7 VIP Mercedes Vito, luxury sedan and intercity transfer.',
    de: 'Istanbul Flughafen und Sabiha Gokcen Transfer Service. 24/7 VIP Mercedes Vito, Luxuslimousine und Überlandtransfer.',
    fr: 'Service de transfert aéroport d\'Istanbul et Sabiha Gokcen. 24/7 Mercedes Vito VIP, berline de luxe et transfert interurbain.',
    ar: 'خدمة النقل من مطار اسطنبول وصبيحة جوكجن. 24/7 مرسيدس فيتو VIP وسيدان فاخر ونقل بين المدن.'
  },
  'landing.sendRequest': {
    tr: 'Rezervasyon Yap',
    en: 'Make Reservation',
    de: 'Reservierung machen',
    fr: 'Faire une réservation',
    ar: 'احجز الآن'
  },
  'landing.whatsappWrite': {
    tr: 'WhatsApp\'tan Yaz',
    en: 'Write on WhatsApp',
    de: 'Auf WhatsApp schreiben',
    fr: 'Écrire sur WhatsApp',
    ar: 'اكتب على واتساب'
  },
  'landing.whatsappMessage': {
    tr: 'Merhaba, transfer hizmeti hakkında bilgi almak istiyorum.',
    en: 'Hello, I would like to get information about transfer service.',
    de: 'Hallo, ich möchte Informationen über den Transfer-Service erhalten.',
    fr: 'Bonjour, je souhaite obtenir des informations sur le service de transfert.',
    ar: 'مرحبا، أود الحصول على معلومات حول خدمة النقل.'
  },
  'landing.service24h': {
    tr: '7/24 Hizmet',
    en: '24/7 Service',
    de: '24/7 Service',
    fr: 'Service 24/7',
    ar: 'خدمة 24/7'
  },
  'landing.fixedPrice': {
    tr: 'Sabit Fiyat',
    en: 'Fixed Price',
    de: 'Fester Preis',
    fr: 'Prix fixe',
    ar: 'سعر ثابت'
  },
  'landing.professionalDriver': {
    tr: 'Profesyonel Şoför',
    en: 'Professional Driver',
    de: 'Professioneller Fahrer',
    fr: 'Chauffeur professionnel',
    ar: 'سائق محترف'
  },
  'landing.capacity': {
    tr: 'Geniş Kapasite',
    en: 'Large Capacity',
    de: 'Große Kapazität',
    fr: 'Grande capacité',
    ar: 'سعة كبيرة'
  },
  'landing.whyProTransfer': {
    tr: 'Neden ProTransfer?',
    en: 'Why ProTransfer?',
    de: 'Warum ProTransfer?',
    fr: 'Pourquoi ProTransfer?',
    ar: 'لماذا ProTransfer؟'
  },
  'landing.flightTracking': {
    tr: 'Uçuş Takibi',
    en: 'Flight Tracking',
    de: 'Flugverfolgung',
    fr: 'Suivi de vol',
    ar: 'تتبع الرحلة'
  },
  'landing.meetGreet': {
    tr: 'Karşılama Hizmeti',
    en: 'Meet & Greet Service',
    de: 'Meet & Greet Service',
    fr: 'Service de rencontre et d\'accueil',
    ar: 'خدمة اللقاء والترحيب'
  },
  'landing.childSeat': {
    tr: 'Bebek Koltuğu',
    en: 'Child Seat',
    de: 'Kindersitz',
    fr: 'Siège enfant',
    ar: 'مقعد الطفل'
  },
  'landing.corporateOptions': {
    tr: 'Kurumsal Seçenekler',
    en: 'Corporate Options',
    de: 'Unternehmensoptionen',
    fr: 'Options d\'entreprise',
    ar: 'خيارات الشركات'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('tr');

  const t = (key: string): string => {
    const translation = translations[key]?.[language];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
