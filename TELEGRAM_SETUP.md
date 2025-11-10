# 📱 Telegram Bot Entegrasyonu Rehberi

Bu rehber, Telegram botunuzu kurup uygulamaya haber göndermeyi adım adım anlatır.

## 1️⃣ Telegram Bot Oluşturma

### Adım 1: BotFather'a Mesaj Gönderin
1. Telegram'ı açın
2. **@BotFather** arayın
3. `/start` komutunu yazın ve gönder

### Adım 2: Yeni Bot Oluşturun
- `/newbot` komutunu yazın
- Bot adını soracaktır (örn: "Kripto Haber Bot")
- Bot kullanıcı adını soracaktır (örn: "kriptohaber_test_bot")
- **Bot Token** alacaksınız - **SAKIN PAYLAŞMAYIN!**

**Token Örneği:**
```
123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

## 2️⃣ Backend Webhook Kurulumu

Telegram haberleri uygulamaya göndermeniz için bir backend sunucusu gereklidir.

### Node.js + Express Örneği

```javascript
const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.json());

// Telegram webhook endpoint
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.text) {
      return res.json({ success: false });
    }

    // Örneğin: "/haber Bitcoin BTC yeni rekor kırdı"
    const text = message.text;
    
    if (text.startsWith('/haber ')) {
      const parts = text.substring(7).split(' ');
      const coinName = parts[0];
      const coinSymbol = parts[1];
      const newsBody = parts.slice(2).join(' ');

      // Tüm abone kullanıcılara bildirim gönder
      // (Firebase Cloud Messaging veya benzeri kullanılabilir)
      
      console.log(`Yeni Haber: ${coinName} - ${newsBody}`);
      
      return res.json({ success: true });
    }

    res.json({ success: false });
  } catch (error) {
    console.error('Webhook hatası:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Telegram'a webhook URL'ini ayarla
app.post('/api/setup-telegram-webhook', async (req, res) => {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const WEBHOOK_URL = process.env.WEBHOOK_URL;
    
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      { url: WEBHOOK_URL + '/api/telegram-webhook' }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server 3000 portunda çalışıyor');
});
```

### Environment Variables

`.env` dosyasını oluşturun:
```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
WEBHOOK_URL=https://yourserver.com
```

## 3️⃣ Webhook URL'ini Telegram'a Kaydetme

Backend sunucunuz çalışıyorken şu komutla webhook'u ayarlayın:

```bash
curl -X POST https://api.telegram.org/bot<BOT_TOKEN>/setWebhook \
  -d url=https://yourserver.com/api/telegram-webhook
```

Veya:
```bash
curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
```

## 4️⃣ Uygulamaya Bildirim Gönderme

### Push Notification Servisi Entegrasyonu (Firebase Cloud Messaging)

```javascript
const admin = require('firebase-admin');

// Firebase admin SDK'sını başlat
admin.initializeApp();

app.post('/api/send-notification', async (req, res) => {
  try {
    const { title, body, userId } = req.body;

    // Kullanıcının FCM token'ını veritabanından al
    const userToken = await getUserFCMToken(userId);

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
      token: userToken,
    };

    const response = await admin.messaging().send(message);
    res.json({ success: true, messageId: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 5️⃣ Uygulamada FCM Kurulumu

### app.json'da Konfigürasyon

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#2196F3"
        }
      ]
    ]
  }
}
```

### _layout.tsx'de FCM Handler

```typescript
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  useEffect(() => {
    // Notification dinleyicisi
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Bildirime tıklandı:', response);
      // Haberlere git
      // navigation.navigate('news');
    });

    return () => subscription.remove();
  }, []);

  // ... rest of layout
}
```

## 6️⃣ Test Etme

### Telegram'da Test Mesajı Gönder

1. Botunuzu bulun (@kriptohaber_test_bot)
2. `/haber Bitcoin BTC Yeni ATH kırdı!` yazıp gönder
3. Backend webhook'u çalışmaya başladı mı kontrol et
4. Uygulamada bildirimi görmelisin

### Curl ile Test

```bash
curl -X POST http://localhost:3000/api/telegram-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "text": "/haber Bitcoin BTC Yeni ATH kırdı!"
    }
  }'
```

## 7️⃣ Sorun Giderme

### Webhook çalışmıyor
- Bot token'ı doğru mu?
- Webhook URL'i geçerli mi?
- HTTPS protokolü kullanıyor musunuz? (Telegram'ın zorunluluğu)

### Bildirimler gelmiyor
- FCM token alındı mı?
- Uygulamanın bildirim izni var mı?
- Ayarlar'da bildirimler açık mı?

### Test Komutu
```bash
curl https://api.telegram.org/bot<BOT_TOKEN>/getMe
```

Başarılı yanıt:
```json
{
  "ok": true,
  "result": {
    "id": 123456,
    "is_bot": true,
    "first_name": "Kripto Haber Bot"
  }
}
```

## 📚 Faydalı Linkler

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Webhooks](https://core.telegram.org/bots/webhooks)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

---

**Önemli:** Hiçbir zaman bot token'ınızı paylaşmayın! 🔐
