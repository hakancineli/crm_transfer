## ProTransfer CRM — Quick Start

### 1) Kurulum
- Node 18+ yüklü olsun.
- Depoyu klonlayın ve bağımlılıkları kurun:
```
git clone https://github.com/hakancineli/crm_transfer.git
cd crm_transfer
npm install
```
- `.env.local` içeriğini doldurun (PostgreSQL, JWT secret vs.). Örnek:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
JWT_SECRET=change_this
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2) Geliştirme Sunucusu
```
npm run dev
```
- Açılış URL’si: `http://localhost:3000`
- Admin paneli: `http://localhost:3000/admin`
- Port kullanımda ise Next.js otomatik farklı bir porta (örn. 3001) geçebilir. Konsoldaki URL’yi takip edin.

### 3) Giriş ve Roller
- `Admin Login` üzerinden giriş yapın.
- `SUPERUSER` rolü tüm modüllere erişir.
- Menü görünürlüğü rol/izinlere göre dinamik gelir.

Giriş sayfası: `http://localhost:3000/admin-login`

### 4) Rezervasyon Akışı
- Yeni rezervasyon: `Admin > Yeni Rezervasyon`
- Liste: `Admin > Tüm Rezervasyonlar`
  - Arama (voucher, isim, tarih), filtreler (Bugün/Yarın/Hafta/Atanmış/Atanmamış)
  - Güzergah kısaltma: IST/SAW + ilçe
  - Satır tıklayınca detay, sağda hızlı aksiyonlar:
    - Şoför Ata, Dönüş Transferi, Müşteri Voucherı, (varsa) Şoför Voucherı, Düzenle
- Üstte sticky özet: Filtre sonucuna göre Karşılama/Çıkış/Ara Transfer sayıları.

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
- Beyaz ekran yalnızca admin’deyse: `Header` kimlik verisini gösterir; giriş yapın ve tekrar deneyin.

### 11) Dağıtım
- Lokal: `npm run dev`
- Prod/Vercel: Ortam değişkenlerini Vercel projesine ekleyin, `admin/...` altında yönlendirmeleri koruyun.

### 12) Quick Start’ı PDF’e Dönüştürme
- macOS Preview: Dosyayı açın > File > Export as PDF
- VS Code “Markdown PDF” eklentisi: Sağ tık > Export (pdf)
- Pandoc:
```
brew install pandoc wkhtmltopdf
pandoc docs/QuickStart.md -o docs/QuickStart.pdf
```

### 13) Sürüm/Commit Kontrolü
```
git log --oneline -n 5
```
GitHub’da “Commits” sekmesinde kısa ID’lere göre arayabilirsiniz.


