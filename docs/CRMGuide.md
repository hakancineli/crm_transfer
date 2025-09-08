## ProTransfer CRM — Kullanım Kılavuzu (Admin/Personel)

### 1) Giriş ve Yetkilendirme
- Giriş: `http://localhost:3000/admin-login`
- Admin Panel: `http://localhost:3000/admin`
- Roller: `SUPERUSER`, `MANAGER`, `OPERATION`, `SELLER`, `ACCOUNTANT`, `CUSTOMER_SERVICE`, `FINANCE`
- Önemli İzinler (örnek):
  - Rezervasyon: `CREATE_RESERVATIONS`, `EDIT_RESERVATIONS`, `DELETE_RESERVATIONS`, `VIEW_ALL_RESERVATIONS`, `VIEW_OWN_SALES`
  - Şoför: `ASSIGN_DRIVERS`, `MANAGE_DRIVERS`
  - Rapor/Muhasebe: `VIEW_REPORTS`, `VIEW_ACCOUNTING`
  - Sistem: `MANAGE_USERS`, `MANAGE_PERMISSIONS`, `VIEW_PERFORMANCE` (yalnızca `SUPERUSER`)

### 2) Navigasyon ve Modüller
- Tüm Rezervasyonlar: Listeleme, arama, filtre, hızlı aksiyonlar
- Yeni Rezervasyon: Operasyon veya satış ekibi için hızlı kayıt
- Şoförler: Şoför bilgileri (liste/ekle/düzenle)
- Raporlar: Operasyonel ve satış raporları (erişim rol bazlı)
- Muhasebe: Gelir, komisyon, ödeme durumları
- Müşteri Yönetimi: Müşteri listesi ve müşteri detay sayfası
- Uçuş Durumu: Uçuş kodlarına göre planlanan/gerçekleşen bilgiler
- Ayarlar: Sistem ayarları, modül görünürlükleri
- Kullanıcılar / İzinler: Yetki ve hiyerarşi yönetimi (genelde `SUPERUSER`)
- Denetim Logları / Personel Performansı: İlgili rollerde görünür

### 3) Rezervasyon Yönetimi
- Liste: `Admin > Tüm Rezervasyonlar`
  - Arama: voucher, isim, tarih (`YYYY-MM-DD`)
  - Filtreler: Bugün, Yarın, Bu Hafta, Şoför Atanmış, Şoför Bekleniyor
  - Sticky Özet: Filtreye göre Karşılama/Çıkış/Ara Transfer sayıları
  - Güzergah Gösterimi: Havalimanı (IST/SAW) + diğer adres ilçesi
  - Ödeme Durumu: Satırdan PAID/PENDING/UNPAID hızlı güncelleme
  - Aksiyonlar:
    - Şoför Ata (izin: `ASSIGN_DRIVERS`)
    - Dönüş Transferi Ekle
    - Müşteri Voucherı (her zaman)
    - Şoför Voucherı (şoför atandıysa)
    - Düzenle (izin: `EDIT_RESERVATIONS`)
    - Sil (izin: `DELETE_RESERVATIONS`)
- Detay: `Admin > Rezervasyon Detayı`
  - Yolcu/İletişim, Uçuş, Güzergah, Fiyat, Ödeme, Şoför
  - Dönüş transferi ekleme, voucher linkleri

### 4) Yeni Rezervasyon
- Form: kalkış/varış, tarih-saat, uçuş kodu (varsa), yolcu isimleri, telefon, fiyat/para birimi
- Kayıt sonrası yönlendirme: Rezervasyon detay sayfası
- Performans: Gereksiz sunucu restart kaldırıldı, hızlı kayıt

### 5) Şoför Atama
- Nereden: Liste aksiyonları veya Detay sayfası
- Nasıl: Var olan şoförden seç veya yeni şoför oluştur
- Yönlendirme: İşlem sonrası ilgili admin rotalarına
- Not: Şoför atanmamış rezervasyonda bile Müşteri Voucherı görünür

### 6) Voucherlar
- Şoför Voucherı: `.../[voucherNumber]/driver-voucher`
- Müşteri Voucherı: `.../[voucherNumber]/customer-voucher`
- Tamamı client-side veri çekimi; SSR/CSR uyumsuzluğu ve 404 sorunları çözüldü

### 7) Muhasebe
- Erişim: `VIEW_ACCOUNTING` veya `SUPERUSER`
- Komisyonlar: Şoför atanmamışsa komisyon=0
- Durum bazlı toplamlara erişim

### 8) Raporlar
- Erişim: `VIEW_REPORTS` veya `SUPERUSER`
- Operasyon, satış ve performans özetleri (genel rapor ekranı)

### 9) Müşteri Yönetimi
- Liste ve Detay: Müşteri toplam rezervasyon, toplam harcama, son rezervasyon, geçmiş

### 10) Kullanıcı & İzinler
- Kullanıcılar: Yalnızca `SUPERUSER`
- Kullanıcı İzinleri: Kendini veya daha üst rolü düzenleyemez; hiyerarşi korunur
- İzinler (Rol Bazlı): Açıklamalı izin metinleri ile düzenleme

### 11) Uçuş Durumu
- Liste ve mobilde uçuş kartı; kod, planlanan/gerçekleşen bilgi
- Karşılama/Çıkış türüne göre ikon ve renkler

### 12) Sorun Giderme
- Boş ekran: URL/port doğru mu, cache temizleyin, farklı tarayıcı deneyin
- 404: Tüm iç sayfalar `admin/...` altında; eski rota kullanmayın
- Konsol hataları (eklenti kaynaklı): Console temizleme/CSP ile bastırılmıştır
- Hook hatası: Liste istatistikleri parent’a taşındı; mevcut sürüm stabil

### 13) Dağıtım ve Ortam
- Lokal: `npm run dev`
- Prod (Vercel): `.env` değişkenlerini ekleyin; admin rotalarını koruyun
- Örnek `.env.local`:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
JWT_SECRET=change_this
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 14) En İyi Uygulamalar
- Yolcu adlarını temiz girin; uçuş kodu mevcutsa ekleyin
- Ödeme durumlarını satırdan güncelleyin; operasyon hızlanır
- Şoför atamasını geciktirmeyin; voucher dağıtımı kolaylaşır

### 15) Destek
- İç destek kanalı veya teknik ekip: support@protransfer.com.tr
- Kritik hatalarda konsol çıktısı ve adımları paylaşın
