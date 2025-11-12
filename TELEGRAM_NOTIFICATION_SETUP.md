# 📱 Telegram ve Push Notification Kurulum Rehberi

## ✅ Yapılan Düzeltmeler

### 1. **Telegram Entegrasyonu**
- ✅ Backend Telegram webhook'u çalışıyor
- ✅ Mobile app backend'den haberleri çekiyor
- ✅ 30 saniyede bir otomatik haber kontrolü yapılıyor
- ✅ Haberler AsyncStorage'a kaydediliyor (offline erişim için)

### 2. **Push Notification Sistemi**
- ✅ Platform kontrolü eklendi (sadece Android/iOS'ta çalışır)
- ✅ Yeni haberler geldiğinde otomatik bildirim gönderiliyor
- ✅ Her bildirim 500ms arayla gönderiliyor (spam önleme)

### 3. **Dinamik Backend URL**
- ✅ Backend URL artık ayarlardan değiştirilebilir
- ✅ Varsayılan: `https://kripto-haber-backend.onrender.com`

## 🚀 Kurulum Adımları

### 1. Backend'i Başlatma

```bash
cd kriptohaber/backend
npm install
npm start
```

Backend şu adreste çalışacak: `http://localhost:3000`

### 2. Telegram Bot Kurulumu

#### A. Bot Oluşturma
1. Telegram'da @BotFather'ı aç
2. `/newbot` komutunu gönder
3. Bot ismini belirle (örn: "Kripto Haber Bot")
4. Username belirle (örn: "kripto_haber_mobil_bot")
5. BotFather sana bir **token** verecek (örn: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### B. Bot Token'ı Backend'e Ekleme
Backend klasöründe `.env` dosyası oluştur:

```env
TELEGRAM_BOT_TOKEN=SENIN_BOT_TOKEN_IN
ADMIN_PASSWORD=kripto123
PORT=3000
```

#### C. Webhook Ayarlama

**Seçenek 1: Ngrok ile (Geliştirme)**
```bash
# Ngrok'u indir: https://ngrok.com/download
ngrok http 3000

# Çıkan URL'i al (örn: https://abc123.ngrok.io)
# Bu URL'i Telegram'a webhook olarak set et:
curl -X POST "https://api.telegram.org/bot<SENIN_BOT_TOKEN>/setWebhook?url=https://abc123.ngrok.io/api/telegram-webhook"
```

**Seçenek 2: Render.com ile (Production)**
1. Backend'i Render.com'a deploy et
2. Render URL'ini al (örn: `https://kripto-haber-backend.onrender.com`)
3. Webhook'u set et:
```bash
curl -X POST "https://api.telegram.org/bot<SENIN_BOT_TOKEN>/setWebhook?url=https://kripto-haber-backend.onrender.com/api/telegram-webhook"
```

### 3. Mobile App Kurulumu

#### A. Backend URL'sini Ayarlama
1. Uygulamayı aç
2. **Ayarlar** sekmesine git
3. **Backend URL** alanına backend URL'ini gir:
   - Local test için: `http://YOUR_IP:3000`
   - Production için: `https://kripto-haber-backend.onrender.com`
   - Ngrok ile: `https://abc123.ngrok.io`
4. **Kaydet** butonuna bas

#### B. Bildirim İzinlerini Açma
1. Uygulama ilk açılışta bildirim izni isteyecek
2. **İzin Ver** butonuna bas
3. Ayarlar > Bildirimler'den bildirimler aktif olduğunu kontrol et

### 4. Test Etme

#### A. Bot'a Mesaj Gönder
1. Telegram'da bot'unu aç
2. `/start` komutunu gönder
3. Bir haber gönder (örnek format):
```
Bitcoin Yeni Rekor Kırdı! 🚀
Bitcoin bu sabah 100.000 dolara ulaşarak tarihi bir rekor kırdı. Analistler bu yükselişin devam edebileceğini söylüyor.
```

#### B. Uygulamada Kontrol
1. 30 saniye bekle (otomatik güncelleme için)
2. VEYA Haberler sayfasında aşağı çekerek yenile
3. Yeni haberi göreceksin
4. Bildirim geldiğini kontrol et

## 🔍 Sorun Giderme

### Haberler Görünmüyor

**1. Backend Çalışıyor mu Kontrol Et:**
```bash
curl http://localhost:3000/health
# Veya
curl https://kripto-haber-backend.onrender.com/health
```

**2. Backend'de Haberler Var mı Kontrol Et:**
```bash
curl http://localhost:3000/api/news
```

**3. Uygulama Loglarını Kontrol Et:**
- Android Studio Logcat'i aç
- Şu mesajları ara:
  - `📡 Backend'den haberler çekiliyor`
  - `✅ Backend'den X haber alındı`
  - `⚠️ Backend'e bağlanılamadı`

**4. Backend URL'sini Kontrol Et:**
- Ayarlar > Backend URL
- Doğru URL girildiğinden emin ol
- Local test için IP adresini kontrol et (localhost ÇALIŞMAZ)

### Bildirimler Gelmiyor

**1. Platform Kontrolü:**
- Bildirimler sadece Android ve iOS'ta çalışır
- Web'de bildirim gelmez

**2. Bildirim İzinlerini Kontrol Et:**
- Telefon Ayarları > Uygulamalar > Kripto Haber > Bildirimler
- İzinlerin açık olduğundan emin ol

**3. Uygulama Açık mı:**
- Arka planda çalışıyorsa bildirimler gelir
- Tamamen kapatılmışsa gelmez (normal davranış)

**4. Console Loglarını Kontrol Et:**
```bash
adb logcat | grep -i "notification"
```

### Telegram Bot Yanıt Vermiyor

**1. Bot Token'ı Kontrol Et:**
```bash
curl https://api.telegram.org/bot<SENIN_TOKEN>/getMe
```
Başarılı yanıt:
```json
{"ok":true,"result":{"id":123,"is_bot":true,"first_name":"Kripto Haber Bot"}}
```

**2. Webhook Durumunu Kontrol Et:**
```bash
curl https://api.telegram.org/bot<SENIN_TOKEN>/getWebhookInfo
```

**3. Webhook'u Temizle ve Yeniden Kur:**
```bash
# Eski webhook'u sil
curl -X POST "https://api.telegram.org/bot<SENIN_TOKEN>/deleteWebhook"

# Yeni webhook kur
curl -X POST "https://api.telegram.org/bot<SENIN_TOKEN>/setWebhook?url=https://YOUR_BACKEND_URL/api/telegram-webhook"
```

## 📊 Sistem Mimarisi

```
┌─────────────────┐
│  Telegram Bot   │
│   (User sends)  │
│     message     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Telegram API   │
│   (Webhook)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend Server             │
│  /api/telegram-webhook      │
│  - Stores news in memory    │
│  - Exposes /api/news        │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Mobile App                  │
│  - Polls /api/news (30s)     │
│  - Shows notifications       │
│  - Saves to AsyncStorage     │
└──────────────────────────────┘
```

## 🔐 Güvenlik Notları

1. **Bot Token'ı Sakla:**
   - Token'ı asla GitHub'a pushlamayın
   - `.env` dosyasını `.gitignore`'a ekleyin

2. **Admin Şifresi:**
   - Production'da güçlü şifre kullanın
   - `.env` dosyasında saklayın

3. **CORS:**
   - Production'da CORS'u sınırlandırın
   - Şu anda `*` (herkese açık) olarak ayarlanmış

## 📱 APK Build

Değişikliklerden sonra yeni APK oluşturmak için:

```bash
cd kriptohaber
npx eas-cli build --platform android --profile production
```

Build tamamlandığında link gelecek, APK'yı indirebilirsiniz.

## 🎉 Özet

✅ Backend çalışıyor ve Telegram haberlerini alıyor
✅ Mobile app 30 saniyede bir backend'i kontrol ediyor
✅ Yeni haberler geldiğinde push notification gönderiyor
✅ Haberler offline erişim için AsyncStorage'a kaydediliyor
✅ Platform kontrolü var (web'de çalışmayan özellikler devre dışı)

**Her şey hazır! Telegram bot'una mesaj göndererek test edebilirsin! 🚀**

