# 💻 MAC'E GÜNLÜK OTOMATİK YEDEKLEME REHBERİ

## 🎯 ÖZET
Bu sistem her gün saat 02:00'da veritabanını Mac'inizin Desktop'ına otomatik olarak indirir.

## 🚀 KURULUM

### 1. PostgreSQL Client Yükle
```bash
# Homebrew ile PostgreSQL client yükle
brew install postgresql
```

### 2. LaunchAgent Kurulumu (Önerilen)
```bash
# LaunchAgent ile otomatik yedekleme
npm run backup:setup-launchagent
```

### 3. Cron Job Kurulumu (Alternatif)
```bash
# Cron job ile otomatik yedekleme
npm run backup:setup-cron
```

## 📱 KULLANIM

### Manuel Yedekleme
```bash
# Hemen yedekle
npm run backup:mac
```

### Otomatik Yedekleme
- **Zaman:** Her gün saat 02:00
- **Konum:** `~/Desktop/Database_Backups/`
- **Format:** `backup_YYYYMMDD_HHMMSS.sql.gz`

## 📁 YEDEK DOSYALARI

### Konum
```
~/Desktop/Database_Backups/
├── backup_20240919_020000.sql.gz
├── backup_20240920_020000.sql.gz
├── backup_20240921_020000.sql.gz
└── backup.log
```

### Dosya Formatı
- **İsim:** `backup_YYYYMMDD_HHMMSS.sql.gz`
- **Boyut:** ~1-5 MB (sıkıştırılmış)
- **İçerik:** PostgreSQL SQL dump

## 🔧 YÖNETİM

### LaunchAgent Kontrol
```bash
# Durumu kontrol et
launchctl list | grep crm

# Log'ları görüntüle
tail -f logs/launchagent-backup.log
tail -f logs/launchagent-backup-error.log
```

### Cron Job Kontrol
```bash
# Aktif cron job'ları listele
crontab -l

# Log'ları görüntüle
tail -f logs/cron-backup.log
```

### Yedekleri Listele
```bash
# Desktop'taki yedekleri listele
ls -la ~/Desktop/Database_Backups/

# Boyutları ile birlikte
du -sh ~/Desktop/Database_Backups/*
```

## 🧹 TEMİZLİK

### Otomatik Temizlik
- **30 günden eski yedekler otomatik silinir**
- **Log dosyaları korunur**

### Manuel Temizlik
```bash
# Eski yedekleri sil
find ~/Desktop/Database_Backups/ -name "backup_*.sql.gz" -mtime +30 -delete

# Tüm yedekleri sil
rm -rf ~/Desktop/Database_Backups/backup_*.sql.gz
```

## 🔄 KALDIRMA

### LaunchAgent Kaldırma
```bash
# LaunchAgent'ı durdur
launchctl unload ~/Library/LaunchAgents/com.crm.daily-backup.plist

# Dosyayı sil
rm ~/Library/LaunchAgents/com.crm.daily-backup.plist
```

### Cron Job Kaldırma
```bash
# Cron job'u düzenle
crontab -e

# mac-daily-backup.sh satırını sil ve kaydet
```

## 🧪 TEST

### Manuel Test
```bash
# Script'i test et
npm run backup:mac

# Desktop'ta yedek dosyasını kontrol et
ls -la ~/Desktop/Database_Backups/
```

### Otomatik Test
```bash
# LaunchAgent'ı test et (1 dakika sonra çalıştır)
launchctl start com.crm.daily-backup
```

## 📊 MONİTÖRİNG

### Bildirimler
- **macOS bildirimi** yedekleme tamamlandığında gösterilir
- **Desktop'ta yedek dosyası** oluşturulur

### Log Dosyaları
- **Ana log:** `~/Desktop/Database_Backups/backup.log`
- **LaunchAgent log:** `logs/launchagent-backup.log`
- **Cron log:** `logs/cron-backup.log`

## ⚠️ ÖNEMLİ NOTLAR

1. **PostgreSQL client gerekli** - `brew install postgresql`
2. **İnternet bağlantısı gerekli** - Neon PostgreSQL'e erişim
3. **Desktop klasörü yazma izni gerekli**
4. **Mac uyku modunda olsa bile çalışır** (LaunchAgent)
5. **Yedek dosyaları sıkıştırılmış** - disk alanı tasarrufu

## 🎯 AVANTAJLAR

- ✅ **Otomatik** - Her gün saat 02:00'da
- ✅ **Güvenilir** - LaunchAgent macOS native
- ✅ **Bildirimli** - macOS notification
- ✅ **Temizlik** - 30 günlük otomatik temizlik
- ✅ **Sıkıştırılmış** - Disk alanı tasarrufu
- ✅ **Log'lu** - Detaylı log dosyaları

## 🚨 SORUN GİDERME

### PostgreSQL Client Bulunamadı
```bash
brew install postgresql
```

### İzin Hatası
```bash
chmod +x scripts/mac-daily-backup.sh
```

### LaunchAgent Çalışmıyor
```bash
# Yeniden yükle
launchctl unload ~/Library/LaunchAgents/com.crm.daily-backup.plist
launchctl load ~/Library/LaunchAgents/com.crm.daily-backup.plist
```

### Cron Job Çalışmıyor
```bash
# Cron servisini kontrol et
sudo launchctl list | grep cron
```
