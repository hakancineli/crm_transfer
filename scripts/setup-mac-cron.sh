#!/bin/bash

# Mac Cron Job Setup Script
# Bu script günlük otomatik yedekleme için cron job oluşturur

PROJECT_DIR="/Users/hakancineli/crm_transfer"
BACKUP_SCRIPT="$PROJECT_DIR/scripts/mac-daily-backup.sh"

echo "🔄 Mac Cron Job kurulumu başlıyor..."

# Script'in var olduğunu kontrol et
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "❌ Backup script bulunamadı: $BACKUP_SCRIPT"
    exit 1
fi

# Cron job'u oluştur (her gün saat 02:00'da)
CRON_JOB="0 2 * * * $BACKUP_SCRIPT >> $PROJECT_DIR/logs/cron-backup.log 2>&1"

echo "📅 Cron job oluşturuluyor..."
echo "⏰ Zaman: Her gün saat 02:00"
echo "📁 Script: $BACKUP_SCRIPT"

# Log dizinini oluştur
mkdir -p "$PROJECT_DIR/logs"

# Mevcut cron job'ları kontrol et
if crontab -l 2>/dev/null | grep -q "mac-daily-backup.sh"; then
    echo "⚠️ Cron job zaten mevcut, güncelleniyor..."
    # Mevcut job'u kaldır
    crontab -l 2>/dev/null | grep -v "mac-daily-backup.sh" | crontab -
fi

# Yeni cron job'u ekle
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

if [ $? -eq 0 ]; then
    echo "✅ Cron job başarıyla eklendi!"
    echo ""
    echo "📋 Aktif cron job'lar:"
    crontab -l | grep -A 1 -B 1 "mac-daily-backup"
    echo ""
    echo "🔍 Cron job'u kontrol etmek için:"
    echo "   crontab -l"
    echo ""
    echo "🗑️ Cron job'u kaldırmak için:"
    echo "   crontab -e"
    echo "   (mac-daily-backup.sh satırını sil)"
    echo ""
    echo "📊 Log dosyası:"
    echo "   tail -f $PROJECT_DIR/logs/cron-backup.log"
else
    echo "❌ Cron job eklenemedi"
    exit 1
fi
