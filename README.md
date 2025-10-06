# CRM Transfer - Multi-Tenant Travel Management System

Bu proje, çok kiracılı (multi-tenant) seyahat yönetim sistemi ve müşteri web siteleri için geliştirilmiş bir Next.js uygulamasıdır.

## 🏗️ Mimari

### Domain Yapısı
- **proacente.com** → CRM Admin Paneli (Acente yönetimi)
- **protransfer.com.tr** → Müşteri Web Sitesi (Şeref Vural teması)
- **Diğer tenant domainleri** → Her tenant'ın kendi müşteri web sitesi

### Ana Bileşenler
- **CRM Admin Paneli**: Rezervasyon, müşteri, araç, tur yönetimi
- **Müşteri Web Siteleri**: Dinamik içerik yönetimi ile tenant bazlı siteler
- **Multi-Tenant Yapı**: SUPERUSER tenant seçimi ve izolasyonu
- **API Entegrasyonları**: Google Maps, WhatsApp, Email

## 🚀 Kurulum

### Geliştirme Ortamı
```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
# veya
bun dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### Veritabanı
```bash
# Prisma migration
npx prisma migrate dev

# Veritabanı seed
npm run seed
```

## 🌐 Domain ve Website Yönetimi

### Yeni Tenant Website Ekleme

#### 1. DNS Ayarları
```
# Apex domain için
mytenant.com → ALIAS/A → Vercel IP

# WWW subdomain için  
www.mytenant.com → CNAME → cname.vercel-dns.com
```

#### 2. Vercel Domain Ekleme
- Vercel Dashboard → Project → Domains
- `mytenant.com` ve `www.mytenant.com` ekle

#### 3. Veritabanı Konfigürasyonu
```sql
-- TenantWebsite kaydı oluştur
INSERT INTO "TenantWebsite" (
  "id",
  "tenantId", 
  "domain",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'website_' || generate_random_uuid(),
  'tenant_id_here',
  'mytenant.com',
  true,
  NOW(),
  NOW()
);
```

#### 4. Uygulama Yönlendirmesi

**Seçenek A: Dedicated Sayfa (Önerilen)**
```typescript
// middleware.ts - Domain bazlı yönlendirme
if (hostname.includes('mytenant.com')) {
    if (pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/mytenant'; // Dedicated sayfa
        return NextResponse.rewrite(url);
    }
    // CRM yollarını engelle
    if (pathname.startsWith('/admin') || pathname === '/login') {
        const url = request.nextUrl.clone();
        url.pathname = '/mytenant';
        return NextResponse.rewrite(url);
    }
}
```

```typescript
// next.config.js - Edge-level rewrite
async rewrites() {
  return [
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'mytenant.com' }],
      destination: '/mytenant',
    },
  ]
}
```

**Seçenek B: Generic Website Route**
```typescript
// middleware.ts - Generic website routing
if (hostname.includes('mytenant.com')) {
    const url = request.nextUrl.clone();
    url.pathname = `/website/${hostname}`;
    return NextResponse.rewrite(url);
}
```

#### 5. İçerik Yönetimi
- Admin Panel → Website Modülü → Settings
- Logo, Hero Section, Hizmetler, İletişim bilgileri
- Sayfa içerikleri ve bölümler

### Website API Entegrasyonu

```typescript
// Domain → Tenant çözümleme
const tenantWebsite = await prisma.tenantWebsite.findFirst({
  where: {
    isActive: true,
    OR: [
      { domain: 'mytenant.com' },
      { domain: 'www.mytenant.com' }
    ]
  },
  include: {
    tenant: true,
    pages: true,
    sections: true
  }
});

// Fallback: Subdomain/Company name ile arama
const tenant = await prisma.tenant.findFirst({
  where: {
    OR: [
      { subdomain: 'mytenant' },
      { companyName: { contains: 'My Tenant', mode: 'insensitive' } }
    ]
  }
});
```

## 👥 Kullanıcı Rolleri ve Yetkilendirme

### SUPERUSER Özellikleri
- Tüm tenant'ları görüntüleme ve yönetme
- Tenant seçimi ile o tenant adına işlem yapma
- Global sistem ayarları
- Tenant bazlı modül kontrolü

### Tenant Seçimi (SUPERUSER)
```typescript
// TenantContext ile tenant seçimi
const { selectedTenantId, setSelectedTenantId, fetchWithTenant } = useTenant();

// API çağrılarında otomatik tenant header
const response = await fetchWithTenant('/api/reservations', {
  method: 'POST',
  body: JSON.stringify(reservationData)
});
```

### Agency Admin
- Sadece kendi tenant'ına erişim
- Rezervasyon, müşteri, araç yönetimi
- Website içerik yönetimi

## 🔧 Teknik Detaylar

### Middleware Routing
```typescript
// middleware.ts - Domain bazlı yönlendirme
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // proacente.com → CRM
  if (hostname.includes('proacente.com')) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // protransfer.com.tr → Website
  if (hostname.includes('protransfer.com.tr')) {
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/protransfer';
      return NextResponse.rewrite(url);
    }
    // CRM yollarını engelle
    if (pathname.startsWith('/admin') || pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/protransfer';
      return NextResponse.rewrite(url);
    }
  }
}
```

### Cache Yönetimi
```bash
# Vercel cache temizleme
curl -X POST "https://api.vercel.com/v1/integrations/deploy/your-project-id/purge" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN"
```

### Build ve Deploy
```bash
# Production build
npm run build

# Vercel deploy
vercel --prod

# Cache temizleme ile redeploy
vercel --prod --force
```

## 📁 Proje Yapısı

```
app/
├── admin/                 # CRM Admin Paneli
├── api/                   # API Routes
├── components/            # Paylaşılan bileşenler
├── contexts/             # React Context'ler
├── protransfer/          # Dedicated website sayfası
├── website/              # Generic website routes
└── middleware.ts         # Domain routing

prisma/
├── schema.prisma         # Veritabanı şeması
└── migrations/           # Migration dosyaları
```

## 🔍 Troubleshooting

### Domain Yönlendirme Sorunları
1. **Cache Temizleme**: Vercel dashboard → Deployments → Redeploy with "Clear build cache"
2. **Middleware Kontrol**: `middleware.ts` domain kurallarını kontrol et
3. **Next.config.js**: Edge-level rewrite kurallarını kontrol et
4. **Browser Cache**: Gizli pencerede test et

### Tenant Website Sorunları
1. **Veritabanı Kontrol**: `TenantWebsite` tablosunda domain kaydı var mı?
2. **DNS Kontrol**: Domain Vercel'e doğru yönlendiriliyor mu?
3. **API Test**: `/api/website/content/domain` endpoint'i çalışıyor mu?

## 📚 API Dokümantasyonu

### Website Content API
```
GET /api/website/content/{domain}
Response: {
  tenant: Tenant,
  pages: Page[],
  sections: Section[],
  content: string (JSON)
}
```

### Reservation API
```
POST /api/reservations
Headers: {
  x-tenant-id: string (SUPERUSER için)
}
Body: ReservationData
```

## 🚀 Deployment

### Vercel Deployment
1. GitHub repository'yi Vercel'e bağla
2. Environment variables ayarla
3. Domain'leri ekle
4. Deploy

### Environment Variables
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
GOOGLE_MAPS_API_KEY=...
```

---

**Son Güncelleme**: 2025-01-30
**Versiyon**: 2.0.0