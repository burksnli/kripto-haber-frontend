# 🚀 Quick Start Guide - Kripto Haber Mobil

## Hızlı Başlangıç (5 Dakika)

### 1️⃣ Web Uygulamasını Test Et
```bash
# Web'de canlı olarak çalışıyor:
https://kriptoanlikhaber.netlify.app
```

### 2️⃣ Backend'i Local'de Çalıştır
```bash
cd kriptohaber/backend
npm install
npm start
```
✅ Backend: http://localhost:3001

### 3️⃣ Telegram Bot'u Test Et
1. **Telegram'da** `@Kripto_Haber_Mobil_Bot` ara
2. **/start** yaz
3. **Test mesajı gönder:**
   ```
   Test Haberi
   Bu bir test mesajı
   ```
4. **Web sitesinde Haberler** sekmesine git ve gör 📰

---

## 🌐 Live Links

| Component | URL | Status |
|-----------|-----|--------|
| **Web App** | https://kriptoanlikhaber.netlify.app | ✅ LIVE |
| **Telegram Bot** | @Kripto_Haber_Mobil_Bot | ✅ ACTIVE |
| **Backend API** | http://localhost:3001 | 🔧 LOCAL |
| **Backend (Ngrok)** | https://f9685de9efc0.ngrok-free.app | 🔧 TUNNEL |

---

## 📱 Web Uygulaması Özellikleri

### Sayfalar
- 🏠 **Home** - Ana sayfa
- 📰 **News** - Telegram haberlerini gösterir ⭐
- 💹 **Prices** - Canlı kripto fiyatları
- 💼 **Portfolio** - Portföy yönetimi
- 🔔 **Alerts** - Fiyat uyarıları
- 🔄 **Converter** - Kripto dönüştürücü
- 📊 **Market Analysis** - Pazar analizi
- ⚙️ **Settings** - Ayarlar

---

## 🔧 Backend API Endpoints

### News Listesi
```bash
GET /api/news
```
Response:
```json
{
  "ok": true,
  "count": 2,
  "news": [
    {
      "id": "telegram_123...",
      "title": "Bitcoin Yükselişe Geçti",
      "body": "Bitcoin fiyatı 100.000 doları aştı",
      "timestamp": "2025-11-10T...",
      "source": "Telegram Bot"
    }
  ]
}
```

### Health Check
```bash
GET /health
```

### Telegram Webhook
```bash
POST /api/telegram-webhook
```

---

## 🤖 Telegram Bot Komutları

| Komut | Açıklama |
|-------|----------|
| **/start** | Bot'u başlat |
| **Herhangi bir mesaj** | Haber gönder |

**Format:**
```
Başlık
Açıklama
Detaylar
```

---

## 📁 Dosya Yapısı

```
kriptohaber/
├── app/                    # React Native/Expo web app
├── backend/                # Node.js + Express API
│   ├── server.js          # Ana sunucu
│   ├── routes/telegram.js # Telegram yönlendirmeleri
│   └── news.db            # SQLite veritabanı
├── dist/                  # Build çıktısı
└── docs/                  # Dokümantasyon
```

---

## 🚀 Production Deployment

### Backend'i Render.com'a Deploy Et (5 dakika)

1. **Render.com'a gir** → https://render.com
2. **Sign up** (GitHub ile)
3. **New +** → **Web Service**
4. **GitHub repo'nu bağla** (setup gerekli)
5. **Environment variables ekle:**
   ```
   PORT=3001
   NODE_ENV=production
   TELEGRAM_BOT_TOKEN=8332306740:AAEgCNn6OavmfgbeRvybmntV0tW1bdnknBY
   ```
6. **Deploy!** ✅

**Webhook'u güncelle:**
```bash
curl -X POST "https://api.telegram.org/bot8332306740:AAEgCNn6OavmfgbeRvybmntV0tW1bdnknBY/setWebhook" \
  -d "url=https://YOUR_RENDER_URL/api/telegram-webhook"
```

---

## 📱 Mobile Build (Optional)

### Android APK
```bash
cd kriptohaber
eas build --platform android
```

### iOS App
```bash
cd kriptohaber
eas build --platform ios
```

---

## 🔍 Troubleshooting

### Web sitesi açılmıyor
- Cache temizle: `Ctrl+Shift+Delete`
- Hard refresh: `Ctrl+F5`
- İncognito tab aç

### Backend API hatası
- Backend çalışıyor mı? `http://localhost:3001`
- Ngrok bağlantısı ok mi? `ngrok http 3001`
- Webhook registered mi? Check Telegram API

### Telegram bot mesaj almıyor
- Bot token doğru mu?
- Webhook URL kaydedildi mi?
- `/health` endpoint'i çalışıyor mu?

---

## 📚 Daha Fazla Bilgi

- **README.md** - Tam dokümantasyon
- **DEPLOYMENT_GUIDE.md** - Adım adım deployment
- **PROJECT_SUMMARY.md** - Proje özeti
- **FINAL_STATUS.txt** - Nihai durum raporu

---

## 🎯 Next Steps

1. ✅ Web uygulaması canlı
2. ✅ Backend local'de çalışıyor
3. ✅ Telegram bot aktif
4. ⏳ Backend production'a deploy et
5. ⏳ Android/iOS build'i yap

---

**Happy Coding! 🚀**

Sorunun olursa belirtilen dokümantasyon dosyalarına bak veya web sitesini ziyaret et:
https://kriptoanlikhaber.netlify.app

