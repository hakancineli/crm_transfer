'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Calendar, MapPin, Clock, Users, Star, Phone, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import ReservationForm from '../../components/ReservationForm';

// Şeref Vural Travel verileri
const serefVuralData = {
  companyName: "Şeref Vural Travel",
  tagline: "İstanbul Havalimanı Transfer Hizmeti",
  description: "İstanbul Havalimanı'ndan şehir merkezine konforlu ve güvenli transfer hizmeti. Profesyonel şoförlerimiz ve Mercedes Vito araçlarımızla 7/24 hizmetinizdeyiz. Ayrıca İstanbul, Sapanca, Bursa, Abant turları ve kaliteli otel konaklama seçenekleri sunuyoruz.",
  phone: "+90 531 945 89 31",
  whatsapp: "+90 531 945 89 31",
  email: "info@serefvural.com",
  
  features: [
    { title: "7/24 Hizmet", description: "Her zaman yanınızdayız", icon: "🕐" },
    { title: "Sabit Fiyat", description: "Sürpriz yok", icon: "💰" },
    { title: "Profesyonel Şoför", description: "Deneyimli kadro", icon: "👨‍✈️" },
    { title: "7 Kişilik Kapasite", description: "Mercedes Vito", icon: "🚐" }
  ],

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
  ]
};

