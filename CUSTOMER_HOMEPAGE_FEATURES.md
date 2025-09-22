# Müşteri Tarafı Ana Sayfa Özellikleri

## Genel Bakış
Bu dokümantasyon, ProTransfer CRM sisteminin müşteri tarafındaki ana sayfa özelliklerini detaylandırır. Bu özellikler başka bir projede kullanılmak üzere hazırlanmıştır.

## Ana Sayfa Bileşenleri

### 1. Hero Section (Ana Bölüm)
- **Başlık**: "ProTransfer - İstanbul Havalimanı Transfer Hizmeti"
- **Alt Başlık**: Açıklayıcı metin
- **CTA Butonları**:
  - "Rezervasyon Talebi Gönder" (Yeşil buton)
  - "WhatsApp'tan Yaz" (Beyaz buton, yeşil border)
- **Özellik Kartları**:
  - 7/24 Hizmet
  - Sabit Fiyat
  - Profesyonel Şoför
  - Kapasite Bilgisi

### 2. Araç Slider Bileşeni
- **Dosya**: `app/components/landing/VehicleSlider.tsx`
- **Özellikler**:
  - 12 adet Mercedes Vito görseli
  - Otomatik geçiş (7 saniye)
  - Manuel navigasyon butonları
  - Alt kısımda nokta göstergeleri
  - Responsive tasarım
  - Next.js Image optimizasyonu

### 3. Hizmet Özellikleri Bölümü
- **Başlık**: "Neden ProTransfer?"
- **Özellikler**:
  - Uçuş takibi ve gecikme toleransı
  - Karşılama hizmeti ve bagaj desteği
  - Bebek koltuğu ve özel taleplere hızlı cevap
  - Kurumsal sözleşmeli transfer seçenekleri
- **Fiyat Bilgilendirmesi**: "Konumları girdiğiniz anda ücretinizi anında görün. Sabit fiyat, sürpriz yok."

### 4. Üç Sütunlu İçerik Bölümü

#### A. Müşteri Yorumları
- **Başlık**: "Müşteri Yorumları"
- **Özellikler**:
  - 30 adet Google yorumu
  - 5 yıldızlı değerlendirme sistemi
  - Scroll edilebilir liste
  - Dinamik yorum yükleme

#### B. Sık Sorulan Sorular (FAQ)
- **Başlık**: "Sık Sorulan Sorular"
- **10 Adet FAQ**:
  1. Rezervasyon nasıl yapılır?
  2. Fiyatlar sabit mi?
  3. Uçuş gecikmesi durumunda ne olur?
  4. Bagaj limiti var mı?
  5. Bebek koltuğu mevcut mu?
  6. Ödeme nasıl yapılır?
  7. İptal politikası nedir?
  8. Şoför bilgileri nasıl alınır?
  9. Havaalanında buluşma noktası nerede?
  10. Grup rezervasyonu yapılabilir mi?

#### C. İletişim Bilgileri
- **Başlık**: "İletişim"
- **Bilgiler**:
  - WhatsApp: +90 554 581 20 34
  - Telefon: +90 554 581 20 34
  - Adresler:
    - İstanbul Havalimanı (IST)
    - Sabiha Gökçen Havalimanı (SAW)
    - Beşiktaş, İstanbul

### 5. Günlük Şoför Hizmeti Bölümü
- **Başlık**: "Günlük Şoför Hizmeti"
- **Açıklama**: Şehir içi ve şehirler arası günlük şoför hizmeti
- **Özellikler**:
  - 8 saatlik paketler
  - Esnek rota planlaması
  - Profesyonel şoförler
- **WhatsApp CTA**: "WhatsApp'tan Fiyat Al"

### 6. Şehirler Arası Transfer Bölümü
- **Başlık**: "Şehirler Arası Transfer"
- **Açıklama**: İstanbul'dan diğer şehirlere konforlu transfer
- **Özellikler**:
  - İstanbul → Ankara, İzmir, Bursa, Antalya
  - VIP Mercedes Vito ve lüks sedan
  - 7/24 hizmet
  - Bagaj kapasitesi
