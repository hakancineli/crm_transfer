## ProTransfer CRM — Quick Start

### 1) Kurulum
- Node 18+ yüklü olsun.
- Depoyu klonlayın ve bağımlılıkları kurun:
```
git clone https://github.com/hakancineli/crm_transfer.git
cd crm_transfer
npm install
```
- `.env.local` içeriğini doldurun (PostgreSQL, JWT secret vs.).

### 2) Geliştirme Sunucusu
```
npm run dev
```
- Açılış URL’si: `http://localhost:3000`
- Admin paneli: `http://localhost:3000/admin`

### 3) Giriş ve Roller
- `Admin Login` üzerinden giriş yapın.
- `SUPERUSER` rolü tüm modüllere erişir.
- Menü görünürlüğü rol/izinlere göre dinamik gelir.

### 4) Rezervasyon Akışı
- Yeni rezervasyon: `Admin > Yeni Rezervasyon`
- Liste: `Admin > Tüm Rezervasyonlar`
  - Arama (voucher, isim, tarih), filtreler (Bugün/Yarın/Hafta/Atanmış/Atanmamış)
  - Güzergah kısaltma: IST/SAW + ilçe
  - Satır tıklayınca detay, sağda hızlı aksiyonlar:
    - Şoför Ata, Dönüş Transferi, Müşteri Voucherı, (varsa) Şoför Voucherı, Düzenle

### 5) Şoför Atama
- Detaydan veya listeden “Şoför Ata”.
- Mevcut şoförden seç veya yeni şoför ekle.
- İzin: `ASSIGN_DRIVERS`.

### 6) Voucherlar
- Müşteri: `/admin/reservations/[voucher]/customer-voucher`
- Şoför: `/admin/reservations/[voucher]/driver-voucher`
- Şoför atanmamış olsa bile “Müşteri Voucherı” mevcuttur.

### 7) Muhasebe ve Raporlar
- Muhasebe: `Admin > Muhasebe` (şoför yoksa komisyon 0 kabul edilir)
- Raporlar: `Admin > Raporlar`
- Erişim: rol/izinlere bağlı; `SUPERUSER` her ikisini görür.

### 8) Kullanıcı & İzin Yönetimi
- Kullanıcılar: `Admin > Kullanıcılar` (yalnızca `SUPERUSER`)
- Kullanıcı izinleri: `Admin > Kullanıcılar > [Detay] > İzinler`
- Rol/izin hiyerarşisi korunur; kendini/daha üst rolü düzenleyemez.

### 9) Yardımcı Sayfalar
- Uçuş Durumu: `Admin > Uçuş Durumu`
- Denetim Logları, Personel Performansı (yalnızca yetkili rollerde)

### 10) Sık Karşılaşılanlar
- Boş ekran: Sunucu/port ve URL’yi kontrol edin, cache temizleyin.
- 404: Tüm rotalar `admin/...` altında; eski rotaları kullanmayın.
- Hook hataları: Liste istatistikleri parent’a taşınmıştır, mevcut sürüm stabildir.

### 11) Dağıtım
- Lokal: `npm run dev`
- Prod/Vercel: Ortam değişkenlerini Vercel projesine ekleyin, `admin/...` altında yönlendirmeleri koruyun.