export default function WebsitePage({ params }: { params: { domain: string } }) {
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);
  const [websiteContent, setWebsiteContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const vehicleImages = websiteContent?.vehicleImages || serefVuralData.vehicleImages;
    
    const interval = setInterval(() => {
      setCurrentVehicleIndex((prev) => 
        prev === vehicleImages.length - 1 ? 0 : prev + 1
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [websiteContent?.vehicleImages]);

  // Fetch website content based on domain
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Get content based on domain
        const response = await fetch(`/api/website/content/${params.domain}`);

        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            setWebsiteContent(JSON.parse(data.content));
          } else {
            // API'den içerik gelmezse default içerik kullan
            setWebsiteContent(serefVuralData);
          }
        } else {
          // API hatası durumunda default içerik kullan
          setWebsiteContent(serefVuralData);
        }
      } catch (error) {
        console.error('Error fetching website content:', error);
        // Hata durumunda default içerik kullan
        setWebsiteContent(serefVuralData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [params.domain]);

  const handleWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${serefVuralData.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
  };

  const handleReservation = () => {
    setIsReservationFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{serefVuralData.companyName}</h1>
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
                {serefVuralData.companyName} - {serefVuralData.tagline}
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                {serefVuralData.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={handleReservation}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Calendar className="mr-2" size={20} />
                  Rezervasyon Talebi Gönder
                </button>
                
                <button 
                  onClick={() => handleWhatsApp("Merhaba! Bilgi almak istiyorum.")}
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <MessageCircle className="mr-2" size={20} />
                  WhatsApp'tan Yaz
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {serefVuralData.features.map((feature, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-green-600 font-semibold mb-1">{feature.title}</div>
                    <div className="text-sm text-gray-600">{feature.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative w-full max-w-4xl mx-auto">
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentVehicleIndex * 100}%)` }}
                  >
                    {serefVuralData.vehicleImages.map((image, index) => (
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
                </div>

                <div className="flex justify-center mt-4 space-x-2">
                  {serefVuralData.vehicleImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVehicleIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentVehicleIndex 
                          ? 'bg-green-600 scale-110' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Mercedes Vito Transfer Aracı
                  </h3>
                  <p className="text-gray-600">
                    7 kişilik kapasite • Klima • WiFi • Profesyonel şoför
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Günlük Turlar
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              İstanbul ve çevresindeki en popüler destinasyonlara günlük turlar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(websiteContent?.tours || [
              {
                id: 1,
                name: "İstanbul Tarihi Yarımada Turu",
                description: "İstanbul'un en önemli tarihi mekanlarını keşfedin. Ayasofya, Sultanahmet Camii, Topkapı Sarayı ve daha fazlası.",
                duration: "8 saat",
                rating: 4.8,
                price: 150,
                currency: "USD",
                image: "/seref-vural-tours/istanbul/1-1.jpeg"
              },
              {
                id: 2,
                name: "Sapanca Doğa Turu",
                description: "Sapanca Gölü çevresinde doğa yürüyüşü ve piknik. Temiz hava ve muhteşem manzara.",
                duration: "6 saat",
                rating: 4.6,
                price: 120,
                currency: "USD",
                image: "/seref-vural-tours/sapanca/1-1.jpeg"
              },
              {
                id: 3,
                name: "Bursa Tarihi ve Kültürel Tur",
                description: "Osmanlı İmparatorluğu'nun ilk başkenti Bursa'yı keşfedin. Ulu Camii, Yeşil Türbe ve daha fazlası.",
                duration: "10 saat",
                rating: 4.7,
                price: 180,
                currency: "USD",
                image: "/seref-vural-tours/bursa/1-1.jpeg"
              },
              {
                id: 4,
                name: "Abant Gölü Doğa Turu",
                description: "Abant Gölü'nde doğa yürüyüşü ve fotoğraf çekimi. Muhteşem doğa manzaraları.",
                duration: "7 saat",
                rating: 4.5,
                price: 140,
                currency: "USD",
                image: "/seref-vural-tours/abant/1-1.jpeg"
              }
            ]).map((tour: any) => (
              <div key={tour.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={tour.image}
                    alt={tour.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-semibold text-gray-900">{tour.rating}</span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2">{tour.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-grow">
                    {tour.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2 text-green-600" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2 text-green-600" />
                      <span>7 kişilik kapasite</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2 text-green-600" />
                      <span>İstanbul'dan kalkış</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3 mt-auto">
                    <div className="text-center">
                      {websiteContent?.tours?.find((t: any) => t.id === tour.id)?.showPrice !== false ? (
                        <div className="text-2xl font-bold text-green-600">
                          {websiteContent?.tours?.find((t: any) => t.id === tour.id)?.prices?.USD ? 
                            `$${websiteContent.tours.find((t: any) => t.id === tour.id).prices.USD}` : 
                            `$${tour.price}`
                          }
                        </div>
                      ) : (
                        <div className="text-lg font-medium text-gray-500">
                          Fiyat İçin İletişime Geçin
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleWhatsApp(`Merhaba! ${tour.name} turu için rezervasyon yapmak istiyorum.`)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
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

      {/* Hotels Section */}
      <section id="hotels" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Otel Konaklama
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              İstanbul'da konforlu ve güvenli konaklama seçenekleri
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {(websiteContent?.hotels || [
              {
                id: 1,
                name: "Grand Hotel İstanbul",
                location: "Sultanahmet, İstanbul",
                description: "Sultanahmet'te lüks konaklama. Tarihi yarımadaya yürüme mesafesi.",
                rating: 4.9,
                price: 200,
                currency: "USD",
                amenities: ["WiFi", "Klima", "Oda Servisi", "Spa", "Fitness"],
                image: "/seref-vural-images/hotels/sultanahmet-palace.svg"
              },
              {
                id: 2,
                name: "Sapanca Resort Hotel",
                location: "Sapanca, Sakarya",
                description: "Sapanca Gölü manzaralı doğa oteli. Huzurlu ve sakin bir tatil.",
                rating: 4.6,
                price: 150,
                currency: "USD",
                amenities: ["WiFi", "Klima", "Havuz", "Restoran", "Park Alanı"],
                image: "/seref-vural-images/hotels/modern-istanbul.svg"
              }
            ]).map((hotel: any) => (
              <div key={hotel.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-semibold text-gray-900">{hotel.rating}</span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
                  <p className="text-gray-600 mb-2">{hotel.location}</p>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-grow">
                    {hotel.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities.map((amenity: any, index: number) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-col space-y-3 mt-auto">
                    <div className="text-center">
                      {websiteContent?.hotels?.find((h: any) => h.id === hotel.id)?.showPrice !== false ? (
                        <div className="text-2xl font-bold text-green-600">
                          {websiteContent?.hotels?.find((h: any) => h.id === hotel.id)?.prices?.USD ? 
                            `$${websiteContent.hotels.find((h: any) => h.id === hotel.id).prices.USD}` : 
                            `$${hotel.price}`
                          }
                        </div>
                      ) : (
                        <div className="text-lg font-medium text-gray-500">
                          Fiyat İçin İletişime Geçin
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleWhatsApp(`Merhaba! ${hotel.name} için rezervasyon yapmak istiyorum.`)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
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
      <section id="transfer" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Neden Şeref Vural Travel?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Profesyonel hizmet anlayışımız ve müşteri memnuniyeti odaklı yaklaşımımızla İstanbul'un en güvenilir transfer, tur ve konaklama hizmeti sunuyoruz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Uçuş Takibi</h3>
              <p className="text-gray-600 text-sm">Uçuşunuzu takip eder, gecikme durumunda bekleriz</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Karşılama Hizmeti</h3>
              <p className="text-gray-600 text-sm">Havalimanında karşılar, bagajlarınızı taşırız</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bebek Koltuğu</h3>
              <p className="text-gray-600 text-sm">Bebek koltuğu ve özel taleplere hızlı cevap</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Kurumsal Transfer</h3>
              <p className="text-gray-600 text-sm">Kurumsal sözleşmeli transfer seçenekleri</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Şeffaf Fiyatlandırma</h3>
            <p className="text-lg text-gray-600">
              Konumları girdiğiniz anda ücretinizi anında görün. Sabit fiyat, sürpriz yok.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Müşteri Yorumları
            </h2>
            <p className="text-lg text-gray-600">
              Müşterilerimizin deneyimlerini okuyun
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                name: "Ahmet Y.",
                service: "Transfer",
                date: "2 gün önce",
                rating: 5,
                comment: "Çok profesyonel hizmet. Şoförümüz çok nazikti ve zamanında geldi. Kesinlikle tavsiye ederim."
              },
              {
                id: 2,
                name: "Fatma K.",
                service: "Transfer",
                date: "1 hafta önce",
                rating: 5,
                comment: "Uçuşum gecikmişti ama şoförümüz sabırla bekledi. Araç çok temiz ve konforluydu."
              },
              {
                id: 3,
                name: "Mehmet S.",
                service: "Transfer",
                date: "2 hafta önce",
                rating: 5,
                comment: "İstanbul Havalimanı'ndan şehir merkezine çok rahat bir yolculuk yaptık. Teşekkürler Şeref Vural Travel."
              }
            ].map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{review.service}</span>
                </div>
                <p className="text-gray-600 mb-4">"{review.comment}"</p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{review.name}</span>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center bg-white px-6 py-3 rounded-lg shadow-sm border">
              <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
              <span className="text-2xl font-bold text-gray-900">4.9/5</span>
              <span className="ml-2 text-gray-600">Google Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Sık Sorulan Sorular
            </h2>
            <p className="text-lg text-gray-600">
              Merak ettiğiniz soruların cevapları
            </p>
          </div>

          <div className="space-y-6">
            {[
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
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Hazır mısınız?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            İstanbul Havalimanı transfer hizmetimizden yararlanmaya hazır olduğunuzu belirten metin. Profesyonel ekibimiz ve konforlu araçlarımızla güvenli bir yolculuk için rezervasyon yapın.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleReservation}
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Calendar className="mr-2" size={20} />
              Rezervasyon Talebi Gönder
            </button>
            
            <button 
              onClick={() => handleWhatsApp("Merhaba! Bilgi almak istiyorum.")}
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <MessageCircle className="mr-2" size={20} />
              WhatsApp'tan Yaz
            </button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-green-100">Mutlu Müşteri</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">7/24</div>
              <div className="text-green-100">Hizmet</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4.9/5</div>
              <div className="text-green-100">Müşteri Puanı</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              İletişim
            </h2>
            <p className="text-lg text-gray-600">
              Bizimle iletişime geçin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-2">Hızlı cevap için WhatsApp'tan yazın</p>
              <a 
                href={`https://wa.me/${serefVuralData.whatsapp.replace(/\D/g, '')}`}
                className="text-green-600 font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                {serefVuralData.whatsapp}
              </a>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Telefon</h3>
              <p className="text-gray-600 mb-2">7/24 telefon desteği</p>
              <a href={`tel:${serefVuralData.phone}`} className="text-green-600 font-semibold">
                {serefVuralData.phone}
              </a>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-600 mb-2">Genel bilgi ve sorularınız için</p>
              <a href={`mailto:${serefVuralData.email}`} className="text-green-600 font-semibold">
                {serefVuralData.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">{serefVuralData.companyName}</h3>
            <p className="text-gray-400 mb-4">İstanbul'un en güvenilir transfer, tur ve konaklama hizmeti</p>
            <div className="flex justify-center space-x-6">
              <a href={`tel:${serefVuralData.phone}`} className="text-gray-400 hover:text-white">
                {serefVuralData.phone}
              </a>
              <a href={`mailto:${serefVuralData.email}`} className="text-gray-400 hover:text-white">
                {serefVuralData.email}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Reservation Form Modal */}
      <ReservationForm
        isOpen={isReservationFormOpen}
        onClose={() => setIsReservationFormOpen(false)}
        tenantId={params.domain}
      />
    </div>
  );
}