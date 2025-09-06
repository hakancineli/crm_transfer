# Booking.com API Entegrasyonu

## 🔑 API Anahtarı Alma

### 1. Booking.com Partner Hub'a Kaydolun
- [Booking.com Partner Hub](https://partner.booking.com/) adresine gidin
- "Become a Partner" butonuna tıklayın
- Şirket bilgilerinizi doldurun
- Onay sürecini bekleyin (1-3 iş günü)

### 2. API Anahtarı Alın
- Partner Hub'a giriş yapın
- "API Access" bölümüne gidin
- "Request API Key" butonuna tıklayın
- API anahtarınızı kopyalayın

### 3. Environment Variable'a Ekleyin
```bash
# .env.local dosyasına ekleyin
BOOKING_API_KEY="your_actual_api_key_here"
```

## 🔧 API Kullanımı

### Otel Arama
```typescript
const hotels = await BookingApiReal.searchHotels({
  city: 'Istanbul',
  checkin: '2025-09-06',
  checkout: '2025-09-07',
  adults: 2,
  children: 0,
  rooms: 1
});
```

### Oda Fiyatları
```typescript
const rooms = await BookingApiReal.getRoomPrices('hotel_id', searchParams);
```

## 📊 Mevcut Durum

- ✅ **Mock API hazır** - Test için gerçekçi veriler
- ✅ **API yapısı hazır** - Gerçek API'ye geçiş için
- ⚠️ **API anahtarı gerekli** - Gerçek veriler için
- ✅ **Fiyat hesaplama** - Acente indirimi ve kar marjı

## 🚀 Geçiş Adımları

1. **API anahtarını alın**
2. **Environment variable'ı güncelleyin**
3. **Mock API'yi gerçek API'ye çevirin**
4. **Test edin**

## 💡 Notlar

- Mock veriler gerçekçi fiyatlar içeriyor
- Acente indirimi %25 olarak ayarlandı
- Kar marjı ayarlanabilir
- Tüm otel bilgileri ve oda detayları mevcut
