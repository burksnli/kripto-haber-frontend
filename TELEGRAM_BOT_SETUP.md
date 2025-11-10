# 🤖 Telegram Bot Kurulum Rehberi

Bu rehberde Telegram botunuzu kuracağız ve uygulamaya entegre edeceğiz.

## Adım 1: Telegram BotFather ile Bot Oluşturma

1. **Telegram'ı açın** ve `@BotFather` arayın
2. `/start` komutunu gönderin
3. `/newbot` komutunu yazın
4. Bot adını girin (örn: "Kripto Haber Bot")
5. Bot kullanıcı adını girin (örn: "kripto_haber_bot")
6. **Bot Token'ini kaydedin** (böyle görünür: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

## Adım 2: Webhook Ayarla

Webhook, Telegram'dan uygulamanıza haber göndermek için kullanılır.

### 2A: Ngrok ile Yerel Test (Geliştirme)

Eğer lokal bilgisayarınızda test etmek istiyorsanız:

```bash
# Ngrok'u indirin: https://ngrok.com/download
# Kurulu değilse çalıştırın
ngrok http 3000
# Şöyle bir output alacaksınız:
# Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

### 2B: Sunucu Üzerinde Webhook (Üretim)

Canlı uygulamada bu endpoint'i kullanın:

```
https://yourdomain.com/api/telegram-webhook
```

## Adım 3: Bot Token ve Webhook URL'sini Kaydet

Aşağıdaki ortam değişkenlerini `.env` dosyasına ekleyin:

```bash
# .env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram-webhook
```

## Adım 4: Webhook Kaydı

Webhook'u Telegram'a kaydetmek için:

```bash
# Terminal'de çalıştırın (TOKEN ve URL'yi değiştirin)
curl -X POST "https://api.telegram.org/botYOUR_TOKEN/setWebhook" \
  -d "url=YOUR_WEBHOOK_URL"
```

**Başarılı yanıt:**
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## Adım 5: Backend Webhook Endpoint'i Oluştur

Express.js ile basit bir backend yapısı:

```javascript
// backend/routes/telegram.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/telegram-webhook', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.text) {
      return res.json({ ok: true });
    }

    // Mesajı işle
    const telegramMessage = {
      id: message.message_id,
      title: message.text.split('\n')[0] || 'Yeni Haber',
      body: message.text,
      timestamp: new Date().toISOString(),
      source: 'Telegram Bot',
    };

    // Mobil uygulamaya notification gönder
    // (Firebase Cloud Messaging vb kullanarak)
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
```

## Adım 6: Mobil Uygulamada Entegrasyon

`services/notificationService.ts` dosyası zaten hazır. Backend webhook'unuzdan haberleri alacaktır.

## Adım 7: Bot'a Haber Gönder

Telegram bot'unuza doğrudan mesaj göndererek test edin:

1. **Bot'u bul:** Oluşturduğunuz bot adını arayın (örn: @kripto_haber_bot)
2. **/start** yazın
3. **Haber metni yazın:** 
   ```
   Bitcoin Yeni Rekor Kırdı
   Bitcoin son günlerde tarihî seviyelere ulaştı. 
   Fiyat 100.000 doları aştı...
   ```
4. **Gönder** - İşte oldu! Uygulamada bildirim göreceksiniz.

## Webhook Webhook Test Kaynakları

- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [Webhook Setup Guide](https://core.telegram.org/bots/webhooks)
- [Ngrok Documentation](https://ngrok.com/docs)

## Hata Giderme

### Webhook alınmıyor?

1. **Token kontrol edin:** `/getMe` ile test edin
   ```bash
   curl https://api.telegram.org/botYOUR_TOKEN/getMe
   ```

2. **Webhook status kontrol edin:**
   ```bash
   curl https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo
   ```

3. **SSL sertifikası:** Telegram HTTPS gerektiriyor. Ngrok otomatik sağlar.

### Bot mesaj almıyor?

- Bot adını kontrol edin (`@` ile başlayıp başlamadığını)
- Webhook endpoint'i doğru mu?
- Backend server çalışıyor mu?

## Güvenlik İpuçları

⚠️ **Token'i asla herkese göstermeyin!**
- `.env` dosyası `.gitignore`'ye ekleyin
- Environment variable'ları kullanın
- Token'i kodda hard-code etmeyin

---

Kurulum bitti! 🎉 Artık Telegram bot'unuzdan haberleri almaya başlayabilirsiniz.
