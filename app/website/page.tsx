'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';

interface WebsiteData {
  tenant: {
    id: string;
    name: string;
    domain: string;
  };
  settings: {
    companyName: string;
    logo: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    contactInfo: {
      phone: string;
      whatsapp: string;
      email: string;
    };
    socialMedia: {
      facebook: string;
      instagram: string;
      twitter: string;
    };
    seoSettings: {
      metaTitle: {
        tr: string;
        en: string;
        ar: string;
      };
      metaDescription: {
        tr: string;
        en: string;
        ar: string;
      };
    };
    colorScheme: {
      primary: string;
      secondary: string;
    };
  };
  pages: Array<{
    id: string;
    slug: string;
    title: string;
    content: {
      tr: string;
      en: string;
      ar: string;
    };
    isPublished: boolean;
    isHomepage: boolean;
  }>;
}

export default function WebsitePage() {
  const router = useRouter();
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'tr' | 'en' | 'ar'>('tr');

  useEffect(() => {
    fetchWebsiteData();
  }, []);

  const fetchWebsiteData = async () => {
    try {
      const response = await fetch('/api/website');
      if (response.ok) {
        const data = await response.json();
        setWebsiteData(data);
      } else {
        console.error('Failed to fetch website data');
      }
    } catch (error) {
      console.error('Error fetching website data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservationSubmit = async (formData: FormData) => {
    try {
      const response = await fetch('/api/website/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: websiteData?.tenant.id,
          source: 'website',
          ...Object.fromEntries(formData)
        }),
      });

      if (response.ok) {
        alert('Rezervasyon başarıyla oluşturuldu!');
      } else {
        alert('Rezervasyon oluşturulurken hata oluştu.');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      alert('Rezervasyon oluşturulurken hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!websiteData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Website Bulunamadı</h1>
          <p className="text-gray-600">Bu domain için aktif website bulunamadı.</p>
        </div>
      </div>
    );
  }

  const { tenant, settings, pages } = websiteData;

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      <Head>
        <title>{settings.seoSettings?.metaTitle?.[language] || settings.companyName}</title>
        <meta name="description" content={settings.seoSettings?.metaDescription?.[language] || settings.heroSubtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src={settings.logo} 
                alt={settings.companyName}
                className="h-8 w-auto"
              />
              <span className="ml-3 text-xl font-bold text-gray-900">
                {settings.companyName}
              </span>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage('tr')}
                className={`px-3 py-1 rounded-md text-sm ${
                  language === 'tr' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Türkçe"
              >
                🇹🇷 TR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm ${
                  language === 'en' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="English"
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1 rounded-md text-sm ${
                  language === 'ar' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="العربية"
              >
                🇸🇦 AR
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {settings.heroTitle}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-green-100">
                {settings.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a
                  href="#reservation"
                  className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {language === 'tr' ? 'Rezervasyon Yap' : 
                   language === 'en' ? 'Make Reservation' : 'احجز الآن'}
                </a>
                <a
                  href={`tel:${settings.contactInfo.phone}`}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                >
                  {language === 'tr' ? 'Hemen Ara' : 
                   language === 'en' ? 'Call Now' : 'اتصل الآن'}
                </a>
              </div>
            </div>
            <div className="relative h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={settings.heroImage || '/vehicles/vito-1.jpg'}
                alt={settings.companyName}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <div key={i} className="p-6 rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="text-3xl mb-3">{i===1?'🛬':i===2?'🕒':'👨‍✈️'}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language==='tr' ? (i===1?'Uçuş Takibi':'Zamanında Hizmet') : language==='en' ? (i===1?'Flight Tracking':'On-time Service') : (i===1?'تتبع الرحلات':'الخدمة في الوقت')}
                </h3>
                <p className="text-gray-600">
                  {language==='tr' ? (i===1?'Uçuş kodunuzu izleyip gecikmelere göre planlarız.':i===2?'Tüm planlamayı dakik yaparız.':'Profesyonel şoför kadrosu, konforlu yolculuk.')
                  : language==='en' ? (i===1?'We track your flight and adapt to delays.':i===2?'Punctual planning for every ride.':'Professional drivers for a comfortable ride.')
                  : (i===1?'نقوم بتتبع رحلتك ونكيف الخطة مع التأخير.':i===2?'تخطيط دقيق وفي الوقت.':'سائقون محترفون ورحلة مريحة.')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Form */}
      <section id="reservation" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {language === 'tr' ? 'Rezervasyon Formu' : 
               language === 'en' ? 'Reservation Form' : 'نموذج الحجز'}
            </h2>
            
            <form action={handleReservationSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'tr' ? 'Ad Soyad' : 
                     language === 'en' ? 'Full Name' : 'الاسم الكامل'}
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    title={language==='tr'?'Ad Soyad':language==='en'?'Full Name':'الاسم الكامل'}
                    placeholder={language==='tr'?'Ad Soyad':language==='en'?'Full Name':'الاسم الكامل'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'tr' ? 'Telefon' : 
                     language === 'en' ? 'Phone' : 'الهاتف'}
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    title={language==='tr'?'Telefon':'Phone'}
                    placeholder={language==='tr'?'+90 5XX XXX XX XX':language==='en'?'+90 5XX XXX XX XX':'‏+90 5XX XXX XX XX'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'tr' ? 'Email' : 
                     language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    title={language==='tr'?'E-posta':'Email'}
                    placeholder={language==='tr'?'ornek@email.com':language==='en'?'example@email.com':'example@email.com'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'tr' ? 'Tarih' : 
                     language === 'en' ? 'Date' : 'التاريخ'}
                  </label>
                  <input
                    type="date"
                    name="pickupDate"
                    required
                    title={language==='tr'?'Tarih':'Date'}
                    placeholder="gg.aa.yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'tr' ? 'Saat' : 
                     language === 'en' ? 'Time' : 'الوقت'}
                  </label>
                  <input
                    type="time"
                    name="pickupTime"
                    required
                    title={language==='tr'?'Saat':'Time'}
                    placeholder="ss:dd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'tr' ? 'Yolcu Sayısı' : 
                     language === 'en' ? 'Passenger Count' : 'عدد الركاب'}
                  </label>
                  <input
                    type="number"
                    name="passengerCount"
                    min="1"
                    required
                    title={language==='tr'?'Yolcu Sayısı':'Passenger Count'}
                    placeholder={language==='tr'?'Örn: 2':language==='en'?'e.g., 2':'مثال: 2'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language==='tr'?'Uçuş Kodu':language==='en'?'Flight Code':'رمز الرحلة'}
                  </label>
                  <input
                    type="text"
                    name="flightCode"
                    placeholder="TK1234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'tr' ? 'Notlar' : 
                   language === 'en' ? 'Notes' : 'ملاحظات'}
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  title={language==='tr'?'Notlar':'Notes'}
                  placeholder={language==='tr'?'Özel taleplerinizi yazın...':language==='en'?'Write your special requests...':'اكتب طلباتك الخاصة...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  {language === 'tr' ? 'Rezervasyon Yap' : 
                   language === 'en' ? 'Make Reservation' : 'احجز الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            {language==='tr'?'Müşteri Yorumları':language==='en'?'Customer Reviews':'تقييمات العملاء'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map((i)=> (
              <div key={i} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <p className="text-gray-700">
                  {language==='tr'? 'Uçuş gecikmesine rağmen bizi beklediler, çok konforlu yolculuk.'
                    : language==='en' ? 'They waited despite flight delay, very comfortable ride.'
                    : 'انتظرونا رغم تأخر الرحلة، كانت رحلة مريحة جداً.'}
                </p>
                <div className="mt-4 text-sm text-gray-500">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: language==='tr'?'Uçuşum gecikirse ne olur?':language==='en'?'What if my flight is delayed?':'ماذا لو تأخرت رحلتي؟',
                a: language==='tr'?'Uçuş numaranızı izliyoruz, sürücünüz bekler. Ek ücret yok.':language==='en'?'We track your flight number; your driver will wait. No extra fee.':'نتتبع رقم رحلتك؛ سائقك سيَنتظر. بدون رسوم إضافية.'
              },
              {
                q: language==='tr'?'Kaç kişi alabiliyorsunuz?':language==='en'?'How many passengers can you take?':'كم عدد الركاب؟',
                a: language==='tr'?'VIP Vito ile 6 yolcu + 6 bavul kapasitesi.':language==='en'?'Up to 6 passengers + 6 suitcases with Vito VIP.':'حتى 6 ركاب + 6 حقائب مع فيتو VIP.'
              }
            ].map((item, idx) => (
              <details key={idx} className="group border border-gray-200 rounded-lg p-4 bg-white">
                <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">⌃</span>
                </summary>
                <p className="mt-2 text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{settings.companyName}</h3>
              <p className="text-gray-400">
                {language === 'tr' ? 'İstanbul\'un en güvenilir transfer hizmeti' : 
                 language === 'en' ? 'Istanbul\'s most reliable transfer service' : 
                 'خدمة النقل الأكثر موثوقية في اسطنبول'}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {language === 'tr' ? 'İletişim' : 
                 language === 'en' ? 'Contact' : 'اتصل بنا'}
              </h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 {settings.contactInfo.phone}</p>
                <p>📧 {settings.contactInfo.email}</p>
                <p>💬 WhatsApp: {settings.contactInfo.whatsapp}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {language === 'tr' ? 'Sosyal Medya' : 
                 language === 'en' ? 'Social Media' : 'وسائل التواصل الاجتماعي'}
              </h4>
              <div className="flex space-x-4">
                <a href={settings.socialMedia.facebook} className="text-gray-400 hover:text-white">
                  Facebook
                </a>
                <a href={settings.socialMedia.instagram} className="text-gray-400 hover:text-white">
                  Instagram
                </a>
                <a href={settings.socialMedia.twitter} className="text-gray-400 hover:text-white">
                  Twitter
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {settings.companyName}. {language === 'tr' ? 'Tüm hakları saklıdır.' : 
               language === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}</p>
          </div>
        </div>
      </footer>

      {/* Sticky WhatsApp CTA */}
      {settings.contactInfo?.whatsapp && (
        <a
          href={`https://wa.me/${settings.contactInfo.whatsapp.replace(/\D/g,'')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
          title="WhatsApp"
        >
          <span>💬</span>
          <span className="font-semibold">WhatsApp</span>
        </a>
      )}
    </div>
  );
}
