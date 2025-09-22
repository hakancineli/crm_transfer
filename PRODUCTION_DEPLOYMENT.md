# Production Deployment Guide

## 🚀 Gerçek Domain Ayarları

### 1. Environment Variables (.env.production)

```bash
# Database (Production PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/crm_production"

# JWT Secret (Güçlü bir secret oluşturun)
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Production Domain
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Telegram Bot (isteğe bağlı)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-chat-id"

# Environment
NODE_ENV="production"
```

### 2. Domain Konfigürasyonu

`next.config.js` dosyasında `yourdomain.com` kısmını gerçek domain'inizle değiştirin:

```javascript
destination: 'https://yourdomain.com/:path*',
```

### 3. Production Build ve Deploy

```bash
# Production build
npm run build:prod

# Production start
npm run start:prod
```

### 4. SSL Sertifikası

- Let's Encrypt kullanarak ücretsiz SSL sertifikası alın
- Nginx reverse proxy konfigürasyonu yapın

### 5. Nginx Konfigürasyonu

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Database Setup (PostgreSQL)

```bash
# PostgreSQL kurulumu
sudo apt update
sudo apt install postgresql postgresql-contrib

# Database oluşturma
sudo -u postgres psql
CREATE DATABASE crm_production;
CREATE USER crm_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE crm_production TO crm_user;
\q

# Migration çalıştırma
npx prisma migrate deploy
```

### 7. PM2 ile Process Management

```bash
# PM2 kurulumu
npm install -g pm2

# PM2 ile başlatma
pm2 start npm --name "crm-app" -- run start:prod

# PM2 ayarları
pm2 startup
pm2 save
```

### 8. Güvenlik Ayarları

- Firewall konfigürasyonu
- Fail2ban kurulumu
- Regular backup setup
- Monitoring ve logging

### 9. Performance Optimizasyonu

- Redis cache (isteğe bağlı)
- CDN kullanımı
- Image optimization
- Database indexing

### 10. Monitoring

- Uptime monitoring
- Error tracking (Sentry)
- Performance monitoring
- Log aggregation

## 🔧 Development vs Production

| Özellik | Development | Production |
|---------|-------------|------------|
| Database | SQLite (dev.db) | PostgreSQL |
| Port | 3000 | 3000 (Nginx proxy) |
| SSL | ❌ | ✅ |
| CSP | Devre dışı | Aktif |
| Compression | ❌ | ✅ |
| Logging | Console | File/Service |
| Error Handling | Verbose | Secure |

## 📋 Deployment Checklist

- [ ] Domain DNS ayarları
- [ ] SSL sertifikası
- [ ] Environment variables
- [ ] Database migration
- [ ] Nginx konfigürasyonu
- [ ] PM2 setup
- [ ] Backup strategy
- [ ] Monitoring setup
- [ ] Security hardening
- [ ] Performance testing

## 🚨 Önemli Notlar

1. **JWT_SECRET**: Production'da mutlaka güçlü bir secret kullanın
2. **Database**: SQLite yerine PostgreSQL kullanın
3. **SSL**: HTTPS zorunlu
4. **Backup**: Düzenli backup alın
5. **Monitoring**: Uptime ve error monitoring kurun
6. **Security**: Firewall ve fail2ban kullanın

