'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Calendar, MapPin, Clock, Users, Star, Phone, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import ReservationForm from '../components/ReservationForm';

// Varsayılan içerik (panel verisi yoksa fallback) - Full demo content
const defaultContent = {
  companyName: "Şeref Vural Travel",
  tagline: "İstanbul Havalimanı Transfer Hizmeti",
  description: "İstanbul Havalimanı'ndan şehir merkezine konforlu ve güvenli transfer hizmeti. Profesyonel şoförlerimiz ve Mercedes Vito araçlarımızla 7/24 hizmetinizdeyiz. Ayrıca İstanbul, Sapanca, Bursa, Abant turları ve kaliteli otel konaklama seçenekleri sunuyoruz.",
  phone: "+90 531 945 89 31",
  whatsapp: "+90 531 945 89 31",
  email: "info@serefvural.com",
  vehicleImages: [
    '/seref-vural-images/mercedes-vito-1.jpg',
    '/seref-vural-images/mercedes-vito-2.jpg',
    '/seref-vural-images/mercedes-vito-3.jpg',
    '/seref-vural-images/mercedes-vito-4.jpg',
    '/seref-vural-images/mercedes-vito-5.jpg',
    '/seref-vural-images/mercedes-vito-6.jpg',
    '/seref-vural-images/mercedes-vito-7.jpg',
    '/seref-vural-images/mercedes-vito-8.jpg',
    '/seref-vural-images/mercedes-vito-9.jpg',
    '/seref-vural-images/mercedes-vito-10.jpg'
  ],
  vehicles: [
    {
      id: 1,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-1.jpg"
    },
    {
      id: 2,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-2.jpg"
    },
    {
      id: 3,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-3.jpg"
    },
    {
      id: 4,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-4.jpg"
    },
    {
      id: 5,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-5.jpg"
    },
    {
      id: 6,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-6.jpg"
    },
    {
      id: 7,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-7.jpg"
    },
    {
      id: 8,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-8.jpg"
    },
    {
      id: 9,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-9.jpg"
    },
    {
      id: 10,
      name: "Mercedes Vito",
      capacity: "7 kişilik kapasite",
      features: "Klima • WiFi • Profesyonel şoför",
      image: "/seref-vural-images/mercedes-vito-10.jpg"
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
      image: "/seref-vural-tours/istanbul/1-1.jpeg",
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
      image: "/seref-vural-tours/sapanca/1-1.jpeg",
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
      image: "/seref-vural-tours/bursa/1-1.jpeg",
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
      image: "/seref-vural-tours/abant/1-1.jpeg",
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
      text: "İstanbul Havalimanı'ndan şehir merkezine çok rahat bir yolculuk yaptık. Teşekkürler Şeref Vural Travel.",
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
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);
  const [websiteContent, setWebsiteContent] = useState<any>(null);

  useEffect(() => {
    if (!websiteContent) return;
    
    const interval = setInterval(() => {
      setCurrentVehicleIndex((prev) => prev === (websiteContent?.vehicleImages?.length || defaultContent.vehicleImages.length) - 1 ? 0 : prev + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, [websiteContent?.vehicleImages?.length]);

  // Panel içeriğini domaine göre çek (default içerik ile)
  useEffect(() => {
    const load = async () => {
      try {
        const host = window.location.hostname;
        const res = await fetch(`/api/website/content/${host}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.content) {
            setWebsiteContent(JSON.parse(data.content));
          } else {
            // API'den içerik gelmezse default içerik kullan
            setWebsiteContent(defaultContent);
          }
        } else {
          // API hatası durumunda default içerik kullan
          setWebsiteContent(defaultContent);
        }
      } catch (_) {
        // Hata durumunda default içerik kullan
        setWebsiteContent(defaultContent);
      }
    };
    load();
  }, []);

  const handleWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const phone = (websiteContent?.contact?.whatsapp || defaultContent.whatsapp).replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const tenantId = 'protransfer';

  // İçerik kaynakları (panel > varsayılan)
  const companyName = websiteContent?.companyName || websiteContent?.settings?.companyName || defaultContent.companyName;
  const tagline = websiteContent?.tagline || websiteContent?.settings?.heroTitle || defaultContent.tagline;
  const description = websiteContent?.description || websiteContent?.settings?.heroSubtitle || defaultContent.description;
  const phone = websiteContent?.contact?.phone || websiteContent?.settings?.contactInfo?.phone || defaultContent.phone;
  const whatsapp = websiteContent?.contact?.whatsapp || websiteContent?.settings?.contactInfo?.whatsapp || defaultContent.whatsapp;
  const email = websiteContent?.contact?.email || websiteContent?.settings?.contactInfo?.email || defaultContent.email;
  const vehicleImages: string[] = websiteContent?.vehicleImages || defaultContent.vehicleImages;
  
  // Demo içerikleri
  const vehicles = websiteContent?.vehicles || defaultContent.vehicles;
  const tours = websiteContent?.tours || defaultContent.tours;
  const hotels = websiteContent?.hotels || defaultContent.hotels;
  const features = websiteContent?.features || defaultContent.features;
  const testimonials = websiteContent?.testimonials || defaultContent.testimonials;
  const faq = websiteContent?.faq || defaultContent.faq;
  const stats = websiteContent?.stats || defaultContent.stats;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#tours" className="text-gray-600 hover:text-green-600">Turlar</a>
              <a href="#hotels" className="text-gray-600 hover:text-green-600">Oteller</a>
              <a href="#transfer" className="text-gray-600 hover:text-green-600">Transfer</a>
              <a href="#contact" className="text-gray-600 hover:text-green-600">İletişim</a>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">🇹🇷 Türkçe</span>
            </div>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-b from-white to-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
                {companyName} - {tagline}
              </h1>
              <p className="text-lg text-gray-600 mb-8">{description}</p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button onClick={() => setIsReservationFormOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center">
                  <Calendar className="mr-2" size={20} />
                  Rezervasyon Talebi Gönder
                </button>
                <button onClick={() => handleWhatsApp('Merhaba! Bilgi almak istiyorum.')} className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center">
                  <MessageCircle className="mr-2" size={20} />
                  WhatsApp'tan Yaz
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: '7/24 Hizmet', description: 'Her zaman yanınızdayız' },
                  { title: 'Sabit Fiyat', description: 'Sürpriz yok' },
                  { title: 'Profesyonel Şoför', description: 'Deneyimli kadro' },
                  { title: '7 Kişilik Kapasite', description: 'Mercedes Vito' },
                ].map((f, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-green-600 font-semibold mb-1">{f.title}</div>
                    <div className="text-sm text-gray-600">{f.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:pl-8">
              <div className="relative w-full max-w-4xl mx-auto">
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentVehicleIndex * 100}%)` }}>
                    {vehicleImages.map((image, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        <div className="relative h-64 sm:h-80 md:h-96">
                          <Image src={image} alt={`Mercedes Vito ${index + 1}`} fill className="object-cover" priority={index === 0} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center mt-4 space-x-2">
                  {vehicleImages.map((_, index) => (
                    <button key={index} onClick={() => setCurrentVehicleIndex(index)} className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentVehicleIndex ? 'bg-green-600 scale-110' : 'bg-gray-300 hover:bg-gray-400'}`} />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Mercedes Vito Transfer Aracı</h3>
                  <p className="text-gray-600">7 kişilik kapasite • Klima • WiFi • Profesyonel şoför</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Günlük Turlar */}
      <section id="tours" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Günlük Turlar</h2>
            <p className="text-lg text-gray-600">İstanbul ve çevresindeki en popüler destinasyonlara günlük turlar</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tours.map((tour: any) => (
              <div key={tour.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="relative h-48">
                  <Image src={tour.image} alt={tour.name} fill className="object-cover" />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-green-600">
                    ⭐ {tour.rating}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tour.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tour.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">{tour.duration}</span>
                    <span className="text-sm text-gray-500">{tour.capacity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">${tour.prices.USD}</span>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Rezervasyon Yap
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Otel Konaklama */}
      <section id="hotels" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Otel Konaklama</h2>
            <p className="text-lg text-gray-600">İstanbul'da konforlu ve güvenli konaklama seçenekleri</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {hotels.map((hotel: any) => (
              <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="relative h-48">
                  <Image src={hotel.image} alt={hotel.name} fill className="object-cover" />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-green-600">
                    ⭐ {hotel.rating}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{hotel.location}</p>
                  <p className="text-gray-600 text-sm mb-4">{hotel.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.features.map((feature: string, index: number) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">${hotel.prices.USD}</span>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Rezervasyon Yap
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neden Şeref Vural Travel? */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Neden Şeref Vural Travel?</h2>
            <p className="text-lg text-gray-600">Profesyonel hizmet anlayışımız ve müşteri memnuniyeti odaklı yaklaşımımızla İstanbul'un en güvenilir transfer, tur ve konaklama hizmeti sunuyoruz.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Uçuş Takibi", description: "Uçuşunuzu takip eder, gecikme durumunda bekleriz", icon: "✈️" },
              { title: "Karşılama Hizmeti", description: "Havalimanında karşılar, bagajlarınızı taşırız", icon: "👋" },
              { title: "Bebek Koltuğu", description: "Bebek koltuğu ve özel taleplere hızlı cevap", icon: "👶" },
              { title: "Kurumsal Transfer", description: "Kurumsal sözleşmeli transfer seçenekleri", icon: "🏢" }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Müşteri Yorumları */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Müşteri Yorumları</h2>
            <p className="text-lg text-gray-600">Müşterilerimizin deneyimlerini okuyun</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{testimonial.type}</span>
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">2 gün önce</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200">
              <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
              <span className="text-lg font-semibold text-gray-900">{stats.rating}</span>
              <span className="text-gray-500 ml-2">Google Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sık Sorulan Sorular */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Sık Sorulan Sorular</h2>
            <p className="text-lg text-gray-600">Merak ettiğiniz soruların cevapları</p>
          </div>
          <div className="space-y-6">
            {faq.map((item: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.question}</h3>
                <p className="text-gray-700">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hazır mısınız? */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Hazır mısınız?</h2>
          <p className="text-lg text-green-100 mb-8">İstanbul Havalimanı transfer hizmetimizden yararlanmaya hazır olduğunuzu belirten metin. Profesyonel ekibimiz ve konforlu araçlarımızla güvenli bir yolculuk için rezervasyon yapın.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setIsReservationFormOpen(true)} className="bg-white hover:bg-gray-100 text-green-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center">
              <Calendar className="mr-2" size={20} />
              Rezervasyon Talebi Gönder
            </button>
            <button onClick={() => handleWhatsApp('Merhaba! Bilgi almak istiyorum.')} className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center">
              <MessageCircle className="mr-2" size={20} />
              WhatsApp'tan Yaz
            </button>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">{stats.happyCustomers}</div>
              <div className="text-gray-300">Mutlu Müşteri</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">{stats.serviceHours}</div>
              <div className="text-gray-300">Hizmet</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">{stats.rating}</div>
              <div className="text-gray-300">Müşteri Puanı</div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">İletişim</h2>
            <p className="text-lg text-gray-600">Bizimle iletişime geçin</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-8 h-8 text-green-600" /></div>
              <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} className="text-green-600 font-semibold" target="_blank" rel="noopener noreferrer">{whatsapp}</a>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Phone className="w-8 h-8 text-green-600" /></div>
              <a href={`tel:${phone}`} className="text-green-600 font-semibold">{phone}</a>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8 text-green-600" /></div>
              <a href={`mailto:${email}`} className="text-green-600 font-semibold">{email}</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">{companyName}</h3>
            <p className="text-gray-400 mb-4">İstanbul'un en güvenilir transfer, tur ve konaklama hizmeti</p>
            <div className="flex justify-center space-x-6">
              <a href={`tel:${phone}`} className="text-gray-400 hover:text-white">{phone}</a>
              <a href={`mailto:${email}`} className="text-gray-400 hover:text-white">{email}</a>
            </div>
          </div>
        </div>
      </footer>

      <ReservationForm isOpen={isReservationFormOpen} onClose={() => setIsReservationFormOpen(false)} tenantId={tenantId} />
    </div>
  );
}


