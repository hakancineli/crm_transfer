# Website Modülü Rollout Rehberi

## 🚀 Şeref Vural Teması Multi-Tenant Website Sistemi

### ✅ Tamamlanan Özellikler

1. **Database Schema** - Tenant website ayarları ve sayfa yönetimi
2. **Middleware** - Host header'dan tenant çözümleme
3. **API Routes** - Website aktivasyonu, ayarlar ve rezervasyon entegrasyonu
4. **Admin UI** - Modül Yönetimi'nde "Websiteyi Aktif Et" butonu ve domain yönetimi
5. **Website Theme** - Şeref Vural teması ile TR/EN/AR dil desteği
6. **Reservation Integration** - Website'den gelen rezervasyonlar `source=website` ile işaretleniyor

### 🎯 Kullanım Adımları

#### 1. Superuser Olarak Website Aktifleştirme
```
1. Admin Panel → Modül Yönetimi
2. İlgili acente için domain girin (örn: www.protransfer.com.tr)
3. "Websiteyi Aktif Et" butonuna tıklayın
4. Sistem otomatik olarak:
   - WEBSITE modülünü aktifleştirir
   - Şeref Vural teması ile default ayarları oluşturur
   - TR/EN/AR dil desteği ile sayfaları seed eder
```

#### 2. Domain Bağlama (Vercel)
```
1. Vercel Dashboard → Domains
2. "Add Domain" → www.protransfer.com.tr
3. DNS kayıtlarını güncelleyin:
   - A Record: @ → 76.76.19.61
   - CNAME: www → cname.vercel-dns.com
4. SSL sertifikası otomatik oluşturulur
```

#### 3. Website Erişimi
```
- Custom domain: www.protransfer.com.tr → /website sayfasına yönlendirir
- Rezervasyon formu otomatik olarak tenant'a bağlanır
- source=website ile rezervasyonlar işaretlenir
```

### 🔧 Teknik Detaylar

#### Database Tabloları
- `TenantWebsiteSettings` - Logo, renk, iletişim bilgileri
- `WebsitePage` - Sayfa içerikleri (TR/EN/AR)
- `WebsiteSection` - Sayfa bölümleri
- `TenantModule` - WEBSITE modülü aktivasyonu

#### API Endpoints
- `POST /api/tenant-website/activate` - Website modülü aktivasyonu
- `GET /api/website` - Tenant website verileri
- `POST /api/website/reservation` - Website rezervasyon oluşturma
- `PUT /api/tenant-website` - Domain güncelleme

#### Middleware Logic
```typescript
// Custom domain kontrolü
const tenant = await prisma.tenant.findFirst({
  where: {
    OR: [
      { domain: hostname },
      { domain: `www.${hostname}` }
    ]
  }
});

// Website'e yönlendirme
if (tenantId && pathname === '/') {
  return NextResponse.redirect('/website');
}
```

### 🌐 Çoklu Dil Desteği

#### Desteklenen Diller
- 🇹🇷 Türkçe (TR) - Varsayılan
- 🇬🇧 İngilizce (EN)
- 🇸🇦 Arapça (AR)

#### Dil Değiştirme
- Header'da dil butonları
- Tüm içerik dinamik olarak güncellenir
- Meta bilgileri dil bazlı

### 📱 Responsive Tasarım

#### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

#### Özellikler
- Hero section gradient background
- Rezervasyon formu grid layout
- Footer sosyal medya linkleri
- WhatsApp entegrasyonu

### 🔒 Güvenlik

#### Yetkilendirme
- Sadece SUPERUSER website aktivasyonu yapabilir
- Tenant bazlı veri izolasyonu
- JWT token doğrulama

#### Domain Güvenliği
- Host header doğrulama
- Tenant ID context'e eklenir
- Rezervasyon source tracking

### 🚨 Rollback Planı

#### Acil Durum
```sql
-- Website modülünü devre dışı bırak
UPDATE "TenantModule" 
SET "isActive" = false 
WHERE "module" = 'WEBSITE';

-- Domain'i kaldır
UPDATE "Tenant" 
SET "domain" = NULL 
WHERE "domain" = 'www.protransfer.com.tr';
```

#### Middleware Rollback
```typescript
// middleware.ts'de custom domain kontrolünü devre dışı bırak
if (false && tenantId && pathname === '/') {
  return NextResponse.redirect('/website');
}
```

### 📊 Monitoring

#### Loglar
- Tenant lookup errors
- Website activation success/failure
- Reservation creation from website
- Domain resolution issues

#### Metrics
- Website activation count
- Domain binding success rate
- Website reservation conversion
- Language usage statistics

### 🔄 Güncelleme Süreci

#### Yeni Özellik Ekleme
1. Database migration
2. API endpoint güncelleme
3. Frontend component güncelleme
4. Test ve deploy

#### Bug Fix
1. Hotfix branch oluştur
2. Değişiklikleri test et
3. Production'a deploy
4. Monitoring

### 📞 Destek

#### Sorun Giderme
- Domain çözümleme sorunları → DNS kontrolü
- Website yüklenmiyor → Modül aktivasyonu kontrolü
- Rezervasyon oluşmuyor → API endpoint kontrolü
- Dil değişmiyor → Frontend state kontrolü

#### İletişim
- Teknik destek: [email]
- Acil durum: [phone]
- Dokümantasyon: Bu dosya

---

**Son Güncelleme:** 2024-12-19
**Versiyon:** 1.0.0
**Durum:** Production Ready ✅