- **Örnek Güzergahlar**:
  - İstanbul → Ankara: 450 km
  - İstanbul → İzmir: 480 km
  - İstanbul → Bursa: 155 km
  - İstanbul → Antalya: 485 km

### 7. Son CTA Bölümü
- **Başlık**: "Hazır mısınız?"
- **Açıklama**: Rezervasyon yapmaya hazır olduğunuzu belirten metin
- **Butonlar**:
  - "Rezervasyon Talebi Gönder"
  - "WhatsApp'tan Yaz"

## Teknik Özellikler

### 1. Çok Dilli Destek
- **Dil Dosyaları**: `app/locales/`
- **Desteklenen Diller**: TR, EN, AR, DE, FR
- **Context**: `LanguageContext.tsx`
- **Dinamik Çeviri**: `t()` fonksiyonu

### 2. Responsive Tasarım
- **Mobile First**: Tailwind CSS
- **Breakpoints**: sm, md, lg, xl
- **Grid System**: CSS Grid ve Flexbox
- **Adaptive Layout**: Farklı ekran boyutları için optimize

### 3. SEO Optimizasyonu
- **Meta Tags**: Title, description, keywords
- **Open Graph**: Facebook paylaşımları için
- **Twitter Cards**: Twitter paylaşımları için
- **Structured Data**: Schema.org markup
- **Canonical URLs**: Duplicate content önleme

### 4. Performance Optimizasyonu
- **Next.js Image**: Otomatik optimizasyon
- **Lazy Loading**: Görseller için
- **Code Splitting**: Otomatik chunk'lar
- **Prefetching**: Link önceden yükleme

### 5. Accessibility (Erişilebilirlik)
- **ARIA Labels**: Screen reader desteği
- **Keyboard Navigation**: Tab ile gezinme
- **Color Contrast**: WCAG uyumlu renkler
- **Focus Management**: Odaklanma yönetimi

## Stil ve Tasarım

