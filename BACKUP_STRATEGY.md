# 💾 VERİTABANI YEDEKLEME STRATEJİSİ

## 🎯 YEDEKLEME SEÇENEKLERİ

### 1. 🌐 NEON OTOMATİK YEDEKLEME (Önerilen)
**✅ Zaten Aktif:**
- Point-in-time recovery
- 7 günlük otomatik yedek
- Neon dashboard'dan erişim
- **Maliyet:** Ücretsiz (plan dahilinde)

**🔗 Erişim:**
- URL: https://console.neon.tech
- Project Settings > Backups

### 2. 🤖 GITHUB ACTIONS (Günlük Otomatik)
**✅ Kurulum:**
```bash
# GitHub Secrets ekle:
# - DATABASE_URL
# - GOOGLE_DRIVE_TOKEN (opsiyonel)
# - AWS_ACCESS_KEY_ID (opsiyonel)
```

**📅 Çalışma:** Her gün saat 02:00 (UTC)
**💾 Depolama:** GitHub Artifacts (30 gün)
**📦 Format:** SQL dump + gzip

### 3. 📱 LOCAL BACKUP SCRIPT
**✅ Kullanım:**
```bash
# Manuel yedekleme
npm run backup

# Local klasöre yedekleme
npm run backup:local
```

**📁 Depolama:** `./backups/` veya `./local-backups/`
**🧹 Temizlik:** 30 günden eski yedekler otomatik silinir

### 4. ☁️ CLOUD STORAGE ENTEGRASYONU

#### Google Drive
```bash
# Google Drive API token gerekli
# GitHub Actions ile otomatik upload
```

#### AWS S3
```bash
# AWS credentials gerekli
# S3 bucket'a otomatik upload
```

#### Dropbox
```bash
# Dropbox API token gerekli
# Manuel entegrasyon
```

## 🚀 KURULUM ADIMLARI

### GitHub Actions Aktifleştirme
1. GitHub repository'ye git
2. Settings > Secrets and variables > Actions
3. Yeni secret ekle: `DATABASE_URL`
4. Workflow otomatik çalışmaya başlar

### Local Backup Test
```bash
# Test yedekleme
npm run backup:local

# Yedek dosyasını kontrol et
ls -la local-backups/
```

### Neon Backup Kontrol
1. https://console.neon.tech adresine git
2. Projenizi seçin
3. Settings > Backups
4. Mevcut yedekleri görüntüleyin

## 📊 YEDEKLEME DOĞRULAMA

### Yedek Dosyası Test
```bash
# Yedek dosyasını kontrol et
gunzip -c backup_2024-09-19T05-30-00.sql.gz | head -20

# Yedek dosyasını restore et (test için)
createdb test_restore
gunzip -c backup_2024-09-19T05-30-00.sql.gz | psql test_restore
```

### Veri Bütünlüğü Kontrol
```bash
# Rezervasyon sayısını kontrol et
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"Reservation\";"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"TourBooking\";"
```

## ⚠️ ÖNEMLİ NOTLAR

1. **Neon otomatik yedekleme zaten aktif** - ekstra güvenlik için GitHub Actions
2. **Local backup sadece development için** - production verileri Neon'da
3. **GitHub Actions 30 günlük retention** - uzun süreli yedek için cloud storage
4. **Backup dosyaları büyük olabilir** - sıkıştırma kullanılıyor
5. **Test restore işlemi önemli** - yedeklerin çalıştığından emin olun

## 🎯 ÖNERİLEN STRATEJİ

**Günlük Kullanım:**
- ✅ Neon otomatik yedekleme (7 gün)
- ✅ GitHub Actions günlük yedekleme (30 gün)

**Uzun Süreli:**
- ☁️ Google Drive veya AWS S3 entegrasyonu
- 📱 Aylık manuel local backup

**Acil Durum:**
- 🔄 Neon point-in-time recovery
- 📦 GitHub Actions artifacts
- 💾 Local backup dosyaları
