# Telegram Bot Kurulum Rehberi

Bu rehber, rezervasyon oluşturulduğunda otomatik Telegram bildirimi göndermek için gerekli adımları açıklar.

## 1. Telegram Bot Oluşturma

1. **BotFather ile Bot Oluştur**:
   - Telegram'da `@BotFather` ile sohbet başlat
   - `/newbot` komutunu gönder
   - Bot için bir isim ver (örn: "Transfer Rezervasyon Bot")
   - Bot için benzersiz bir kullanıcı adı ver (örn: "transfer_rezervasyon_bot")

2. **Bot Token'ını Al**:
   - BotFather size bir API token verecek
   - Bu token'ı güvenli bir yerde sakla
   - Örnek: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

## 2. Chat ID Alma

1. **Bot'u Gruba Ekle** (Opsiyonel):
   - Bot'u mesaj göndermek istediğin Telegram grubuna ekle
   - Bot'u yönetici yap ve mesaj gönderme yetkisi ver

2. **Chat ID'yi Al**:
   - Bot'a bir mesaj gönder (grup veya özel mesaj)
   - Tarayıcıda şu URL'yi aç:
     ```
     https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
     ```
   - `<BOT_TOKEN>` kısmını BotFather'dan aldığın token ile değiştir
   - JSON response'da `chat` nesnesi içindeki `id` değerini bul
   - Örnek: `-1001234567890` (grup için) veya `123456789` (özel mesaj için)

## 3. Environment Variables Ekleme

### Local Development (.env.local)
```bash
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

### Production (Vercel Dashboard)
1. Vercel dashboard'a git
2. Projeni seç
3. Settings > Environment Variables
4. Şu değişkenleri ekle:
   - `TELEGRAM_BOT_TOKEN`: Bot token'ı
   - `TELEGRAM_CHAT_ID`: Chat ID

## 4. Test Etme

1. **Local Test**:
   ```bash
   # Environment variable'ları set et
   export TELEGRAM_BOT_TOKEN="your_bot_token"
   export TELEGRAM_CHAT_ID="your_chat_id"
   
   # Rezervasyon oluştur
   curl -X POST http://localhost:3001/api/reservations \
     -H "Content-Type: application/json" \
     -d '{
       "date": "2025-01-09",
       "time": "14:00",
       "from": "Antalya Havalimanı",
       "to": "Antalya Merkez",
       "flightCode": "TK1234",
       "passengerNames": ["Test Müşteri"],
       "luggageCount": 2,
       "price": 100,
       "currency": "TRY",
       "phoneNumber": "+905551234567"
     }'
   ```

2. **Production Test**:
   - Müşteri rezervasyon formunu kullan
   - Rezervasyon oluştur
   - Telegram'da bildirimi kontrol et

## 5. Bildirim Formatı

Rezervasyon oluşturulduğunda şu formatta mesaj gönderilir:

```
Yeni Müşteri Talebi ✅
Voucher: VIP20250109-1
Tarih: 2025-01-09 14:00
Güzergah: Antalya Havalimanı → Antalya Merkez
Yolcular: Test Müşteri
Telefon: +905551234567
Uçuş: TK1234
```

## 6. Sorun Giderme

### Bot Mesaj Göndermiyor
1. Bot token'ını kontrol et
2. Chat ID'yi kontrol et
3. Bot'un gruba ekli olduğundan emin ol
4. Bot'un mesaj gönderme yetkisi olduğundan emin ol

### Hata Mesajları
- `400 Bad Request`: Bot token veya chat ID yanlış
- `403 Forbidden`: Bot'un mesaj gönderme yetkisi yok
- `404 Not Found`: Bot bulunamadı

### Log Kontrolü
Sunucu loglarında şu mesajları ara:
- `Telegram bildirim hatası (response):`
- `Telegram bildirim hatası (fetch):`

## 7. Güvenlik

- Bot token'ını asla public repository'de paylaşma
- Environment variable'ları güvenli tut
- Bot'u sadece güvendiğin gruplara ekle
- Gerektiğinde bot token'ını yenile

## 8. Gelişmiş Özellikler

### Özel Mesaj Formatı
`app/api/reservations/route.ts` dosyasında mesaj formatını özelleştirebilirsin:

```typescript
const textLines = [
    `🚗 Yeni Transfer Talebi`,
    `📋 Voucher: ${voucherNumber}`,
    `📅 Tarih: ${data.date} ${data.time}`,
    `🛣️ Güzergah: ${data.from} → ${data.to}`,
    `👥 Yolcular: ${passengerNames}`,
    `📞 Telefon: ${data.phoneNumber}`,
    data.flightCode ? `✈️ Uçuş: ${data.flightCode}` : undefined,
    data.specialRequests ? `📝 Not: ${data.specialRequests}` : undefined
].filter(Boolean).join('\n');
```

### Çoklu Chat ID
Birden fazla gruba mesaj göndermek için chat ID'leri virgülle ayırabilirsin:

```typescript
const chatIds = CHAT_ID.split(',').map(id => id.trim());
for (const chatId of chatIds) {
    // Her chat ID için mesaj gönder
}
```
