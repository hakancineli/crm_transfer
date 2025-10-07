'use client';

import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">ProTransfer CRM</div>
          <div className="space-x-4 text-sm">
            <Link href="/admin-login" className="text-gray-600 hover:text-gray-900">Admin</Link>
            <Link href="/" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">Demoyu İncele</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Acentalar için hepsi bir arada Transfer CRM
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Rezervasyon, Muhasebe, Raporlama, Sürücü Atama ve Müşteri Yönetimi tek yerde. Çoklu tenant mimari, website entegrasyonu ve modüler yapı ile dakikalar içinde kurulum.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin-login" className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold">Hemen Başlayın</Link>
              <Link href="#features" className="inline-flex items-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold">Özellikleri Gör</Link>
            </div>
            <div className="mt-6 text-sm text-gray-500">TR/EN/FR/RU ve TRY/USD/EUR destekli</div>
          </div>
          <div className="lg:pl-8">
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6 bg-white">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="text-green-700 font-semibold">Hızlı Kurulum</div>
                  <div className="text-gray-600 mt-1">Dakikalar içinde canlı</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="text-blue-700 font-semibold">Raporlama</div>
                  <div className="text-gray-600 mt-1">Gelir ve rota analizi</div>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-amber-700 font-semibold">Muhasebe</div>
                  <div className="text-gray-600 mt-1">Komisyon onay akışı</div>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="text-purple-700 font-semibold">Sürücü</div>
                  <div className="text-gray-600 mt-1">Atama ve navigasyon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Değer Önerileri */}
      <section className="py-16" id="values">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-6">
          {[
            { title: 'Dakikalar içinde kurulum', desc: 'Çoklu tenant, domain ve website entegrasyonu hazır.' },
            { title: 'Gelir ve operasyon kontrolü', desc: 'Canlı raporlar, komisyon, hakediş, ödeme durumu.' },
            { title: 'Esnek modüler yapı', desc: 'Transfer, Tur, Konaklama, Uçuş ve Website modülleri.' },
            { title: 'Saha odaklı kullanım', desc: 'Şoför voucher’ı, navigasyon, WhatsApp paylaşımı.' }
          ].map((v, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="text-lg font-semibold text-gray-900">{v.title}</div>
              <div className="text-gray-600 mt-2 text-sm">{v.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Özellikler */}
      <section className="py-16 bg-gray-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Öne Çıkan Özellikler</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Rezervasyon Yönetimi', desc: 'Uçuş kodu, konumlar, çoklu yolcu, notlar, kaynak takibi.' },
              { title: 'Sürücü Yönetimi', desc: 'Atama, hakediş, durum ve navigasyon entegrasyonu.' },
              { title: 'Muhasebe', desc: 'TL/USD/EUR uyumlu; komisyon onay ve ödeme durumları.' },
              { title: 'Raporlama', desc: 'Gelir, adet, tür dağılımı, popüler rotalar.' },
              { title: 'Müşteri Yönetimi', desc: 'Müşteri kartları, geçmiş rezervasyonlar, iletişim.' },
              { title: 'Website Modülü', desc: 'Çoklu tenant website, içerik, domain eşleme.' },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{f.title}</div>
                <div className="text-gray-600 mt-2 text-sm">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neden Biz */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          {[
            { title: 'Gerçek operasyonla test edildi', desc: 'Saha geri bildirimleriyle şekillenen akışlar.' },
            { title: 'Hız ve güven', desc: 'Next.js + Prisma + Postgres, edge optimizasyonları.' },
            { title: 'Çoklu dil ve para birimi', desc: 'TR/EN/FR/RU ve TRY/USD/EUR desteği.' },
          ].map((n) => (
            <div key={n.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="text-lg font-semibold text-gray-900">{n.title}</div>
              <div className="text-gray-600 mt-2 text-sm">{n.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Entegrasyonlar */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Entegrasyonlar</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Google Maps', desc: 'Routes, Distance Matrix, Places API' },
              { title: 'Navigasyon', desc: 'Yandex / Apple / Google deep-link' },
              { title: 'Mesajlaşma', desc: 'WhatsApp ve e-posta paylaşımı' },
            ].map((i) => (
              <div key={i.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{i.title}</div>
                <div className="text-gray-600 mt-2 text-sm">{i.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Sık Sorulan Sorular</h2>
          <div className="space-y-4">
            {[
              { q: 'Kurulum ne kadar sürer?', a: 'Standart kurulum 1 gün içerisinde tamamlanır. Domain/website eşlemeleri hazır.' },
              { q: 'Fiyatlandırma nasıl?', a: 'Modüler yapı: sadece ihtiyaç duyduğunuz modüller için ödeme yaparsınız.' },
              { q: 'Veriler kimde?', a: 'Tenant başına izole veritabanı ve düzenli yedekleme stratejisi uygulanır.' },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="font-semibold text-gray-900">{item.q}</div>
                <div className="mt-1 text-gray-600 text-sm">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Operasyonunuzu bugün dijitalleştirin</h2>
          <p className="text-gray-300 mb-8">Demoyu inceleyin veya bizimle iletişime geçin.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin-login" className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-gray-900 hover:bg-gray-100 font-semibold">Hemen Başlayın</Link>
            <Link href="/protransfer" className="inline-flex items-center px-6 py-3 rounded-lg border border-white text-white hover:bg-white hover:text-gray-900 font-semibold">Demoyu İncele</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ProTransfer. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}


