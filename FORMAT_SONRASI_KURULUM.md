# 🚀 FORMAT SONRASI KURULUM REHBERİ

## 📋 GEREKSİNİMLER
- **Node.js:** v18.20.8
- **NPM:** 10.8.2
- **Git:** 2.39.5+

## 🔧 KURULUM ADIMLARI

### 1. Projeyi İndir
```bash
git clone https://github.com/hakancineli/crm_transfer.git
cd crm_transfer
```

### 2. Dependencies Yükle
```bash
npm install
```

### 3. Environment Variables Ayarla
`.env.local` dosyası oluştur:
```env
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgres://neondb_owner:npg_ELFHaAGVn9b6@ep-fragrant-mountain-a262sya8-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_ELFHaAGVn9b6@ep-fragrant-mountain-a262sya8.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### 4. Database Migrate
```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Sunucuyu Başlat
```bash
npm run dev
```

## 🌐 VERCEL DEPLOYMENT
- **Repository:** https://github.com/hakancineli/crm_transfer
- **Domain:** crm-transfer-git-main-hakancinelis-projects.vercel.app
- **Environment Variables:** Vercel dashboard'da ayarla

## 📊 MEVCUT DURUM
- ✅ **17 rezervasyon** aktif
- ✅ **API çalışıyor**
- ✅ **Canlı site çalışıyor**
- ✅ **Tour modülü aktif**
- ✅ **Driver assignment çalışıyor**

## 🛡️ YEDEK BİLGİLERİ
- **Masaüstü Yedek:** CRM_Transfer_Backup_20250919_054350 (686MB)
- **GitHub:** Güncel ve temiz
- **Database:** PostgreSQL (Neon)
- **Son Commit:** 9da2963 - Clean up project

## ⚠️ ÖNEMLİ NOTLAR
1. JWT_SECRET'i güvenli tut
2. Database URL'leri doğru ayarla
3. Vercel environment variables'ı güncelle
4. Local database gerekmez (PostgreSQL kullanılıyor)

## 🎯 TEST ADIMLARI
1. `npm run dev` ile sunucu başlat
2. `localhost:3000` aç
3. Admin login test et
4. Rezervasyon listesi kontrol et
5. Tour modülü test et
