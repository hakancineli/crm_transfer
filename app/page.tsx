'use client';

import Link from 'next/link';
import { useLanguage } from './contexts/LanguageContext';
import VehicleSlider from './components/landing/VehicleSlider';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">{t('landing.title')}</h1>
              <p className="mt-4 text-lg text-gray-600">{t('landing.description')}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/customer-reservation" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition">{t('landing.sendRequest')}</Link>
                <a href={`https://wa.me/905545812034?text=${encodeURIComponent(t('landing.whatsappMessage'))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-green-700 border border-green-200 hover:border-green-300 hover:bg-green-50 transition">{t('landing.whatsappWrite')}</a>
              </div>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700">
                <div className="p-3 rounded-lg bg-white shadow border">{t('landing.service24h')}</div>
                <div className="p-3 rounded-lg bg-white shadow border">{t('landing.fixedPrice')}</div>
                <div className="p-3 rounded-lg bg-white shadow border">{t('landing.professionalDriver')}</div>
                <div className="p-3 rounded-lg bg-white shadow border">{t('landing.capacity')}</div>
              </div>
            </div>
            <div className="lg:pl-8">
              <VehicleSlider />
              <div className="bg-white border rounded-2xl shadow p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('landing.whyProTransfer')}</h2>
                <ul className="space-y-3 text-gray-700">
                  <li>• {t('landing.flightTracking')}</li>
                  <li>• {t('landing.meetGreet')}</li>
                  <li>• {t('landing.childSeat')}</li>
                  <li>• {t('landing.corporateOptions')}</li>
                  <li>• Uçuş takibi ve gecikme toleransı</li>
                  <li>• Karşılama hizmeti ve bagaj desteği</li>
                  <li>• Bebek koltuğu ve özel taleplere hızlı cevap</li>
                  <li>• Kurumsal sözleşmeli transfer seçenekleri</li>
                </ul>
                <div className="mt-6 text-sm text-gray-700">
                  Konumları girdiğiniz anda ücretinizi anında görün. Sabit fiyat, sürpriz yok.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{t('landing.customerReviews')}</h3>
              <div className="space-y-4 text-gray-700 max-h-[42rem] overflow-auto pr-2">
                {[...Array(30)].map((_, idx) => {
                  const key = `landing.review${idx + 1}`;
                  const text = t(key);
                  // t returns the key itself when missing – skip missing keys gracefully
                  if (text === key) return null;
                  return (
                    <div key={key}>
                      <div className="flex items-center gap-2"><div className="text-yellow-400">★★★★★</div><span className="text-xs text-gray-500">{t('landing.googleReview')}</span></div>
                      <p>"{text}"</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{t('landing.faq')}</h3>
              <div className="space-y-4 text-gray-600 text-sm">
                <div>
                  <p className="font-medium">{t('landing.faq1.question')}</p>
                  <p className="mt-1">{t('landing.faq1.answer')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('landing.faq2.question')}</p>
                  <p className="mt-1">{t('landing.faq2.answer')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('landing.faq3.question')}</p>
                  <p className="mt-1">{t('landing.faq3.answer')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('landing.faq4.question')}</p>
                  <p className="mt-1">{t('landing.faq4.answer')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('landing.faq5.question')}</p>
                  <p className="mt-1">{t('landing.faq5.answer')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('landing.faq6.question')}</p>
                  <p className="mt-1">{t('landing.faq6.answer')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('landing.faq7.question')}</p>
                  <p className="mt-1">{t('landing.faq7.answer')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('landing.faq8.question')}</p>
                  <p className="mt-1">{t('landing.faq8.answer')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('landing.faq9.question')}</p>
                  <p className="mt-1">{t('landing.faq9.answer')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('landing.faq10.question')}</p>
                  <p className="mt-1">{t('landing.faq10.answer')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{t('landing.contact')}</h3>
              <div className="text-gray-600 space-y-3 text-sm">
                <div>
                  <div className="font-medium">WhatsApp</div>
                  <a className="text-green-700 hover:underline" href="https://wa.me/905545812034" target="_blank" rel="noopener noreferrer">+90 554 581 20 34</a>
                </div>
                <div>
                  <div className="font-medium">Telefon</div>
                  <a className="hover:underline" href="tel:+905545812034">+90 554 581 20 34</a>
                </div>
                <div>
                  <div className="font-medium">Adresler</div>
                  <p>İstanbul Havalimanı (IST)</p>
                  <p>Sabiha Gökçen Havalimanı (SAW)</p>
                  <p>Beşiktaş, İstanbul</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('landing.dailyChauffeur.title')}</h2>
              <p className="mt-3 text-gray-600">{t('landing.dailyChauffeur.description')}</p>
              <ul className="mt-4 list-disc list-inside text-gray-700 space-y-1">
                <li>{t('landing.dailyChauffeur.feature1')}</li>
                <li>{t('landing.dailyChauffeur.feature2')}</li>
                <li>{t('landing.dailyChauffeur.feature3')}</li>
              </ul>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a href={`https://wa.me/905545812034?text=${encodeURIComponent(t('landing.dailyChauffeur.whatsappMessage'))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition">{t('landing.dailyChauffeur.whatsappCTA')}</a>
              </div>
            </div>
            <div className="bg-gray-50 border rounded-2xl p-6 text-gray-600">
              <div className="text-sm">{t('landing.dailyChauffeur.example')}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Şehirler Arası Transfer</h2>
              <p className="mt-3 text-gray-600">İstanbul'dan diğer şehirlere, şehirler arası konforlu ve güvenli transfer hizmeti. Uzun mesafe yolculuklar için özel araçlar ve profesyonel şoförler.</p>
              <ul className="mt-4 list-disc list-inside text-gray-700 space-y-1">
                <li>İstanbul → Ankara, İzmir, Bursa, Antalya</li>
                <li>VIP Mercedes Vito ve lüks sedan seçenekleri</li>
                <li>7/24 hizmet, esnek kalkış saatleri</li>
                <li>Bagaj kapasitesi ve konforlu seyahat</li>
              </ul>
              <div className="mt-6">
                <a href="https://wa.me/905545812034?text=Merhaba, şehirler arası transfer için fiyat almak istiyorum." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition">
                  WhatsApp'tan Fiyat Al
                </a>
              </div>
            </div>
            <div className="bg-white border rounded-2xl p-6 text-gray-600">
              <div className="text-sm">
                <div className="font-medium text-gray-700 mb-2">Örnek Güzergahlar:</div>
                <ul className="space-y-1 text-sm">
                  <li>• İstanbul → Ankara: 450 km</li>
                  <li>• İstanbul → İzmir: 480 km</li>
                  <li>• İstanbul → Bursa: 155 km</li>
                  <li>• İstanbul → Antalya: 485 km</li>
                </ul>
                <div className="mt-3 text-xs text-gray-500">
                  Mesafe ve araç tipine göre fiyatlandırma yapılır. Detaylı bilgi için WhatsApp'tan iletişime geçin.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{t('landing.ready.title')}</h2>
          <p className="mt-2 text-gray-600">{t('landing.ready.description')}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/customer-reservation" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition">{t('landing.sendRequest')}</Link>
            <a href={`https://wa.me/905545812034?text=${encodeURIComponent(t('landing.whatsappMessage'))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-green-700 border border-green-200 hover:border-green-300 hover:bg-green-50 transition">{t('landing.whatsappWrite')}</a>
      </div>
    </div>
      </section>
    </main>
  );
}
