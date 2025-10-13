'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function MarketingPage() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ru', label: 'Русский' },
    { code: 'ar', label: 'العربية' },
    { code: 'tr', label: 'Türkçe' },
  ] as const;

  const current = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
  <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Pro Acente</span>
          </Link>
          <div className="space-x-4 text-sm flex items-center">
            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open ? 'true' : 'false'}
                aria-controls="language-menu"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                title="Language"
              >
                <span className="hidden sm:block text-sm font-medium text-gray-700">{current.label}</span>
                <span className="sm:ml-2">▾</span>
              </button>
              {open && (
                <div id="language-menu" role="menu" aria-label="Language" className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <ul className="py-1">
                    {languages.map((l) => (
                      <li key={l.code}>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setLanguage(l.code as any);
                            setOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${language === l.code ? 'text-gray-900 font-medium' : 'text-gray-700'}`}
                          title={l.label}
                        >
                          {l.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
              Acenteler için iş yönetimi CRM — Pro Acente
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Back ofis ağırlıklı, en az iş yükü ile operasyon yönetimi. Rezervasyonları tek ekrandan atayın, sürücüye iletin, müşteriye paylaşın. Uçtan uca: rezervasyon → atama → operasyon → muhasebe → rapor.
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
                {[
                  { t: 'Hızlı kurulum', d: 'Aynı gün yayında; veri aktarım desteği' },
                  { t: 'Online talep', d: 'Website + form ile 7/24 rezervasyon' },
                  { t: 'Tek tık paylaşım', d: 'Voucher ve konumu WhatsApp ile gönderin' },
                  { t: 'Canlı takip', d: 'Uçuş, rota ve sürücü durumu' },
                ].map((c) => (
                  <div key={c.t} className="p-4 rounded-lg border bg-white">
                    <div className="font-semibold text-gray-900">{c.t}</div>
                    <div className="text-gray-600 mt-1">{c.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ekran Görüntüleri */}
      <section className="py-16 bg-gray-50" id="screenshots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Ekran Görüntüleri</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[ 
              { title: 'Dashboard', desc: 'Anlık özet ve hızlı aksiyonlar', src: '/screenshots/dashboard.png' },
              { title: 'Rezervasyon', desc: 'Yeni rezervasyon ve atama akışı', src: '/screenshots/reservation.png' },
              { title: 'Raporlar', desc: 'Gelir, dağılım ve popüler rotalar', src: '/screenshots/reports.png' },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="text-lg font-semibold text-gray-900">{s.title}</div>
                  <div className="text-gray-600 mt-1 text-sm">{s.desc}</div>
                </div>
                <a href={s.src} target="_blank" rel="noopener noreferrer" title={`${s.title} - Tam boyut`}>
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <img src={s.src} alt={s.title} className="object-cover w-full h-full" />
                  </div>
                </a>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-3">Görseller <code>/public/screenshots/</code> altındaki <code>dashboard.png</code>, <code>reservation.png</code>, <code>reports.png</code> dosyalarından yüklenir.</div>
        </div>
      </section>

      {/* Değer Önerileri (3 ana başlık) */}
      <section className="py-16" id="value-props">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Acenteler için temel değer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[ 
              { title: 'Geliri ve operasyonu yönetin', desc: 'Canlı raporlar; komisyon, hakediş ve ödeme görünürlüğü.' },
              { title: 'Modüler mimari', desc: 'Transfer, Tur, Konaklama, Uçuş, Website — ihtiyacın kadar öde.' },
              { title: 'Sahada hız', desc: 'Sürücü voucher’ı, navigasyon ve WhatsApp paylaşımı.' },
            ].map((v) => (
              <div key={v.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{v.title}</div>
                <div className="text-gray-600 mt-2 text-sm">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detaylı Özellik Listesi */}
      <section className="py-16" id="detailed-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Tüm Özellikler</h2>
          
          {/* Rezervasyon Yönetimi */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Rezervasyon Yönetimi</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Transfer rezervasyonları (karşılama/çıkış/ara transfer)',
                'Tur rezervasyonları (günlük/çok günlük)',
                'Konaklama rezervasyonları (otel/oda)',
                'Uçuş rezervasyonları ve takibi',
                'Uçuş kodu entegrasyonu',
                'Çoklu yolcu desteği',
                'Luggage sayısı takibi',
                'Özel notlar ve talepler',
                'Kaynak takibi (telefon/website/email)',
                'Rezervasyon durumu yönetimi',
                'Dönüş transferi ekleme',
                'Rezervasyon düzenleme/silme',
                'Voucher ile rezervasyon sorgulama (lookup)',
                'Harici sistemlerden rezervasyon push (API)',
                'Voucher numarası otomatik üretimi',
                'Tarih/saat filtreleme',
                'Şoför atama durumu filtreleme',
                'Ödeme durumu takibi (Ödendi/Beklemede/Ödenmedi)',
                'Hızlı aksiyon butonları',
                'Toplu işlemler',
                'Rezervasyon arama (voucher/isim/tarih)',
                'Excel export/import'
              ].map((feature) => (
                <div key={feature} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Şoför & Araç Yönetimi */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Şoför & Araç Yönetimi</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Şoför bilgileri (ad/telefon/email)',
                'Araç bilgileri (plaka/model/renk)',
                'Şoför atama sistemi',
                'Atama geçmişi takibi',
                'Şoför durumu (müsait/meşgul)',
                'Voucher otomatik gönderimi',
                'WhatsApp ile bildirim',
                'Navigasyon linkleri (Yandex/Apple/Google)',
                'Müşteri iletişim bilgisi paylaşımı',
                'Şoför performans takibi',
                'Hakediş hesaplama',
                'Şoför raporları',
                'Araç bakım takibi',
                'Sürücü belgesi yönetimi',
                'Sigorta bilgileri',
                'Araç fotoğrafları',
                'Şoför fotoğrafları',
                'Acil durum iletişim',
                'Çalışma saatleri takibi',
                'İzin yönetimi'
              ].map((feature) => (
                <div key={feature} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Muhasebe & Finans */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Muhasebe & Finans</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Komisyon hesaplama (TL/USD/EUR)',
                'Komisyon onay sistemi',
                'Hakediş yönetimi',
                'Ödeme durumu takibi',
                'Gelir raporları',
                'Gider takibi',
                'Kâr/zarar analizi',
                'Aylık/yıllık raporlar',
                'Müşteri bazlı gelir analizi',
                'Şoför bazlı gelir analizi',
                'Rota bazlı kârlılık',
                'Ödeme yöntemleri takibi',
                'Fatura oluşturma',
                'Rezervasyondan otomatik fatura ön-dolum (prefill)',
                'KDV hesaplama',
                'Kur farkı hesaplama',
                'Kur oranlarını otomatik güncelleme',
                'Nakit/KKT takibi',
                'Banka entegrasyonu',
                'Muhasebe export',
                'Bütçe planlama',
                'Finansal dashboard'
              ].map((feature) => (
                <div key={feature} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raporlama & Analiz */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Raporlama & Analiz</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Günlük transfer raporları',
                'Aylık gelir raporları',
                'Şoför performans raporları',
                'Müşteri analiz raporları',
                'Rota popülerlik analizi',
                'Zaman bazlı analizler',
                'Kârlılık analizleri',
                'Rezervasyon trend analizi',
                'Müşteri segmentasyonu',
                'Gelir dağılım raporları',
                'Operasyonel verimlilik',
                'Excel export özelliği',
                'PDF rapor oluşturma',
                'E-posta ile rapor gönderimi',
                'Otomatik rapor programlama',
                'Dashboard widget\'ları',
                'Grafik ve chart\'lar',
                'Karşılaştırmalı analizler',
                'Filtrelenebilir raporlar',
                'Özelleştirilebilir raporlar'
              ].map((feature) => (
                <div key={feature} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kullanıcı & Yetki Yönetimi */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Kullanıcı & Yetki Yönetimi</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Rol bazlı erişim kontrolü',
                'Süper kullanıcı, Acente yöneticisi, Operasyon, Satış, Muhasebe rolleri',
                'Modül bazlı izin yönetimi',
                'Kullanıcı oluşturma/düzenleme/silme',
                'İzin matrisi yönetimi',
                'Tenant bazlı kullanıcı izolasyonu',
                'Şifre yönetimi',
                'Oturum yönetimi',
                'Kullanıcı aktivite logları',
                'Yetki değişiklik geçmişi',
                'Kullanıcı profil yönetimi',
                'E-posta doğrulama',
                'İki faktörlü kimlik doğrulama',
                'Kullanıcı grupları',
                'Toplu yetki atama',
                'Geçici yetki verme',
                'Yetki süresi yönetimi',
                'Kullanıcı performans takibi',
                'Modül senkronizasyonu ve durum yönetimi',
                'Giriş/çıkış logları',
                'Güvenlik ayarları'
              ].map((feature) => (
                <div key={feature} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sistem & Teknik Özellikler */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Sistem & Teknik Özellikler</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Çoklu tenant mimari',
                'Next.js 14 + React 18',
                'PostgreSQL veritabanı',
                'Prisma veritabanı yönetimi',
                'TypeScript desteği',
                'Responsive tasarım',
                'Progressive Web App desteği',
                'REST API uç noktaları',
                'Real-time güncellemeler',
                'Otomatik yedekleme',
                'Yedekleme API ve geri yükleme',
                'SSL güvenlik sertifikası',
                'İçerik dağıtım ağı entegrasyonu',
                'Caching sistemi',
                'Hata izleme',
                'Performans izleme',
                'Log yönetimi',
                'Veritabanı geçişi',
                'Ortam yönetimi',
                'Docker konteynerleştirme',
                'Bulut dağıtımı'
              ].map((feature) => (
                <div key={feature} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Entegrasyonlar */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Entegrasyonlar</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Google Maps API (Routes, Distance Matrix)',
                'Google Places API (Autocomplete)',
                'Yandex Maps entegrasyonu',
                'Apple Maps entegrasyonu',
                'WhatsApp İş API\'si',
                'E-posta SMTP entegrasyonu',
                'SMS ağ geçidi entegrasyonu',
                'UETDS (sefer bildirimi, sorgu, log)',
                'Booking.com API',
                'Expedia API',
                'Amadeus API (uçuş)',
                'Sabre API (uçuş)',
                'Ödeme ağ geçidi entegrasyonu',
                'Bankacılık API entegrasyonu',
                'Müşteri ilişkileri yönetimi entegrasyonları',
                'Döviz kuru servisleri (Exchange Rates)',
                'Webhook: dış sistemden rezervasyon push',
                'Kurumsal kaynak planlama entegrasyonları',
                'Webhook desteği',
                'REST API uç noktaları',
                'GraphQL API',
                'Üçüncü taraf webhook\'lar',
                'Özel API entegrasyonları'
              ].map((feature) => (
                <div key={feature} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modülleri Karşılaştır */}
      <section className="py-16 bg-gray-50" id="compare">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Modülleri Karşılaştırın</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Özellik</th>
                  {['Transfer','Tur','Konaklama','Uçuş','Website'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { k: 'Rezervasyon Yönetimi', cols: [true, true, true, true, false] },
                  { k: 'Şoför / Araç Yönetimi', cols: [true, true, false, false, false] },
                  { k: 'Raporlama & Analiz', cols: [true, true, true, true, false] },
                  { k: 'Muhasebe / Komisyon', cols: [true, true, true, true, false] },
                  { k: 'Rota / Rehber Yönetimi', cols: [false, true, false, false, false] },
                  { k: 'Otel / Oda Yönetimi', cols: [false, false, true, false, false] },
                  { k: 'Uçuş Takibi', cols: [true, false, false, true, false] },
                  { k: 'Çoklu Tenant Website', cols: [false, false, false, false, true] },
                  { k: 'WhatsApp Bildirim', cols: [true, true, true, true, false] },
                  { k: 'Navigasyon Entegrasyonu', cols: [true, true, false, false, false] },
                  { k: 'Voucher Sistemi', cols: [true, true, true, true, false] },
                  { k: 'Çok Dilli Destek (5 dil)', cols: [true, true, true, true, true] },
                  { k: 'Rol Bazlı Yetkilendirme', cols: [true, true, true, true, true] },
                  { k: 'Kırmızı Alarm Sistemi', cols: [true, true, true, true, false] },
                  { k: 'Müşteri Yönetimi', cols: [true, true, true, true, false] },
                  { k: 'Ödeme Takibi', cols: [true, true, true, true, false] },
                  { k: 'Excel Export/Import', cols: [true, true, true, true, false] },
                  { k: 'API Entegrasyonu', cols: [true, true, true, true, true] },
                  { k: 'UETDS Entegrasyonu', cols: [true, false, false, false, false] },
                  { k: 'Fatura Ön-Dolum (Prefill)', cols: [true, true, true, true, false] },
                  { k: 'Rezervasyon Lookup (Voucher)', cols: [true, true, true, true, false] },
                  { k: 'Harici Rezervasyon Push (Webhook/API)', cols: [true, true, true, true, true] },
                  { k: 'Kur Oranları Otomatik Güncelleme', cols: [true, true, true, true, true] },
                  { k: 'Yedekleme ve Geri Yükleme', cols: [true, true, true, true, true] },
                  { k: 'Audit Log', cols: [true, true, true, true, true] },
                  { k: 'Otomatik Yedekleme', cols: [true, true, true, true, true] },
                  { k: 'Real-time Güncellemeler', cols: [true, true, true, true, true] },
                  { k: 'Dashboard Widget\'ları', cols: [true, true, true, true, false] },
                  { k: 'Filtreleme & Arama', cols: [true, true, true, true, false] },
                  { k: 'Toplu İşlemler', cols: [true, true, true, true, false] },
                  { k: 'Performans İzleme', cols: [true, true, true, true, true] },
                  { k: 'Mobil Uyumlu', cols: [true, true, true, true, true] },
                  { k: 'Progressive Web App Desteği', cols: [true, true, true, true, true] },
                  { k: 'SSL Güvenlik', cols: [true, true, true, true, true] },
                  { k: 'İçerik Dağıtım Ağı Entegrasyonu', cols: [true, true, true, true, true] },
                  { k: 'Docker Konteynerleştirme', cols: [true, true, true, true, true] },
                ].map(row => (
                  <tr key={row.k}>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.k}</td>
                    {row.cols.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-sm">{v ? '✅' : '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Referanslar */}
      <section className="py-16" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Kullanıcı Deneyimleri</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'S. Vural Travel', quote: '5 dakikada canlıya aldık, sürücü atamaları yarı yarıya hızlandı.' },
              { name: 'City Shuttle', quote: 'Muhasebe onay akışı netleşti, hata oranımız belirgin düştü.' },
              { name: 'TourPro', quote: 'Tur modülü ile rota ve araç yönetimi tek ekranda toplandı.' },
            ].map((t) => (
              <div key={t.name} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="text-gray-700">“{t.quote}”</div>
                <div className="mt-3 text-sm font-semibold text-gray-900">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ekran Görüntüleri */}
      <section className="py-16 bg-gray-50" id="screens">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Ekran Görüntüleri</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Dashboard', desc: 'Anlık özet ve hızlı aksiyonlar' },
              { title: 'Rezervasyon', desc: 'Yeni rezervasyon ve atama akışı' },
              { title: 'Raporlar', desc: 'Gelir, dağılım ve popüler rotalar' },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-sm select-none">
                  Görsel Yer Tutucu
                </div>
                <div className="p-4">
                  <div className="font-semibold text-gray-900">{s.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kısa Tanıtım Videosu */}
      <section className="py-16" id="video">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Kısa Tanıtım Videosu</h2>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="aspect-video rounded-lg bg-black/80 flex items-center justify-center text-white">
              <button
                onClick={() => window.open('/protransfer', '_blank')}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
              >
                Demoyu Aç
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-3">
              Not: Demo akışını canlı olarak görmek için butona tıklayın.
            </div>
          </div>
        </div>
      </section>

      {/* İletişim Formu (hafif) */}
      <section className="py-16 bg-gray-50" id="contact">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Bizimle İletişime Geçin</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const name = fd.get('name');
              const email = fd.get('email');
              const message = fd.get('message');
              const body = encodeURIComponent(`İsim: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`);
              window.location.href = `mailto:info@proacente.com?subject=Pro%20Acente%20Bilgi%20Talebi&body=${body}`;
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <input name="name" required placeholder="Ad Soyad" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
            <input name="email" type="email" required placeholder="E-posta" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
            <textarea name="message" required placeholder="Mesajınız" rows={4} className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold">Gönder</button>
            </div>
          </form>
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

      {/* Acente için çözdüklerimiz */}
      <section className="py-16" id="pain-relief">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Acente için çözdüklerimiz</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Dağınık iletişim → tek akış', desc: 'Telefon/WhatsApp/Excel karmaşasını bitirir; tek kaynaktan ilerlersiniz.' },
              { title: 'Geç atama sorunları', desc: 'Rezervasyon gelir gelmez sürücü atayın, anında bildirim gönderin.' },
              { title: 'Yanlış konum paylaşımı', desc: 'Müşteriye ve sürücüye doğru linklerle (Yandex/Apple/Google) paylaşım.' },
              { title: 'Gelir görünürlüğü yok', desc: 'Komisyon, hakediş ve kârlılık raporlarıyla net finans.' },
              { title: 'Websitesiz lead kaybı', desc: 'Hazır tema ve içerikle dakikalar içinde yayında olun.' },
              { title: 'Çok dil/para birimi', desc: 'Turist ve iş ortaklarıyla uyumlu dil/kur desteği.' },
              { title: 'Personel rolleri ve izinler', desc: 'Yetki matrisiyle kim neyi görür/yapar netleşir; yanlış işlem, veri sızıntısı ve onay beklemeleri azalır. Satış rezervasyon açar, Operasyon atar, Muhasebe onaylar.' },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{f.title}</div>
                <div className="text-gray-600 mt-2 text-sm">{f.desc}</div>
                {f.title === 'Personel rolleri ve izinler' && (
                  <div className="mt-3 text-sm text-gray-700">
                    <div className="font-medium text-gray-900 mb-1">Örnek rol dağılımı:</div>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><span className="font-medium">Yönetici</span>: Tüm modüller, ayarlar, kullanıcı/rol yönetimi, raporlar.</li>
                      <li><span className="font-medium">Satış</span>: Rezervasyon oluşturma/düzenleme, müşteri kartları, fiyat teklifi.</li>
                      <li><span className="font-medium">Operasyon</span>: Sürücü/araç atama, voucher, rota ve durum yönetimi.</li>
                      <li><span className="font-medium">Muhasebe</span>: Komisyon onayı, hakediş, ödemeler ve gelir raporları.</li>
                      <li><span className="font-medium">Sürücü</span>: Kendi atamaları, navigasyon, müşteri iletişim bilgisi (sınırlı).</li>
                    </ul>
                    <div className="mt-2 text-gray-600">İzinler modül bazında açılıp kapatılabilir; iç denetim kolaylaşır, hata ve suistimal riski düşer.</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section className="py-16 bg-gray-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Öne Çıkan Özellikler</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Online Rezervasyon & Website', desc: 'Beyaz etiket website + içerik yönetimi + domain eşleme.' },
              { title: 'Atama & Bildirim', desc: 'WhatsApp ile müşteriye ve şoföre tek tıkla voucher/rota paylaşımı.' },
              { title: 'Uçuş & Rota Takibi', desc: 'Uçuş kodu, ETA, trafik ve rota bilgileri tek yerde.' },
              { title: 'Muhasebe & Komisyon', desc: 'TL/USD/EUR; komisyon onay, hakediş ve ödeme durumları.' },
              { title: 'Raporlar & Performans', desc: 'Kârlılık, sürücü performansı, popüler rotalar, kanal kırılımı.' },
              { title: 'Çoklu Marka/Şube', desc: 'Aynı hesap altında birden çok marka/tenant yönetimi.' },
              { title: 'Çok Dilli Voucher', desc: 'TR/EN/FR/RU/AR dahil 5+ dilde müşteri voucher’ı.' },
              { title: 'Sürücü Navigasyon', desc: 'Yandex / Apple / Google’a derin link ile tek dokunuş.' },
              { title: 'Alarm & Hatırlatıcı', desc: 'İş saatine 1 saat kala kırmızı alarm, gecikme uyarıları.' },
              { title: 'Rol Bazlı İzinler', desc: 'Rol bazlı erişim: yönetici, satış, operasyon, muhasebe, sürücü.' },
              { title: 'Audit Log', desc: 'Kritik aksiyonların izlenmesi ve denetlenebilirlik.' },
              { title: 'Yedekleme & Güvenlik', desc: 'Düzenli yedek, erişim kontrolü ve çoklu veri merkezi.' },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{f.title}</div>
                <div className="text-gray-600 mt-2 text-sm">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operasyon Otomasyonları */}
      <section className="py-16" id="automations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Operasyon Otomasyonları</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Kırmızı Alarm', desc: 'İşe 1 saat kala uyarı; riskli işlere öncelik verin.' },
              { title: 'Gecikme Notu', desc: 'Uçuş gecikme/erken iniş bilgisi ile ekip bilgilendirme.' },
              { title: 'Otomatik Şablonlar', desc: 'WhatsApp/e‑posta için çok dilli hazır şablonlar.' },
              { title: 'Akıllı Atama', desc: 'Sürücü uygunluğu ve rota yakınlığına göre öneriler.' },
              { title: 'Toplu Voucher', desc: 'Gruplu operasyonlarda tek tık toplu gönderim.' },
              { title: 'Log & İzleme', desc: 'Gönderim/okunma ve atama geçmişi kayıt altında.' },
            ].map((a) => (
              <div key={a.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{a.title}</div>
                <div className="text-gray-600 mt-2 text-sm">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Somut Sonuçlar */}
      <section className="py-16" id="outcomes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Somut Sonuçlar</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[ 
              { k: '%50 daha hızlı atama', d: 'Voucher ve navigasyon paylaşımıyla anında başlangıç' },
              { k: '%30 daha az iletişim trafiği', d: 'Tek ekran ve otomasyonlar ile' },
              { k: '%20 daha yüksek dönüşüm', d: 'Online form ve website ile 7/24 talep' },
              { k: 'Sıfır IT yükü', d: 'Kurulum, barındırma ve güncellemeler bize ait' },
            ].map((s) => (
              <div key={s.k} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm text-center">
                <div className="text-2xl font-extrabold text-gray-900">{s.k}</div>
                <div className="text-gray-600 mt-2 text-sm">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fiyatlandırma */}
      <section className="py-16" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Fiyatlandırma</h2>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {[ 
              { name: 'Professional', price: '₺50.000', features: [
                'Rol bazlı erişim kontrolü', 'Transfer Modülü', 'Tur Yönetimi', 'Konaklama Yönetimi', 'Raporlama', 'Kullanıcı Yönetimi', 'Şoför Atama',
                'İş saatine 1 saat kala kırmızı alarm', 'Voucher gönderimi (5 dil, WhatsApp müşteri + şoför)', 'Muhasebe', 'Sürücü için navigasyon'
              ] },
              { name: 'Enterprise', price: '₺60.000', features: [
                'Profesyonel paketteki tüm özellikler', 'Uçuş Yönetimi', 'API Erişimi', 'Tek Oturum Açma',
                'Fatura ön‑dolum (prefill)', 'Rezervasyon lookup & push (API)', 'Gelişmiş Raporlama', 'Öncelikli Destek'
              ] },
              { name: 'Premium', price: '₺70.000', features: [
                'Enterprise paketteki tüm özellikler', 'Website (çoklu tenant)', 'UETDS Entegrasyonu',
                'Kur oranlarını otomatik güncelleme', 'Yedekleme & geri yükleme', 'Özel Domain & İçerik',
                'Çoklu marka/tenant yönetimi', 'Özel SLA ve eğitim', 'Özelleştirilmiş raporlar'
              ] },
            ].map((p) => (
              <div key={p.name} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                <div className="text-lg font-semibold text-gray-900">{p.name}</div>
                <div className="mt-2 text-2xl font-extrabold text-gray-900">{p.price}</div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center"><span className="mr-2">✅</span> {f}</li>
                  ))}
                </ul>
                <a href="#cta" className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black">Teklif Al</a>
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
      <section className="py-16 bg-gray-50" id="integrations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Entegrasyonlar</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="text-lg font-semibold text-gray-900">Google Maps</div>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Routes, Distance Matrix</li>
                <li>• Places Autocomplete</li>
                <li>• Yolculuk süresi ve mesafe</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="text-lg font-semibold text-gray-900">Navigasyon</div>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Yandex / Apple / Google deep‑link</li>
                <li>• Uygulama yoksa web fallback</li>
                <li>• Sürücüye ve müşteriye tek tık paylaşım</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="text-lg font-semibold text-gray-900">Mesajlaşma</div>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• WhatsApp paylaşımı</li>
                <li>• E‑posta ile otomatik içerik</li>
                <li>• Şablon ve çok dilli metinler</li>
              </ul>
            </div>
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
      <section id="cta" className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Operasyonunuzu bugün dijitalleştirin</h2>
          <p className="text-gray-300 mb-8">Demoyu inceleyin veya bizimle iletişime geçin.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin-login" className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-gray-900 hover:bg-gray-100 font-semibold">Hemen Başlayın</Link>
            <Link href="/protransfer" className="inline-flex items-center px-6 py-3 rounded-lg border border-white text-white hover:bg-white hover:text-gray-900 font-semibold">Demoyu İncele</Link>
            <a href="mailto:info@proacente.com" className="inline-flex items-center px-6 py-3 rounded-lg border border-white text-white hover:bg-white hover:text-gray-900 font-semibold">Bize Ulaşın</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Pro Acente. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}


