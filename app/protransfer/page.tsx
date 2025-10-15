'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        if (!host) return;
        const res = await fetch(`/api/website/content/${host}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.content) {
            try {
              setContent(JSON.parse(data.content));
            } catch (_) {
              setContent(null);
            }
          }
          // If default content is being served for this domain and we have tenant id, seed content once
          if (data?.isDefault && data?.tenant?.id && typeof window !== 'undefined') {
            const seededKey = `website_seeded_${host}`;
            if (!localStorage.getItem(seededKey)) {
              const seedContent = {
                tours: [
                  { title: 'Istanbul City Tour', tr: 'İstanbul Şehir Turu', img: '/seref-vural-tours/istanbul/1.svg', rating: 4.6, desc: 'Tarihi yarımada ve simge yapılar', duration: '8 saat', capacity: '7 kişi' },
                  { title: 'Sapanca Nature Tour', tr: 'Sapanca Doğa Turu', img: '/seref-vural-tours/sapanca/1.svg', rating: 4.7, desc: 'Göl kenarı, doğa yürüyüşü, piknik', duration: '6 saat', capacity: '7 kişi' },
                  { title: 'Bursa Historical Tour', tr: 'Bursa Tarihi Turu', img: '/seref-vural-tours/bursa/1.svg', rating: 4.5, desc: 'Ulu Camii, Yeşil Türbe ve çarşı', duration: '10 saat', capacity: '7 kişi' },
                  { title: 'Abant Lake Tour', tr: 'Abant Gölü Turu', img: '/seref-vural-tours/abant/1.svg', desc: 'Göl çevresi, fotoğraf ve mola', duration: '7 saat', capacity: '7 kişi' }
                ],
                hotels: [
                  { title: 'Grand Hotel Istanbul', tr: 'Grand Otel İstanbul', loc: 'Sultanahmet, İstanbul', img: '/seref-vural-images/hotels/sultanahmet-palace.svg', rating: 4.9, price: 250 },
                  { title: 'Sapanca Resort Hotel', tr: 'Sapanca Resort Otel', loc: 'Sapanca, Sakarya', img: '/seref-vural-images/hotels/modern-istanbul.svg', rating: 4.6, price: 180 }
                ],
                boats: [
                  { title: 'Bebek, İstanbul', location: 'Bebek, İstanbul', type: 'Motoryat', capacity: 'Kapasite: 25 kişi', rating: 4.99, pricePerHourTRY: 5500, img: '/tekneturlari/tekne1.avif', gallery: ['/tekneturlari/tekne1.avif','/tekneturlari/tekne2.avif','/tekneturlari/tekne3.avif','/tekneturlari/tekne4.avif'] },
                  { title: 'Eminönü, İstanbul', location: 'Eminönü, İstanbul', type: 'Motoryat', capacity: 'Kapasite: 10 kişi', rating: 4.99, pricePerHourTRY: 3250, img: '/tekneturlari/eminönü1.avif', gallery: ['/tekneturlari/eminönü1.avif','/tekneturlari/eminönü2.avif','/tekneturlari/eminönü3.avif','/tekneturlari/eminönü4.avif','/tekneturlari/eminönü5.avif','/tekneturlari/eminönü6.avif'] }
                ],
                cars: [
                  { title: 'Mercedes Vito', type: 'Minivan', capacity: '7 kişi', pricePerDayTRY: 3500, img: '/vehicles/vito-1.jpg', gallery: ['/vehicles/vito-1.jpg','/vehicles/vito-2.jpg','/vehicles/vito-3.jpg'] },
                  { title: 'Mercedes Vito', type: 'Minivan', capacity: '7 kişi', pricePerDayTRY: 3600, img: '/vehicles/vito-4.jpg', gallery: ['/vehicles/vito-4.jpg','/vehicles/vito-5.jpg'] }
                ]
              };
              try {
                const saveRes = await fetch('/api/website/content', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tenantId: data.tenant.id, content: seedContent })
                });
                if (saveRes.ok) {
                  localStorage.setItem(seededKey, '1');
                  setContent(seedContent);
                }
              } catch (_) {}
            }
          }
        }
      } catch (_) {
        // ignore
      }
    };
    load();
  }, []);
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

  return <SerefVuralTemplate settings={settings} content={content} />;
}


