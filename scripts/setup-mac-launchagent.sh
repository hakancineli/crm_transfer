#!/bin/bash

# Mac LaunchAgent Setup Script
# LaunchAgent cron'dan daha güvenilir ve macOS native

PROJECT_DIR="/Users/hakancineli/crm_transfer"
BACKUP_SCRIPT="$PROJECT_DIR/scripts/mac-daily-backup.sh"
LAUNCHAGENT_DIR="$HOME/Library/LaunchAgents"
PLIST_FILE="$LAUNCHAGENT_DIR/com.crm.daily-backup.plist"

echo "🔄 Mac LaunchAgent kurulumu başlıyor..."

# Script'in var olduğunu kontrol et
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "❌ Backup script bulunamadı: $BACKUP_SCRIPT"
    exit 1
fi

# LaunchAgents dizinini oluştur
mkdir -p "$LAUNCHAGENT_DIR"

# Log dizinini oluştur
mkdir -p "$PROJECT_DIR/logs"

echo "📄 LaunchAgent plist dosyası oluşturuluyor..."

# Plist dosyasını oluştur
cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.crm.daily-backup</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>$BACKUP_SCRIPT</string>
    </array>
    
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/launchagent-backup.log</string>
    
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/launchagent-backup-error.log</string>
    
    <key>RunAtLoad</key>
    <false/>
    
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
EOF

echo "✅ Plist dosyası oluşturuldu: $PLIST_FILE"

# Mevcut LaunchAgent'ı kaldır (varsa)
if launchctl list | grep -q "com.crm.daily-backup"; then
    echo "⚠️ Mevcut LaunchAgent kaldırılıyor..."
    launchctl unload "$PLIST_FILE" 2>/dev/null
fi

# LaunchAgent'ı yükle
echo "🚀 LaunchAgent yükleniyor..."
launchctl load "$PLIST_FILE"

if [ $? -eq 0 ]; then
    echo "✅ LaunchAgent başarıyla yüklendi!"
    echo ""
    echo "📋 LaunchAgent durumu:"
    launchctl list | grep "com.crm.daily-backup" || echo "   (Henüz çalışmadı)"
    echo ""
    echo "🔍 LaunchAgent'ı kontrol etmek için:"
    echo "   launchctl list | grep crm"
    echo ""
    echo "🗑️ LaunchAgent'ı kaldırmak için:"
    echo "   launchctl unload $PLIST_FILE"
    echo "   rm $PLIST_FILE"
    echo ""
    echo "📊 Log dosyaları:"
    echo "   tail -f $PROJECT_DIR/logs/launchagent-backup.log"
    echo "   tail -f $PROJECT_DIR/logs/launchagent-backup-error.log"
    echo ""
    echo "🧪 Test için:"
    echo "   $BACKUP_SCRIPT"
else
    echo "❌ LaunchAgent yüklenemedi"
    exit 1
fi