### 1. Renk Paleti
- **Primary**: Green (#16a34a)
- **Secondary**: Gray (#6b7280)
- **Background**: White (#ffffff)
- **Accent**: Light Green (#dcfce7)

### 2. Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Font-extrabold, tracking-tight
- **Body**: Font-medium, text-gray-600
- **Buttons**: Font-semibold

### 3. Spacing
- **Container**: max-w-7xl mx-auto
- **Padding**: px-4 sm:px-6 lg:px-8
- **Margins**: py-12, py-16, py-24
- **Gaps**: gap-4, gap-6, gap-8, gap-10

### 4. Components
- **Cards**: bg-white border rounded-xl shadow-sm
- **Buttons**: rounded-lg px-6 py-3
- **Inputs**: border border-gray-300 rounded-md
- **Badges**: rounded-md border px-2 py-1

## Entegrasyon Noktaları

### 1. Rezervasyon Formu
- **Route**: `/customer-reservation`
- **API**: `/api/reservations`
- **Redirect**: `/customer-reservation/thank-you`

### 2. WhatsApp Entegrasyonu
- **URL**: `https://wa.me/905545812034`
- **Message**: Dinamik mesaj içeriği
- **Target**: `_blank`

### 3. Google Maps
- **API Key**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Services**: Places API, Distance Matrix
- **Autocomplete**: Adres önerileri

### 4. Döviz Kurları
- **API**: `https://api.exchangerate-api.com/v4/latest/TRY`
- **Currencies**: TRY, USD, EUR
- **Real-time**: Otomatik güncelleme

## Dosya Yapısı

```
app/
├── page.tsx                          # Ana sayfa
├── customer-reservation/
│   ├── page.tsx                      # Rezervasyon formu
│   └── thank-you/
│       └── page.tsx                  # Teşekkür sayfası
├── components/
│   ├── landing/
│   │   └── VehicleSlider.tsx         # Araç slider
│   └── ui/
│       └── Header.tsx                # Header bileşeni
├── contexts/
│   ├── LanguageContext.tsx           # Dil yönetimi
│   ├── AuthContext.tsx               # Kimlik doğrulama
│   └── EmojiContext.tsx              # Emoji desteği
├── locales/
│   ├── tr.json                       # Türkçe çeviriler
│   ├── en.json                       # İngilizce çeviriler
│   ├── ar.json                       # Arapça çeviriler
│   ├── de.json                       # Almanca çeviriler
│   └── fr.json                       # Fransızca çeviriler
└── hooks/
    ├── useGoogleMaps.ts              # Google Maps hook
    └── useDebounce.ts                # Debounce hook
```

## Kullanım Örnekleri

### 1. Ana Sayfa Oluşturma
```tsx
import { useLanguage } from './contexts/LanguageContext';
import VehicleSlider from './components/landing/VehicleSlider';

export default function HomePage() {
  const { t } = useLanguage();
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                {t('landing.title')}
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                {t('landing.description')}
              </p>
              {/* CTA Buttons */}
            </div>
            <div className="lg:pl-8">
              <VehicleSlider />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
```

### 2. Dil Değiştirme
```tsx
import { useLanguage } from './contexts/LanguageContext';

function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <select 
      value={language} 
      onChange={(e) => setLanguage(e.target.value)}
    >
      <option value="tr">Türkçe</option>
      <option value="en">English</option>
      <option value="ar">العربية</option>
    </select>
  );
}
```

### 3. Rezervasyon Formu
```tsx
import { useState } from 'react';
import { useGoogleMaps } from './hooks/useGoogleMaps';

export default function ReservationForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { isLoaded: googleReady } = useGoogleMaps();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to })
    });
    // Handle response
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Özelleştirme Seçenekleri

### 1. Renk Teması
- CSS değişkenleri ile kolay değiştirme
- Tailwind config dosyasından yönetim
- Dark mode desteği eklenebilir

### 2. İçerik Yönetimi
- CMS entegrasyonu mümkün
- Dinamik içerik yükleme
- Admin paneli ile düzenleme

### 3. Ödeme Entegrasyonu
- Stripe, PayPal desteği
- Yerel ödeme yöntemleri
- Güvenli ödeme akışı

### 4. Analytics
- Google Analytics entegrasyonu
- Conversion tracking
- User behavior analizi

## Performans Metrikleri

### 1. Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### 2. SEO Skorları
- **Lighthouse**: 90+ puan
- **PageSpeed**: 90+ puan
- **Mobile Friendly**: 100% uyumlu

### 3. Accessibility
- **WCAG 2.1**: AA seviyesi
- **Screen Reader**: Tam destek
- **Keyboard Navigation**: Tam destek

## Güvenlik Önlemleri

### 1. Input Validation
- Client-side validation
- Server-side validation
- XSS koruması

### 2. CSRF Protection
- Token-based koruma
- Same-origin policy
- Secure headers

### 3. Data Privacy
- GDPR uyumlu
- Cookie consent
- Data encryption

## Sonuç

Bu müşteri tarafı ana sayfa, modern web geliştirme standartlarına uygun olarak geliştirilmiştir. Responsive tasarım, çok dilli destek, SEO optimizasyonu ve performans odaklı yaklaşımı ile başka projelerde kolayca kullanılabilir. Modüler yapısı sayesinde özelleştirme ve genişletme imkanı sunar.

## Lisans ve Kullanım

Bu kod örnekleri ve dokümantasyon, ProTransfer CRM projesinden alınmıştır. Başka projelerde kullanım için gerekli düzenlemeler yapılmalıdır.

---

**Son Güncelleme**: 2024
**Versiyon**: 1.0
**Dil**: Türkçe


