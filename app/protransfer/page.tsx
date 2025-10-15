'use client';

import { useMemo } from 'react';
import SerefVuralTemplate from '../components/website/SerefVuralTemplate';

// Varsayılan içerik (panel verisi yoksa fallback) - Full demo content
const defaultContent = {
  companyName: "Pro Transfer",
  tagline: "İstanbul Havalimanı Transfer Hizmeti",
  description: "İstanbul Havalimanı'ndan şehir merkezine konforlu ve güvenli transfer hizmeti. Profesyonel şoförlerimiz ve Mercedes Vito araçlarımızla 7/24 hizmetinizdeyiz. Ayrıca İstanbul, Sapanca, Bursa, Abant turları ve kaliteli otel konaklama seçenekleri sunuyoruz.",
  phone: "+905545812034",
  whatsapp: "+905545812034",
  email: "info@serefvural.com",
  vehicleImages: [
    '/vehicles/vito-1.jpg',
    '/vehicles/vito-2.jpg',
    '/vehicles/vito-3.jpg',
    '/vehicles/vito-4.jpg',
    '/vehicles/vito-5.jpg',
    '/vehicles/vito-6.jpg',
    '/vehicles/vito-7.jpg',
    '/vehicles/vito-8.jpg',
    '/vehicles/vito-9.jpg',
    '/vehicles/vito-10.jpg',
    '/vehicles/vito-11.jpg',
    '/vehicles/vito-12.jpg'
  ],
  vehicles: [
    {
      id: 1,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/vehicles/vito-1.jpg"
    },
    {
      id: 2,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/vehicles/vito-2.jpg"
    },
    {
      id: 3,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/vehicles/vito-3.jpg"
    },
    {
      id: 4,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/vehicles/vito-4.jpg"
    },
    {
      id: 5,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/vehicles/vito-5.jpg"
    },
    {
      id: 6,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/vehicles/vito-6.jpg"
    },
    {
      id: 7,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/vehicles/vito-7.jpg"
    },
    {
      id: 8,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/vehicles/vito-8.jpg"
    },
    {
      id: 9,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/vehicles/vito-9.jpg"
    },
    {
      id: 10,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/vehicles/vito-10.jpg"
    }
  ],
  tours: [
    {
      id: 1,
      name: "İstanbul Tarihi Yarımada Turu",
      description: "İstanbul'un en önemli tarihi mekanlarını keşfedin. Ayasofya, Sultanahmet Camii, Topkapı Sarayı ve daha fazlası.",
      duration: "8 saat",
      capacity: "7 kişilik kapasite",
      rating: 4.8,
      image: "/seref-vural-tours/istanbul/1.svg",
      prices: {
        TRY: 4500,
        USD: 150,
        EUR: 140
      },
      showPrice: true
    },
    {
      id: 2,
      name: "Sapanca Doğa Turu",
      description: "Sapanca Gölü çevresinde doğa yürüyüşü ve piknik. Temiz hava ve muhteşem manzara.",
      duration: "6 saat",
      capacity: "7 kişilik kapasite",
      rating: 4.6,
      image: "/seref-vural-tours/sapanca/1.svg",
      prices: {
        TRY: 3600,
        USD: 120,
        EUR: 110
      },
      showPrice: true
    },
    {
      id: 3,
      name: "Bursa Tarihi ve Kültürel Tur",
      description: "Osmanlı İmparatorluğu'nun ilk başkenti Bursa'yı keşfedin. Ulu Camii, Yeşil Türbe ve daha fazlası.",
      duration: "10 saat",
      capacity: "7 kişilik kapasite",
      rating: 4.7,
      image: "/seref-vural-tours/bursa/1.svg",
      prices: {
        TRY: 5400,
        USD: 180,
        EUR: 165
      },
      showPrice: true
    },
    {
      id: 4,
      name: "Abant Gölü Doğa Turu",
      description: "Abant Gölü'nde doğa yürüyüşü ve fotoğraf çekimi. Muhteşem doğa manzaraları.",
      duration: "7 saat",
      capacity: "7 kişilik kapasite",
      rating: 4.5,
      image: "/seref-vural-tours/abant/1.svg",
      prices: {
        TRY: 4200,
        USD: 140,
        EUR: 130
      },
      showPrice: true
    }
  ],
  hotels: [
    {
      id: 1,
      name: "Grand Hotel İstanbul",
      location: "Sultanahmet, İstanbul",
      description: "Sultanahmet'te lüks konaklama. Tarihi yarımadaya yürüme mesafesi.",
      rating: 4.9,
      features: ["WiFi", "Klima", "Oda Servisi", "Spa", "Fitness"],
      image: "/seref-vural-images/hotels/sultanahmet-palace.svg",
      prices: {
        TRY: 6000,
        USD: 200,
        EUR: 185
      },
      showPrice: true
    },
    {
      id: 2,
      name: "Sapanca Resort Hotel",
      location: "Sapanca, Sakarya",
      description: "Sapanca Gölü manzaralı doğa oteli. Huzurlu ve sakin bir tatil.",
      rating: 4.6,
      features: ["WiFi", "Klima", "Havuz", "Restoran", "Park Alanı"],
      image: "/seref-vural-images/hotels/modern-istanbul.svg",
      prices: {
        TRY: 4500,
        USD: 150,
        EUR: 140
      },
      showPrice: true
    }
  ],
  features: [
    {
      id: 1,
      title: "7/24 Hizmet",
      description: "Her zaman yanınızdayız",
      icon: "clock"
    },
    {
      id: 2,
      title: "Sabit Fiyat",
      description: "Sürpriz yok",
      icon: "dollar"
    },
    {
      id: 3,
      title: "Profesyonel Şoför",
      description: "Deneyimli kadro",
      icon: "user"
    },
    {
      id: 4,
      title: "7 Kişilik Kapasite",
      description: "Mercedes Vito",
      icon: "users"
    }
  ],
  testimonials: [
    {
      name: "Ahmet Y.",
      text: "Çok profesyonel hizmet. Şoförümüz çok nazikti ve zamanında geldi. Kesinlikle tavsiye ederim.",
      rating: 5,
      type: "Transfer"
    },
    {
      name: "Fatma K.",
      text: "Uçuşum gecikmişti ama şoförümüz sabırla bekledi. Araç çok temiz ve konforluydu.",
      rating: 5,
      type: "Transfer"
    },
    {
      name: "Mehmet S.",
      text: "İstanbul Havalimanı'ndan şehir merkezine çok rahat bir yolculuk yaptık. Teşekkürler Pro Transfer.",
      rating: 5,
      type: "Transfer"
    }
  ],
  faq: [
    {
      question: "Rezervasyon nasıl yapılır?",
      answer: "Rezervasyon yapmak için 'Rezervasyon Talebi Gönder' butonuna tıklayın veya WhatsApp'tan bizimle iletişime geçin."
    },
    {
      question: "Fiyatlar sabit mi?",
      answer: "Evet, fiyatlarımız tamamen sabittir. Konumları girdiğiniz anda ücretinizi anında görürsünüz."
    },
    {
      question: "Uçuş gecikmesi durumunda ne olur?",
      answer: "Uçuşunuzu takip ederiz ve gecikme durumunda ek ücret almadan bekleriz."
    },
    {
      question: "Bagaj limiti var mı?",
      answer: "Mercedes Vito araçlarımız geniş bagaj kapasitesine sahiptir. Normal seyahat bagajları için limit yoktur."
    },
    {
      question: "Bebek koltuğu mevcut mu?",
      answer: "Evet, bebek koltuğu hizmetimiz mevcuttur. Rezervasyon yaparken bu talebinizi belirtmeniz yeterlidir."
    }
  ],
  stats: {
    happyCustomers: "500+",
    serviceHours: "7/24",
    rating: "4.9/5"
  }
};

export default function ProtransferWebsitePage() {
  const settings = useMemo(() => ({
    companyName: 'Pro Transfer',
    heroTitle: 'İstanbul Havalimanı Transfer Hizmeti',
    heroSubtitle: 'Konforlu, güvenli ve profesyonel transfer, tur ve konaklama hizmetleri',
    contactInfo: {
      phone: '+905545812034',
      email: 'info@protransfer.com.tr',
      address: 'İstanbul',
      whatsapp: '+905545812034',
    },
    socialMedia: {},
    colorScheme: {
      primary: '#16a34a',
      secondary: '#065f46',
      accent: '#22c55e',
    },
  }), []);

  return <SerefVuralTemplate settings={settings} />;
}


