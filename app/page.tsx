import Link from 'next/link';
import VehicleSlider from './components/landing/VehicleSlider';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">İstanbul’da VIP Havalimanı Transferi</h1>
              <p className="mt-4 text-lg text-gray-600">IST/SAW ↔ Otel/Adres arası konforlu, güvenli ve zamanında transfer. 7/24 hizmet, sabit fiyat, profesyonel şoförler.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/customer-reservation" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition">Rezervasyon Talebi Gönder</Link>
                <a href={`https://wa.me/905545812034?text=${encodeURIComponent('Merhaba, VIP transfer için bilgi/fiyat almak istiyorum.')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-green-700 border border-green-200 hover:border-green-300 hover:bg-green-50 transition">WhatsApp’tan Yaz</a>
              </div>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700">
                <div className="p-3 rounded-lg bg-white shadow border">7/24 Hizmet</div>
                <div className="p-3 rounded-lg bg-white shadow border">Sabit Fiyat</div>
                <div className="p-3 rounded-lg bg-white shadow border">Profesyonel Şoför</div>
                <div className="p-3 rounded-lg bg-white shadow border">Yeni Nesil Filolar</div>
              </div>
            </div>
            <div className="lg:pl-8">
              <VehicleSlider />
              <div className="bg-white border rounded-2xl shadow p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Neden ProTransfer?</h2>
                <ul className="space-y-3 text-gray-700">
                  <li>• Uçuş takibi ve gecikme toleransı</li>
                  <li>• Karşılama hizmeti ve bagaj desteği</li>
                  <li>• Bebek koltuğu ve özel taleplere hızlı cevap</li>
                  <li>• Kurumsal sözleşmeli transfer seçenekleri</li>
                </ul>
                <div className="mt-6 text-sm text-gray-500">Talep sonrası fiyatı WhatsApp ile iletiyoruz. Fiyatlar trafik/süreye göre değişmez.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Müşteri Yorumları</h3>
              <p className="text-gray-600">“Gece geç saatte indik, şoför bizi kapıda karşıladı. Çok konforlu bir yolculuktu.”</p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">SSS</h3>
              <p className="text-gray-600">Uçuş gecikmelerinde ek ücret yansıtılmaz, planınızı biz uyarlarız.</p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">İletişim</h3>
              <p className="text-gray-600">Hızlı bilgi için WhatsApp: +90 554 581 20 34</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Hazır mısınız?</h2>
          <p className="mt-2 text-gray-600">Talebinizi 1 dakikada iletin, ekibimiz size hemen dönüş yapsın.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/customer-reservation" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition">Rezervasyon Talebi Gönder</Link>
            <a href={`https://wa.me/905545812034?text=${encodeURIComponent('Merhaba, VIP transfer için bilgi/fiyat almak istiyorum.')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-green-700 border border-green-200 hover:border-green-300 hover:bg-green-50 transition">WhatsApp’tan Yaz</a>
          </div>
        </div>
      </section>
    </main>
  );
}
