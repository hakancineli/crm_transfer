'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                İstanbul Havalimanı Transfer & VIP Transfer Hizmeti
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                İstanbul Havalimanı (IST) ve Sabiha Gökçen (SAW) transfer hizmeti. 7/24 VIP Mercedes Vito, lüks sedan ve şehirler arası transfer. Sabit fiyat garantisi, uçuş takibi, karşılama hizmeti.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/customer-reservation" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition">
                  Rezervasyon Yap
                </Link>
                <a href="https://wa.me/905545812034?text=Merhaba, transfer hizmeti hakkında bilgi almak istiyorum." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-green-700 border border-green-200 hover:border-green-300 hover:bg-green-50 transition">
                  WhatsApp'tan Yaz
                </a>
                <Link href="/blog" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition">
                  Blog
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700">
                <div className="p-3 rounded-lg bg-white shadow border">7/24 Hizmet</div>
                <div className="p-3 rounded-lg bg-white shadow border">Sabit Fiyat</div>
                <div className="p-3 rounded-lg bg-white shadow border">Profesyonel Şoför</div>
                <div className="p-3 rounded-lg bg-white shadow border">Geniş Kapasite</div>
              </div>
            </div>
            <div className="lg:pl-8">
              <div className="bg-white border rounded-2xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Neden ProTransfer?</h2>
                <ul className="space-y-3 text-gray-700">
                  <li>• Uçuş Takibi</li>
                  <li>• Karşılama Hizmeti</li>
                  <li>• Bebek Koltuğu</li>
                  <li>• Kurumsal Seçenekler</li>
                  <li>• Uçuş takibi ve gecikme toleransı</li>
                  <li>• Karşılama hizmeti ve bagaj desteği</li>
                  <li>• Bebek koltuğu ve özel taleplere hızlı cevap</li>
                  <li>• Kurumsal sözleşmeli transfer seçenekleri</li>
                </ul>
                <div className="mt-6 text-sm text-gray-700">
                  💡 Rezervasyon konumlarını girdiğinizde ne kadar ödeyeceğinizi anında görebilirsiniz. Sabit fiyat garantisi, sürpriz yok.
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
              <h3 className="font-semibold text-gray-900 mb-2">Sık Sorulan Sorular</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-900">Transfer ne kadar sürer?</p>
                  <p className="mt-1">İstanbul Havalimanı'ndan şehir merkezine yaklaşık 45-60 dakika, Sabiha Gökçen'den 60-90 dakika sürer.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Fiyat sabit mi?</p>
                  <p className="mt-1">Evet, tüm fiyatlarımız sabittir. Ekstra ücret yoktur.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Uçuş gecikirse ne olur?</p>
                  <p className="mt-1">Uçuş takibi yapılır ve gecikme durumunda ek ücret alınmaz.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">İletişim</h3>
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
            
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Hizmetlerimiz</h3>
              <div className="text-gray-600 space-y-3 text-sm">
                <div>
                  <div className="font-medium">Havalimanı Transfer</div>
                  <p>İST ve SAW'dan şehir merkezine</p>
                </div>
                <div>
                  <div className="font-medium">Şehirler Arası</div>
                  <p>İstanbul'dan diğer şehirlere</p>
                </div>
                <div>
                  <div className="font-medium">VIP Hizmet</div>
                  <p>Mercedes Vito ve lüks sedan</p>
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
            <div className="bg-gray-50 border rounded-2xl p-6 text-gray-600">
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

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Transfer Rezervasyonu Yapmaya Hazır mısınız?</h2>
          <p className="mt-2 text-gray-600">Hızlı, güvenli ve konforlu transfer hizmeti için hemen rezervasyon yapın</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/customer-reservation" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition">
              Rezervasyon Yap
            </Link>
            <a href="https://wa.me/905545812034?text=Merhaba, transfer hizmeti hakkında bilgi almak istiyorum." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-green-700 border border-green-200 hover:border-green-300 hover:bg-green-50 transition">
              WhatsApp'tan Yaz
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
