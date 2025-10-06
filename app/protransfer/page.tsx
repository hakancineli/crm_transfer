'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Calendar, MapPin, Clock, Users, Star, Phone, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import ReservationForm from '../website/components/ReservationForm';

// Şeref Vural Travel verileri (protransfer.com.tr için kök site)
const serefVuralData = {
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
  ]
};

export default function ProtransferWebsitePage() {
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVehicleIndex((prev) => prev === serefVuralData.vehicleImages.length - 1 ? 0 : prev + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${serefVuralData.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
  };

  const tenantId = 'protransfer';

  return (
    <div className="min-h-screen bg-white">
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

      <section className="relative bg-gradient-to-b from-white to-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
                {serefVuralData.companyName} - {serefVuralData.tagline}
              </h1>
              <p className="text-lg text-gray-600 mb-8">{serefVuralData.description}</p>
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
                    {serefVuralData.vehicleImages.map((image, index) => (
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
                  {serefVuralData.vehicleImages.map((_, index) => (
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

      {/* Reviews, FAQ, Contact, Footer kısımları sadeleştirilmiş */}

      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">İletişim</h2>
            <p className="text-lg text-gray-600">Bizimle iletişime geçin</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-8 h-8 text-green-600" /></div>
              <a href={`https://wa.me/${serefVuralData.whatsapp.replace(/\D/g, '')}`} className="text-green-600 font-semibold" target="_blank" rel="noopener noreferrer">{serefVuralData.whatsapp}</a>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Phone className="w-8 h-8 text-green-600" /></div>
              <a href={`tel:${serefVuralData.phone}`} className="text-green-600 font-semibold">{serefVuralData.phone}</a>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8 text-green-600" /></div>
              <a href={`mailto:${serefVuralData.email}`} className="text-green-600 font-semibold">{serefVuralData.email}</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">{serefVuralData.companyName}</h3>
            <p className="text-gray-400 mb-4">İstanbul'un en güvenilir transfer, tur ve konaklama hizmeti</p>
            <div className="flex justify-center space-x-6">
              <a href={`tel:${serefVuralData.phone}`} className="text-gray-400 hover:text-white">{serefVuralData.phone}</a>
              <a href={`mailto:${serefVuralData.email}`} className="text-gray-400 hover:text-white">{serefVuralData.email}</a>
            </div>
          </div>
        </div>
      </footer>

      <ReservationForm isOpen={isReservationFormOpen} onClose={() => setIsReservationFormOpen(false)} tenantId={tenantId} />
    </div>
  );
}


