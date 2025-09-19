#!/bin/bash

# Mac Daily Database Backup Script
# Bu script her gün çalışarak veritabanını Mac'e indirir

# Konfigürasyon
BACKUP_DIR="$HOME/Desktop/Database_Backups"
PROJECT_DIR="/Users/hakancineli/crm_transfer"
LOG_FILE="$BACKUP_DIR/backup.log"

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonu
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Backup dizinini oluştur
mkdir -p "$BACKUP_DIR"

log "🔄 Mac Daily Backup başlıyor..."

# Proje dizinine git
cd "$PROJECT_DIR" || {
    error "Proje dizini bulunamadı: $PROJECT_DIR"
    exit 1
}

# Environment dosyasını kontrol et
if [ ! -f ".env.local" ]; then
    error ".env.local dosyası bulunamadı"
    exit 1
fi

# DATABASE_URL'i al
DATABASE_URL=$(grep "DATABASE_URL=" .env.local | cut -d'=' -f2- | tr -d '"')

if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL bulunamadı"
    exit 1
fi

# PostgreSQL client kontrolü
if ! command -v pg_dump &> /dev/null; then
    error "pg_dump bulunamadı. PostgreSQL client yükleyin:"
    echo "brew install postgresql"
    exit 1
fi

# Backup dosya adı (tarih ile)
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

log "📊 Veritabanı yedekleniyor..."
log "📁 Hedef: $BACKUP_PATH"

# Veritabanını yedekle
if pg_dump "$DATABASE_URL" > "$BACKUP_PATH" 2>>"$LOG_FILE"; then
    success "✅ Veritabanı yedeklendi: $BACKUP_FILE"
else
    error "❌ Veritabanı yedekleme başarısız"
    exit 1
fi

# Dosya boyutunu kontrol et
FILE_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
log "📏 Dosya boyutu: $FILE_SIZE"

# Sıkıştır
log "🗜️ Dosya sıkıştırılıyor..."
if gzip "$BACKUP_PATH"; then
    success "✅ Dosya sıkıştırıldı: $BACKUP_FILE.gz"
    COMPRESSED_SIZE=$(du -h "$BACKUP_PATH.gz" | cut -f1)
    log "📏 Sıkıştırılmış boyut: $COMPRESSED_SIZE"
else
    error "❌ Dosya sıkıştırma başarısız"
fi

# Eski yedekleri temizle (30 günden eski)
log "🧹 Eski yedekler temizleniyor..."
DELETED_COUNT=0
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete -print | while read file; do
    if [ -n "$file" ]; then
        warning "🗑️ Silindi: $(basename "$file")"
        ((DELETED_COUNT++))
    fi
done

# Backup özeti
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "📊 Backup özeti:"
log "   📁 Toplam yedek: $TOTAL_BACKUPS"
log "   📏 Toplam boyut: $TOTAL_SIZE"
log "   📍 Konum: $BACKUP_DIR"

# Desktop'ta bildirim (macOS)
if command -v osascript &> /dev/null; then
    osascript -e "display notification \"Veritabanı yedeklendi: $BACKUP_FILE.gz\" with title \"CRM Backup\" subtitle \"$FILE_SIZE → $COMPRESSED_SIZE\""
fi

success "🎉 Mac Daily Backup tamamlandı!"

# Son 5 yedeği listele
log "📋 Son 5 yedek:"
ls -lt "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | head -5 | while read line; do
    log "   $line"
done
