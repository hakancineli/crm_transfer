'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Calendar, Clock, Shield, Baby, Building, CheckCircle, MapPin, Star, Users, Wifi, Car, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface SerefVuralTemplateProps {
  settings: {
    companyName: string;
    heroTitle: string;
    heroSubtitle: string;
    contactInfo: {
      phone: string;
      email: string;
      address: string;
      whatsapp: string;
    };
    socialMedia: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
}

const vehicleImages = [
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
  '/vehicles/vito-12.jpg',
];

export default function SerefVuralTemplate({ settings }: SerefVuralTemplateProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === vehicleImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? vehicleImages.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === vehicleImages.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleWhatsAppTransfer = () => {
    const message = `Merhaba! ${settings.companyName} transfer hizmeti hakkında bilgi almak istiyorum.`;
    const whatsappUrl = `https://wa.me/${settings.contactInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleReservationTransfer = () => {
    const message = `Merhaba! ${settings.companyName} rezervasyon yapmak istiyorum.`;
    const whatsappUrl = `https://wa.me/${settings.contactInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const features = [
    {
      icon: Clock,
      title: "Uçuş Takibi",
      description: "Uçuşunuzu takip eder, gecikme durumunda bekleriz",
      category: "Transfer"
    },
    {
      icon: Shield,
      title: "Karşılama Hizmeti",
      description: "Havalimanında karşılar, bagajlarınızı taşırız",
      category: "Transfer"
    },
    {
      icon: Baby,
      title: "Bebek Koltuğu",
      description: "Bebek koltuğu ve özel taleplere hızlı cevap",
      category: "Transfer"
    },
    {
      icon: Building,
      title: "Kurumsal Transfer",
      description: "Kurumsal sözleşmeli transfer seçenekleri",
      category: "Transfer"
    },
    {
      icon: MapPin,
      title: "Profesyonel Rehber",
      description: "Deneyimli rehberlerimizle unutulmaz turlar",
      category: "Tur"
    },
    {
      icon: Star,
      title: "Kaliteli Konaklama",
      description: "Seçkin otellerimizde konforlu konaklama",
      category: "Otel"
    },
    {
      icon: Users,
      title: "Aile Dostu",
      description: "Tüm aile üyeleri için uygun hizmetler",
      category: "Genel"
    },
    {
      icon: Wifi,
      title: "Modern Konfor",
      description: "WiFi, klima ve modern konfor imkanları",
      category: "Otel"
    }
  ];

  if (!settings) {
    return <div>Website ayarları yükleniyor...</div>;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Sol Taraf - İçerik */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
                {settings.heroTitle}
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                {settings.heroSubtitle}
              </p>

              {/* CTA Butonları */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={handleReservationTransfer}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Calendar className="mr-2" size={20} />
                  Rezervasyon Yap
                </button>
                
                <button 
                  onClick={handleWhatsAppTransfer}
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <MessageCircle className="mr-2" size={20} />
                  WhatsApp İletişim
                </button>
              </div>

              {/* Özellik Kartları */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-green-600 font-semibold mb-1">7/24 Hizmet</div>
                  <div className="text-sm text-gray-600">Günün her saati hizmetinizdeyiz</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-green-600 font-semibold mb-1">Sabit Fiyat</div>
                  <div className="text-sm text-gray-600">Gizli ücret yok, şeffaf fiyatlandırma</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-green-600 font-semibold mb-1">Profesyonel Şoförler</div>
                  <div className="text-sm text-gray-600">Deneyimli ve güvenilir şoför kadromuz</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-green-600 font-semibold mb-1">Modern Araçlar</div>
                  <div className="text-sm text-gray-600">Konforlu ve güvenli araç filomuz</div>
                </div>
              </div>
            </div>

            {/* Sağ Taraf - VehicleSlider */}
            <div className="lg:pl-8">
              <div className="relative w-full max-w-4xl mx-auto">
                {/* Ana Slider Container */}
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                  >
                    {vehicleImages.map((image, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        <div className="relative h-64 sm:h-80 md:h-96">
                          <Image
                            src={image}
                            alt={`Mercedes Vito ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
                    aria-label="Önceki araç"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
                    aria-label="Sonraki araç"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Dots Indicator */}
                <div className="flex justify-center mt-4 space-x-2">
                  {vehicleImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentIndex 
                          ? 'bg-green-600 scale-110' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Araç ${index + 1}'e git`}
                    />
                  ))}
                </div>

                {/* Vehicle Info */}
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Lüks Araç Filomuz
                  </h3>
                  <p className="text-gray-600">
                    Mercedes, BMW ve diğer premium markalar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Daily Tours / Günlük Turlar</h2>
            <p className="text-lg text-gray-600">İstanbul ve çevresindeki popüler tur rotaları</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Istanbul City Tour', tr: 'İstanbul Şehir Turu', img: '/seref-vural-tours/istanbul/1.svg', rating: 4.8 },
              { title: 'Sapanca Nature Tour', tr: 'Sapanca Doğa Turu', img: '/seref-vural-tours/sapanca/1.svg', rating: 4.6 },
              { title: 'Bursa Historical Tour', tr: 'Bursa Tarihi Turu', img: '/seref-vural-tours/bursa/1.svg', rating: 4.7 },
              { title: 'Abant Lake Tour', tr: 'Abant Gölü Turu', img: '/seref-vural-tours/abant/1.svg', rating: 4.5 },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="relative h-44">
                  <img src={t.img} alt={t.title} className="object-cover w-full h-full" />
                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-green-600">
                    ⭐ {t.rating}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-sm text-gray-500">{t.title}</div>
                  <div className="text-lg font-semibold text-gray-900">{t.tr}</div>
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={handleReservationTransfer}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-semibold"
                    >
                      Rezervasyon Yap
                    </button>
                    <button
                      onClick={handleWhatsAppTransfer}
                      className="text-green-700 text-sm underline"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      <section id="hotels" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Hotel Accommodation / Otel Konaklaması</h2>
            <p className="text-lg text-gray-600">İstanbul'da konforlu ve güvenli konaklama seçenekleri</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Grand Hotel Istanbul', tr: 'Grand Otel İstanbul', loc: 'Sultanahmet, İstanbul', img: '/seref-vural-images/hotels/sultanahmet-palace.svg', rating: 4.9, price: 250 },
              { title: 'Sapanca Resort Hotel', tr: 'Sapanca Resort Otel', loc: 'Sapanca, Sakarya', img: '/seref-vural-images/hotels/modern-istanbul.svg', rating: 4.6, price: 180 },
              { title: 'Bursa Thermal Hotel', tr: 'Bursa Termal Otel', loc: 'Çekirge, Bursa', img: '/seref-vural-images/hotels/old-city-inn.svg', rating: 4.7, price: 220 },
              { title: 'Abant Nature Hotel', tr: 'Abant Doğa Oteli', loc: 'Abant, Bolu', img: '/seref-vural-images/hotels/bosphorus-hotel.svg', rating: 4.4, price: 160 },
            ].map((h, i) => (
              <div key={i} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="relative h-44">
                  <img src={h.img} alt={h.title} className="object-cover w-full h-full" />
                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-green-600">
                    ⭐ {h.rating}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-sm text-gray-500">{h.title}</div>
                  <div className="text-lg font-semibold text-gray-900">{h.tr}</div>
                  <div className="text-sm text-gray-500 mt-1">{h.loc}</div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-2xl font-bold text-green-600">${'{'}h.price{'}'}</div>
                    <button
                      onClick={handleReservationTransfer}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-semibold"
                    >
                      Rezervasyon Yap
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Neden {settings.companyName}?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Profesyonel hizmet anlayışımız ve müşteri memnuniyeti odaklı yaklaşımımızla 
              İstanbul'un en güvenilir transfer, tur ve konaklama hizmeti sunuyoruz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-green-600" size={32} />
                </div>
                <div className="mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feature.category === 'Transfer' ? 'bg-blue-100 text-blue-800' :
                    feature.category === 'Tur' ? 'bg-green-100 text-green-800' :
                    feature.category === 'Otel' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {feature.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Fiyat Bilgilendirmesi */}
          <div className="bg-green-50 rounded-xl p-8 text-center">
            <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Şeffaf Fiyatlandırma
            </h3>
            <p className="text-lg text-gray-700">
              Konumları girdiğiniz anda ücretinizi anında görün. Sabit fiyat, sürpriz yok.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Bize Ulaşın</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Sorularınız veya rezervasyon talepleriniz için bizimle iletişime geçin.
          </p>
          <div className="flex justify-center space-x-6">
            {settings.contactInfo.phone && (
              <a href={`tel:${settings.contactInfo.phone}`} className="text-gray-600 hover:text-gray-900">
                <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.135a11.042 11.042 0 005.516 5.516l1.135-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                </svg>
                {settings.contactInfo.phone}
              </a>
            )}
            {settings.contactInfo.email && (
              <a href={`mailto:${settings.contactInfo.email}`} className="text-gray-600 hover:text-gray-900">
                <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {settings.contactInfo.email}
              </a>
            )}
            {settings.contactInfo.whatsapp && (
              <a href={`https://wa.me/${settings.contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4-4m-4 4l-4-4m4 4l-4 4m4-4l4 4M12 6v.01M12 12v.01M12 18v.01" />
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 {settings.companyName}. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </main>
  );
}