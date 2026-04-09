'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function MarketingPage() {
  const { language, setLanguage, t } = useLanguage();
  const faqItems = [
    {
      q: 'Pro Acente hangi işletmeler için uygundur?',
      a: 'Transfer şirketleri, tur operatörleri, incoming/outgoing acenteler ve operasyon + muhasebe süreçlerini tek panelde toplamak isteyen ekipler için uygundur.',
    },
    {
      q: 'WhatsApp entegrasyonu ne sağlar?',
      a: 'Müşteri mesajlarını tek panelde toplar, çoklu oturum yönetimi sunar, operasyon ekibinin mesajlardan hızlı rezervasyon oluşturmasını kolaylaştırır.',
    },
    {
      q: 'Yapay zeka tarafında neler var?',
      a: 'Mesaj çevirisi, rezervasyon bilgisini ayıklama, müşteri talebini operasyon akışına çevirme ve ekip için hızlı aksiyon önerileri sağlar.',
    },
    {
      q: 'Tur ve koltuklama süreçleri destekleniyor mu?',
      a: 'Tur rezervasyonları, rota, araç, sürücü ve grup operasyonu desteklenir; tur koltuklama/yerleşim gibi akışlar için genişlemeye uygun altyapı mevcuttur.',
    },
    {
      q: 'Website ve online rezervasyon var mı?',
      a: 'Evet. Website modülü, içerik yönetimi, domain eşleme ve rezervasyon toplama akışı ile birlikte gelir.',
    },
    {
      q: 'Muhasebe ve raporlama tarafı ne kadar güçlü?',
      a: 'Komisyon, hakediş, ödeme, kur desteği, fatura ön-dolum ve operasyon kârlılığını izleyen raporlar aynı sistemde yer alır.',
    },
  ];
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Pro Acente',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://www.proacente.com/',
    description: 'Turizm acenteleri için transfer, tur, operasyon, muhasebe, WhatsApp ve yapay zeka destekli yönetim sistemi.',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TRY',
      availability: 'https://schema.org/InStock'
    },
    featureList: [
      'WhatsApp operasyon paneli',
      'Yapay zeka destekli mesaj ve rezervasyon akışı',
      'Transfer ve tur yönetimi',
      'Muhasebe ve komisyon takibi',
      'Website ve online rezervasyon',
      'B2B API ve webhook entegrasyonları'
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Pro Acente'
    }
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
  const [open, setOpen] = useState(false);
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ru', label: 'Русский' },
    { code: 'ar', label: 'العربية' },
    { code: 'tr', label: 'Türkçe' },
  ] as const;

  const current = languages.find(l => l.code === language) || languages[0];
  const scRef = useRef<HTMLDivElement>(null);
  const [isHover, setIsHover] = useState(false);
  const screenshots = [
    { title: 'Dashboard', desc: 'Anlık özet ve hızlı aksiyonlar', src: '/screenshots/dashboard.png' },
    { title: 'Rezervasyon', desc: 'Yeni rezervasyon ve atama akışı', src: '/screenshots/reservation.png' },
    { title: 'Tüm Rezervasyonlar', desc: 'Liste, filtreler ve durumlar', src: '/screenshots/tumrezervasyonlar.png' },
    { title: 'Raporlar', desc: 'Gelir, dağılım ve popüler rotalar', src: '/screenshots/reports.png' },
    { title: 'Voucher', desc: 'Paylaşılabilir rezervasyon özeti', src: '/screenshots/voucheri.png' },
    { title: 'Müşteri Voucherı', desc: 'PDF/WhatsApp paylaşımı için voucher', src: '/screenshots/mvoucheri.png' },
  ] as const;

  useEffect(() => {
    if (!scRef.current) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const container = scRef.current;
    const tick = () => {
      if (!container) return;
      // Horizontal kaydırma: dikey sayfa konumunu etkilemeden yalnızca x ekseninde kaydır
      container.scrollBy({ left: 400, behavior: 'smooth' });
    };

    const interval = setInterval(() => {
      if (!document.hidden && !isHover) tick();
    }, 4000);

    return () => clearInterval(interval);
  }, [isHover]);

  return (
    <>
      <Script id="software-application-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200 text-gray-900 dark:text-slate-100">
      {/* Top Bar */}
      <div className="bg-slate-950 text-white text-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-6 text-slate-300">
            <a href="tel:+905545812034" className="hover:text-white transition-colors">+90 554 581 20 34</a>
            <a href="mailto:hakancinelii@gmail.com" className="hover:text-white transition-colors">hakancinelii@gmail.com</a>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a href="https://wa.me/905545812034" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-emerald-300 hover:bg-emerald-500/25 hover:text-emerald-200 font-medium transition-colors border border-emerald-400/20">
              <span aria-hidden="true">💬</span>
              <span>WhatsApp'tan Mesaj At</span>
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
  <header className="sticky top-0 bg-white/92 dark:bg-slate-950/92 backdrop-blur-xl z-40 border-b border-slate-200/80 dark:border-slate-800 shadow-[0_12px_40px_rgba(15,23,42,0.05)] dark:shadow-none transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-slate-100">Pro Acente</span>
          </Link>
          <div className="flex items-center gap-3 lg:gap-5 text-sm">
            <nav className="hidden xl:flex items-center gap-6 text-[15px] text-gray-600">
              <Link href="#features" className="hover:text-gray-900 transition-colors">Özellikler</Link>
              <Link href="#pricing" className="hover:text-gray-900 transition-colors">Fiyatlandırma</Link>
              <Link href="#faq" className="hover:text-gray-900 transition-colors">SSS</Link>
            </nav>
            <div className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-controls="language-menu"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm dark:shadow-none transition-colors duration-200"
                title="Language"
              >
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-slate-200">{current.label}</span>
                <span className="sm:ml-2">▾</span>
              </button>
              {open && (
                <div id="language-menu" className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg dark:shadow-none z-50 transition-colors duration-200">
                  <ul className="py-1" aria-label="Language options">
                    {languages.map((l) => (
                      <li key={l.code}>
                        <button
                          type="button"
                          onClick={() => {
                            setLanguage(l.code as any);
                            setOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 ${language === l.code ? 'text-gray-900 dark:text-slate-100 font-medium' : 'text-gray-700 dark:text-slate-300'}`}
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
            <Link href="/admin-login" className="hidden sm:inline-flex text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 transition-colors">{t('marketing.nav.admin')}</Link>
            <Link href="/admin-login?demo=1" className="inline-flex items-center px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-sm font-semibold">{t('marketing.nav.demo')}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.10),_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.16),_transparent_28%),linear-gradient(to_bottom,_#020617,_#0f172a)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-[1.08fr_0.92fr] gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-semibold border border-emerald-100 dark:border-emerald-500/20 shadow-sm dark:shadow-none transition-colors duration-200">Turizm acenteleri için operasyon, WhatsApp ve muhasebe tek panelde</div>
            <h1 className="mt-5 max-w-5xl text-5xl sm:text-6xl lg:text-[5.25rem] xl:text-[5.75rem] leading-[0.92] font-black tracking-[-0.04em] text-slate-950 dark:text-slate-100">{t('marketing.hero.title')}</h1>
            <p className="mt-7 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-9">{t('marketing.hero.subtitle')}</p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link href="/admin-login?demo=1" className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-green-600 text-white hover:bg-green-700 font-semibold shadow-lg shadow-green-200/70 dark:shadow-none">{t('marketing.hero.ctaStart')}</Link>
              <Link href="#features" className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm dark:shadow-none transition-colors duration-200">{t('marketing.hero.ctaFeatures')}</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors duration-200">WhatsApp entegrasyonu</span>
              <span className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors duration-200">Yapay zeka destekli akışlar</span>
              <span className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors duration-200">Tur operasyonu ve koltuklama</span>
              <span className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors duration-200">Muhasebe ve raporlama</span>
            </div>
            <div className="mt-7 text-sm text-slate-500 dark:text-slate-400">{t('marketing.hero.note')}</div>
          </div>
          <div className="lg:pl-2">
            <div className="rounded-[2rem] border border-slate-200/80 shadow-[0_35px_90px_rgba(15,23,42,0.10)] p-6 sm:p-7 bg-white/95 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-emerald-50 via-transparent to-sky-50" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                  <div>
                    <div className="text-sm uppercase tracking-[0.18em] text-slate-400 font-semibold">Canlı operasyon özeti</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">Rezervasyon → Atama → Operasyon</div>
                    <div className="mt-2 text-sm text-slate-500">Tek panel üzerinden gelen talebi operasyon akışına çevirin.</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-semibold border border-emerald-100">7/24 erişim</div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { t: 'Hızlı kurulum', d: 'Aynı gün yayında, veri aktarımı ve ekip geçiş desteği.', stat: '1 gün' },
                    { t: 'Online talep', d: 'Website ve formlarla günün her saati rezervasyon toplayın.', stat: '7/24' },
                    { t: 'Tek tık paylaşım', d: 'Voucher, konum ve iletişim bilgisini WhatsApp ile paylaşın.', stat: '1 tık' },
                    { t: 'Canlı takip', d: 'Uçuş, rota, sürücü ve operasyon durumunu tek panelde izleyin.', stat: 'canlı' },
                  ].map((c, index) => (
                    <div key={c.t} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-semibold">{index + 1}</div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{c.stat}</div>
                      </div>
                      <div className="font-semibold text-slate-900 text-base mb-2">{c.t}</div>
                      <div className="text-slate-600 leading-6">{c.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kısa Tanıtım Videosu */}
      <section className="py-16" id="video">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Sistemi 1 dakikada görün</h2>
            <p className="text-gray-600 mb-6 max-w-2xl">Rezervasyon, operasyon, WhatsApp, sürücü atama, voucher ve rapor akışlarını kısa tanıtım videosunda tek bakışta görün.</p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200">Transfer ve tur operasyonu</span>
              <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200">WhatsApp ve müşteri iletişimi</span>
              <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200">Muhasebe ve rapor görünürlüğü</span>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <video className="w-full h-full" controls preload="metadata" src="/tanıtım-video.mp4">Tarayıcınız video etiketini desteklemiyor.</video>
            </div>
          </div>
        </div>
      </section>

      {/* Ekran Görüntüleri */}
      <section className="py-16 bg-gray-50" id="screenshots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">{t('marketing.sections.screenshots')}</h2>
          <div className="relative">
            <div
              ref={scRef}
              className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory"
              aria-label="Ekran görüntüleri kaydırma galerisi"
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              {screenshots.map((s) => (
                <div data-slide="true" key={s.title} className="snap-start min-w-[280px] sm:min-w-[340px] lg:min-w-[420px] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
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
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
              <button
                type="button"
                aria-label="Galeriyi sola kaydır"
                onClick={() => scRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                className="pointer-events-auto hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-white focus:outline-none"
                title="Sola kaydır"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Galeriyi sağa kaydır"
                onClick={() => scRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                className="pointer-events-auto hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-white focus:outline-none"
                title="Sağa kaydır"
              >
                ›
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-3">Görseller <code>/public/screenshots/</code> altındaki <code>dashboard.png</code>, <code>reservation.png</code>, <code>tumrezervasyonlar.png</code>, <code>reports.png</code>, <code>voucheri.png</code>, <code>mvoucheri.png</code> dosyalarından yüklenir. Liste sağa-sola kaydırılabilir.</div>
        </div>
      </section>

      {/* Değer Önerileri (3 ana başlık) */}
      <section className="py-16" id="value-props">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">{t('marketing.sections.valueProps')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Turizm acente yönetim sistemi', desc: 'Transfer, tur, rezervasyon, muhasebe ve operasyon akışlarını tek panelde birleştirin.' },
              { title: 'WhatsApp ve yapay zeka destekli akışlar', desc: 'Müşteri mesajlarını yönetin, çevirin, rezervasyon bilgilerini çıkarın ve operasyonu hızlandırın.' },
              { title: 'Modüler ama tek sistem', desc: 'Transfer, Tur, Konaklama, Uçuş, Website ve raporlama modülleri birlikte çalışır.' },
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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">{t('marketing.sections.features')}</h2>
          
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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">{t('marketing.sections.compare')}</h2>
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
                  { k: 'UETDS Entegrasyonu', cols: [true, false, false, false, false] },
                  { k: 'Fatura Ön-Dolum (Prefill)', cols: [true, true, true, true, false] },
                  { k: 'Rezervasyon Lookup (Voucher)', cols: [true, true, true, true, false] },
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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">{t('marketing.sections.testimonials')}</h2>
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

      

      {/* İletişim Formu (hafif) */}
      <section className="py-16 bg-gray-50" id="contact">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">{t('marketing.sections.contact')}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const name = fd.get('name');
              const email = fd.get('email');
              const message = fd.get('message');
              const body = encodeURIComponent(`İsim: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`);
              window.location.href = `mailto:hakancinelii@gmail.com?subject=Pro%20Acente%20Bilgi%20Talebi&body=${body}`;
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <input name="name" required placeholder={t('marketing.contact.name')} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
            <input name="email" type="email" required placeholder={t('marketing.contact.email')} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
            <textarea name="message" required placeholder={t('marketing.contact.message')} rows={4} className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold">{t('marketing.contact.submit')}</button>
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

      {/* Neden Pro Acente */}
      <section className="py-16 bg-gray-50" id="why-pro-acente">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Turizm acenteleri neden Pro Acente kullanıyor?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'WhatsApp merkezi', desc: 'Tek panelden müşteri konuşmaları, QR oturumu, mesaj geçmişi ve operasyon akışı.' },
              { title: 'Yapay zeka destekli rezervasyon akışı', desc: 'Mesajdan transfer veya tur rezervasyonu bilgisi çıkarma, çeviri ve hızlı aksiyon oluşturma.' },
              { title: 'Tur operasyonu ve koltuklama altyapısı', desc: 'Tur rezervasyonları, rota, araç, sürücü ve grup operasyonunu tek ekranda toparlayan yapı.' },
              { title: 'Muhasebe ve rapor görünürlüğü', desc: 'Komisyon, hakediş, ödeme, fatura ön-dolum ve performans raporları aynı ürün içinde.' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{item.title}</div>
                <div className="text-gray-600 mt-2 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
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
              { title: 'WhatsApp Operasyon Paneli', desc: 'QR ile bağlanan çoklu WhatsApp oturumu, sohbet yönetimi ve rezervasyon akışı.' },
              { title: 'Yapay Zeka Destekli İş Akışları', desc: 'Mesaj çevirisi, rezervasyon çıkarımı ve müşteri talebini operasyon kaydına dönüştürme.' },
              { title: 'Tur Yönetimi & Koltuklama Altyapısı', desc: 'Tur rezervasyonları, rota, araç, sürücü ve grup organizasyonu için merkez panel.' },
              { title: 'Atama & Bildirim', desc: 'WhatsApp ile müşteriye ve şoföre tek tıkla voucher/rota paylaşımı.' },
              { title: 'Uçuş & Rota Takibi', desc: 'Uçuş kodu, ETA, trafik ve rota bilgileri tek yerde.' },
              { title: 'Muhasebe & Komisyon', desc: 'TL/USD/EUR; komisyon onay, hakediş ve ödeme durumları.' },
              { title: 'Raporlar & Performans', desc: 'Kârlılık, sürücü performansı, popüler rotalar, kanal kırılımı.' },
              { title: 'Website ve Online Rezervasyon Toplama', desc: 'Domain eşleme, içerik yönetimi ve rezervasyon akışını tek platformdan yönetin.' },
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

      {/* Ürün Modülleri */}
      <section className="py-16 bg-gray-50" id="module-clusters">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Tek ürün içinde çalışan ana modüller</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Transfer Yönetimi', desc: 'Rezervasyon, sürücü atama, voucher, navigasyon ve uçuş takibi.' },
              { title: 'Tur Operasyonu', desc: 'Tur rezervasyonları, rota, araç, grup organizasyonu ve koltuklama altyapısı.' },
              { title: 'WhatsApp CRM', desc: 'Sohbet yönetimi, medya paylaşımı, QR oturumu ve operasyon akışı.' },
              { title: 'Yapay Zeka Desteği', desc: 'Mesaj çevirisi, rezervasyon ayrıştırma ve hızlı aksiyon önerileri.' },
              { title: 'Muhasebe ve Komisyon', desc: 'Hakediş, ödeme, komisyon, kur desteği ve fatura ön-dolum süreçleri.' },
              { title: 'Website ve Rezervasyon Toplama', desc: 'Domain eşleme, içerik yönetimi ve online rezervasyon akışı.' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{item.title}</div>
                <div className="text-gray-600 mt-2 text-sm">{item.desc}</div>
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
              { k: '%50 daha hızlı atama', d: 'Voucher, navigasyon ve WhatsApp paylaşımıyla daha hızlı saha başlangıcı.' },
              { k: '%30 daha az iletişim trafiği', d: 'Tek ekran ve operasyon otomasyonlarıyla ekip içi yük azalır.' },
              { k: '%20 daha yüksek dönüşüm', d: 'Website ve online rezervasyon akışıyla talep toplama güçlenir.' },
              { k: 'Sıfır IT yükü', d: 'Kurulum, barındırma, güncelleme ve teknik bakım tarafı merkezi yönetilir.' },
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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">{t('marketing.sections.pricing')}</h2>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { name: 'Professional', upfront: 50000, monthly: 5000, features: [
                'Transfer Modülü', 'Şoför Atama', 'Voucher gönderimi (5 dil, WhatsApp müşteri + şoför)', 'Sürücü için navigasyon',
                'Rol bazlı erişim kontrolü', 'Kullanıcı Yönetimi', 'Muhasebe', 'Raporlama', 'İş saatine 1 saat kala kırmızı alarm'
              ] },
              { name: 'Enterprise', upfront: 60000, monthly: 6000, features: [
                'Transfer Modülü', 'Tur Yönetimi', 'Konaklama Yönetimi',
                'Profesyonel paketteki tüm özellikler', 'Uçuş Yönetimi', 'Tek Oturum Açma',
                'Rezervasyon lookup', 'Fatura ön‑dolum (prefill)', 'Gelişmiş Raporlama', 'Öncelikli Destek'
              ] },
              { name: 'Premium', upfront: 70000, monthly: 7000, features: [
                'Enterprise paketteki tüm özellikler', 'Website (çoklu tenant)', 'UETDS Entegrasyonu',
                'Kur oranlarını otomatik güncelleme', 'Yedekleme & geri yükleme', 'Özel Domain & İçerik',
                'Çoklu marka/tenant yönetimi', 'Özel SLA ve eğitim', 'Özelleştirilmiş raporlar'
              ] },
            ].map((p) => {
              const monthlyWithInstallment = Math.round((p.upfront * 1.2) / 12);
              return (
                <div key={p.name} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                  <div className="text-lg font-semibold text-gray-900">{p.name}</div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                      <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Peşin ödeme</div>
                      <div className="mt-1 text-2xl font-extrabold text-gray-900">₺{p.upfront.toLocaleString('tr-TR')}</div>
                    </div>
                    <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                      <div className="text-xs uppercase tracking-wide text-green-700 font-semibold">Aylık abonelik</div>
                      <div className="mt-1 text-2xl font-extrabold text-green-700">₺{monthlyWithInstallment.toLocaleString('tr-TR')}<span className="text-sm font-semibold text-green-600"> / ay</span></div>
                      <div className="text-xs text-green-700 mt-1">Peşin fiyatın %20 fazlası üzerinden 12 aya bölünmüş taksitli model</div>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mr-1 flex-shrink-0">✅</span>
                        <span className="leading-5">{f}</span>
                        {p.name === 'Premium' && typeof f === 'string' && f.startsWith('Website') && (
                          <a
                            href="https://www.proacente.com/protransfer"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                            title={t('marketing.buttons.themePreview')}
                          >
                            {t('marketing.buttons.themePreview')}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                  <a href="#cta" className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black">{t('marketing.pricing.cta')}</a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Neden Biz */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          {[
            { title: 'Gerçek operasyonla test edildi', desc: 'Saha geri bildirimleriyle şekillenen akışlar.' },
            { title: 'Hız ve güven', desc: 'Hızlı, güvenilir ve ölçeklenebilir altyapı.' },
            { title: 'Çoklu dil ve para birimi', desc: 'TR/EN/FR/RU ve TRY/USD/EUR desteği.' },
          ].map((n) => (
            <div key={n.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="text-lg font-semibold text-gray-900">{n.title}</div>
              <div className="text-gray-600 mt-2 text-sm">{n.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Kullanım Senaryoları */}
      <section className="py-16 bg-gray-50" id="use-cases">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Hangi acenteler için uygun?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Transfer Acenteleri', desc: 'Uçuş takibi, sürücü atama, voucher ve müşteri iletişimi tek akışta.' },
              { title: 'Tur Operatörleri', desc: 'Tur rezervasyonları, rota, araç, sürücü ve operasyon takibi için.' },
              { title: 'Incoming / DMC Ekipleri', desc: 'Yabancı müşteri iletişimi, çok dilli voucher ve saha organizasyonu için.' },
              { title: 'Büyüyen Çok Şubeli Yapılar', desc: 'Çoklu marka, kullanıcı rolleri, raporlama ve website modülüyle ölçeklenir.' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{item.title}</div>
                <div className="text-gray-600 mt-2 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Entegrasyonlar */}
      <section className="py-16 bg-gray-50" id="integrations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Entegrasyonlar</h2>
          <p className="text-gray-600 mb-8 max-w-3xl">Google Maps, navigasyon, WhatsApp, e-posta ve website odaklı rezervasyon akışları; turizm acentelerinin sahadaki operasyonunu hızlandırmak için aynı platformda birleşir.</p>
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
            {faqItems.map((item, idx) => (
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
          <h2 className="text-3xl font-extrabold mb-4">{t('marketing.sections.cta.title')}</h2>
          <p className="text-gray-300 mb-8">{t('marketing.sections.cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin-login" className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-gray-900 hover:bg-gray-100 font-semibold">{t('marketing.sections.cta.start')}</Link>
            <Link href="/protransfer" className="inline-flex items-center px-6 py-3 rounded-lg border border-white text-white hover:bg-white hover:text-gray-900 font-semibold">{t('marketing.sections.cta.demo')}</Link>
            <a href="https://wa.me/905545812034" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 rounded-lg border border-white text-white hover:bg-white hover:text-gray-900 font-semibold">{t('marketing.sections.cta.contact')}</a>
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
    </>
  );
}


