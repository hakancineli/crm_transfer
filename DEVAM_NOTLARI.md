# crm_transfer ("Pro Acente" CRM) — Devam Notları

> Geliştirme **Antigravity IDE + Gemini** ile yapıldı (Claude değil), o yüzden Claude oturumu yok.
> En güncel kod **GitHub'da**. Yereldeki tüm kopyalar (Antigravity scratch dahil) geride/eski.
> Son güncelleme: 17 Haziran 2026

---

## 🟢 EN GÜNCEL HAL — GitHub'da (güvende)
- Repo: **https://github.com/hakancineli/crm_transfer** · dal `main`
- En son commit: **`0a324ce` — 4 Mayıs 2026**
- ⚠️ Yereldeki kopyalar GitHub'ın gerisinde — **devam ederken `git clone` ile GitHub'dan al.**

**Son geliştirmeler (2026, GitHub geçmişinden):**
- 🖥️ **Masaüstü CRM uygulaması**: shell + iniş sayfası indirme bölümü + **Windows installer** indirme butonu (CI'da build/publish ayarları)
- 🏷️ **"Pro Acente"** markalama: şeffaf logo / sembol assetleri, uygulama adı
- 🔧 Rezervasyon modalı ve sürücü atama akışı UI düzeltmeleri (koyu tema)
- 📱 WhatsApp servisi (`whatsapp-temiz`) Next type-check'ten hariç tutuldu; bloklayan WhatsApp bağlanma prompt'u kaldırıldı
- Önceki büyük işler: tur rezervasyonu + çok-yolculu CRM, TC/pasaport alanı, kişiye özel WhatsApp biniş kartları, ödeme hatırlatma, müşteri senkronu, dışa aktarma

---

## 🏗️ TEKNOLOJİ / YAPI
| Parça | Teknoloji |
|-------|-----------|
| Web app | **Next.js** (paket adı `crm`) — transfer/tur/rezervasyon CRM |
| Veritabanı | **PostgreSQL (Neon)** — Prisma (`provider = postgresql`, `env(DATABASE_URL)`) |
| Kimlik | **Stack Auth** (`NEXT_PUBLIC_STACK_PROJECT_ID`, `..._PUBLISHABLE_CLIENT_KEY`) |
| Harita | Google Maps (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) |
| WhatsApp | `whatsapp-temiz/` (ayrı servis) |
| Masaüstü | Yeni: desktop CRM shell, Windows installer (CI ile) |
| Deploy (web) | **Vercel** (env'ler Vercel+Neon kalıbında) |
| Geliştirme ortamı | **Antigravity IDE / Gemini** |

- Scripts: `dev: next dev` · `build: prisma generate && next build` · `start: next start`

---

## 🔄 SIFIRLAMADAN SONRA DEVAM
1. **GitHub'dan klonla (en güncel buradadır):**
   `git clone https://github.com/hakancineli/crm_transfer.git`
2. `cd crm_transfer && npm install`
3. USB yedeğinden `.env` / `.env.local` geri koy (GitHub'da YOK — Neon DB, Stack, Maps, API anahtarları)
4. `npx prisma generate` → `npm run dev`

> USB yedekleri: `_ARSIVLER/crm_transfer-ANTIGRAVITY.tgz` (Antigravity scratch kopyası, .git dahil) ve
> `_ARSIVLER/crm_transfer-noremote.tgz`. Ayrıca `.env` dosyaları ana rsync yedeğinde.
> NOT: USB'deki/yereldeki kopyalar GitHub'dan ESKİ olabilir — kaynak doğru olan GitHub'dır.

## ⚠️ GİZLİ / GitHub'da YOK — geri konması şart (.env değerleri)
`DATABASE_URL` + `POSTGRES_*` (Neon), `API_KEY`, `NEON_PROJECT_ID`,
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_STACK_PROJECT_ID`, `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
