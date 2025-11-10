# 🚀 Backend Server Kurulum Rehberi

Telegram bot'unuzdan haberleri almak için backend sunucusu gereklidir.

## Hızlı Başlangıç

### 1. Backend Dizinine Girin

```bash
cd backend
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

`.env` dosyası oluşturun:

```bash
# .env
NODE_ENV=development
PORT=3000
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-webhook-url.com/api/telegram-webhook
```

**Bot Token nasıl alınır:**
1. Telegram'da `@BotFather` arayın
2. `/start` yazın
3. `/newbot` yazın
4. Bot adını ve username'i girin
5. Token'i `.env` dosyasına yapıştırın

### 4. Sunucuyu Başlatın

**Geliştirme (Development):**
```bash
npm run dev
```

**Üretim (Production):**
```bash
npm start
```

Output'u göreceksiniz:
```
╔══════════════════════════════════════════════════════════════╗
║     Kripto Haber Mobil Backend Server                        ║
║                                                              ║
║  Server running on: http://localhost:3000                   ║
║  Health check: http://localhost:3000/health                ║
║  Telegram webhook: POST http://localhost:3000/api/telegram-webhook ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## Yerel Geliştirme (Ngrok ile)

Telegram webhook'unuzu lokal bilgisayarınızda test etmek için Ngrok kullanın:

### 1. Ngrok İndirin

[https://ngrok.com/download](https://ngrok.com/download)

### 2. Ngrok'u Çalıştırın

```bash
ngrok http 3000
```

Output örneği:
```
Forwarding    https://abc123def456.ngrok.io -> http://localhost:3000
```

### 3. Webhook URL'sini Kaydedin

`TELEGRAM_WEBHOOK_URL` olarak kullanın:
```
https://abc123def456.ngrok.io/api/telegram-webhook
```

### 4. Telegram Bot'a Webhook Kaydedin

```bash
curl -X POST "https://api.telegram.org/botYOUR_TOKEN/setWebhook" \
  -d "url=https://abc123def456.ngrok.io/api/telegram-webhook"
```

## API Endpoints

### 1. Health Check
```
GET /health

Response:
{
  "ok": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Telegram Webhook (POST)
```
POST /api/telegram-webhook

Request Body (from Telegram):
{
  "message": {
    "message_id": 123,
    "text": "Bitcoin Yeni Rekor\nBitcoin 100k'ı aştı",
    "date": 1673700000
  }
}

Response:
{
  "ok": true,
  "message": "News received and processed",
  "data": {
    "id": "telegram_123_1673700000000",
    "title": "Bitcoin Yeni Rekor",
    "body": "Bitcoin 100k'ı aştı",
    "timestamp": "2024-01-15T10:00:00.000Z",
    "source": "Telegram Bot"
  }
}
```

### 3. Webhook Durumu
```
GET /api/telegram-webhook-status

Response:
{
  "ok": true,
  "webhook_info": {
    "url": "https://your-domain.com/api/telegram-webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "ip_address": "1.2.3.4"
  }
}
```

## Docker ile Çalıştırma (Opsiyonel)

### Dockerfile Oluşturun

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Image Oluşturun

```bash
docker build -t kripto-haber-backend .
```

### Container Çalıştırın

```bash
docker run -p 3000:3000 \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e TELEGRAM_WEBHOOK_URL=https://your-domain/api/telegram-webhook \
  kripto-haber-backend
```

## Hata Giderme

### "Webhook alınmıyor"

1. **Token kontrol edin:**
   ```bash
   curl https://api.telegram.org/botYOUR_TOKEN/getMe
   ```

2. **Webhook URL'sini kontrol edin:**
   ```bash
   curl https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo
   ```

3. **Server çalışıyor mu?**
   ```bash
   curl http://localhost:3000/health
   ```

### "Port 3000 zaten kullanımda"

Farklı port kullanın:
```bash
PORT=3001 npm run dev
```

### "TELEGRAM_BOT_TOKEN tanımsız"

`.env` dosyasında ayarlandığını kontrol edin:
```bash
echo $TELEGRAM_BOT_TOKEN
```

## Güvenlik İpuçları

⚠️ **Bot Token'ini asla kodda hard-code etmeyin!**

1. `.env` dosyasını `.gitignore`'ye ekleyin
2. Environment variable kullanın
3. Token'i hiçbir yere commit etmeyin
4. Production'da AWS Secrets Manager veya Heroku Config Vars kullanın

## Sonraki Adımlar

1. **Firebase Cloud Messaging (FCM) ekleyin** - Push notification'lar için
2. **Veritabanı entegrasyonu** - Haberleri saklamak için
3. **Kullanıcı yönetimi** - Kullanıcı tercihlerini yönetmek için
4. **Analitik** - Haber performansını izlemek için

---

**Yardım mı gerekiyor?** Backend'i çalıştırırken sorun yaşıyorsanız, loglara bakın ve hata mesajını not edin.
