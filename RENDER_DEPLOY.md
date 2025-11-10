# 🚀 Render.com'a Backend Deploy - Step by Step

**Kripto Haber Mobil Backend'i Production'a taşı!**

---

## ✅ ADIM 1: GitHub'a Kod Yükle (Prerequisite)

### 1.1 GitHub Repo Oluştur
1. GitHub.com'a git → New Repository
2. Repo adı: `kripto-haber-backend`
3. **Public** seç
4. **Create repository** tıkla

### 1.2 Kodu Push Et
```bash
cd C:\Users\bora\kriptohabermobil\kriptohaber\backend
git init
git add .
git commit -m "Initial backend commit v1.0.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kripto-haber-backend.git
git push -u origin main
```

---

## ✅ ADIM 2: Render.com'a Git

### 2.1 Hesap Aç
1. https://render.com adresine git
2. **Sign Up** tıkla
3. GitHub ile bağlan (recommended)
4. Authorize Render
5. Email'i doğrula

### 2.2 GitHub Bağla
1. Dashboard → Settings
2. **GitHub Integration**
3. Yeni repo'yu authorize et

---

## ✅ ADIM 3: Backend Service Oluştur

### 3.1 Yeni Web Service
1. Dashboard → **New +** 
2. **Web Service** seç
3. **GitHub** seç

### 3.2 Repo Seç
1. Arama: `kripto-haber-backend`
2. Repo'yu seç
3. **Connect** tıkla

### 3.3 Ayarları Yap

| Ayar | Değer |
|------|-------|
| **Name** | kriptohaber-backend |
| **Environment** | Node |
| **Region** | Frankfurt (nearest) |
| **Branch** | main |
| **Build Command** | npm install |
| **Start Command** | npm start |
| **Plan** | Free |

### 3.4 Environment Variables Ekle
```
PORT=3001
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8332306740:AAEgCNn6OavmfgbeRvybmntV0tW1bdnknBY
```

**Değerleri kopyala:**
- PORT: 3001
- NODE_ENV: production
- TELEGRAM_BOT_TOKEN: Telegram bot token'ını gir

### 3.5 Deploy Et
1. **Create Web Service** tıkla
2. Deploy işlemi başlayacak (2-3 dakika)
3. ✅ Tamamlandı!

---

## 🎯 Deploy Sonrası

### Backend URL'sini Al
```
https://kriptohaber-backend.onrender.com
```

### Test Et
```bash
curl https://kriptohaber-backend.onrender.com/health
```

Sonuç:
```json
{
  "status": "ok",
  "message": "Kripto Haber Mobil Backend is running"
}
```

---

## 🔄 ADIM 4: Telegram Webhook'u Güncelle

### 4.1 Webhook URL'sini Değiştir
```bash
# Eski URL:
https://f9685de9efc0.ngrok-free.app/api/telegram-webhook

# Yeni URL:
https://kriptohaber-backend.onrender.com/api/telegram-webhook
```

### 4.2 PowerShell'de Komut Çalıştır
```powershell
$token = "8332306740:AAEgCNn6OavmfgbeRvybmntV0tW1bdnknBY"
$url = "https://kriptohaber-backend.onrender.com/api/telegram-webhook"

$body = @{
    url = $url
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.telegram.org/bot$token/setWebhook" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### 4.3 Webhook'u Test Et
```powershell
Invoke-WebRequest -Uri "https://api.telegram.org/bot$token/getWebhookInfo" `
  -Method POST
```

Sonuç görmek için:
```
url: https://kriptohaber-backend.onrender.com/api/telegram-webhook
pending_update_count: 0
```

✅ Tamam!

---

## 🌐 ADIM 5: Web App'i Güncelleyin

### 5.1 .env dosyasını Güncelle
```
REACT_APP_BACKEND_URL=https://kriptohaber-backend.onrender.com
```

### 5.2 Deploy Web App
```bash
cd C:\Users\bora\kriptohabermobil\kriptohaber
netlify deploy --prod
```

---

## ✅ KONTROL LİSTESİ

### ✔️ Bitmiş
- [ ] GitHub repo oluştur
- [ ] Kodu push et
- [ ] Render.com hesap aç
- [ ] Backend service oluştur
- [ ] Environment variables ekle
- [ ] Deploy et
- [ ] Health check yap
- [ ] Webhook güncelle
- [ ] Web app güncelle
- [ ] Son test

---

## 🔗 BAĞLANTILAR

### Production URLs
- **Backend:** https://kriptohaber-backend.onrender.com
- **Web:** https://kriptoanlikhaber.netlify.app
- **Bot:** @Kripto_Haber_Mobil_Bot

### Yönetim Panelleri
- **Render Dashboard:** https://dashboard.render.com
- **Netlify Dashboard:** https://app.netlify.com
- **GitHub:** https://github.com

---

## 🐛 Sorun Giderme

### Deploy başarısız?
1. Build logs'u kontrol et
2. Environment variables doğru mu?
3. GitHub'a push yaptın mı?
4. npm install çalışıyor mu?

### Webhook çalışmıyor?
1. Token doğru mu?
2. URL accessible mi?
3. Health check okay mi?
4. CORS doğru mu?

### Backend bağlanmıyor?
1. URL doğru mu?
2. Network bağlantısı var mı?
3. Render'da running mı?
4. Logs'u kontrol et

---

## 📞 DESTEK

Sorun varsa:
1. Render Dashboard'da logs'u kontrol et
2. GitHub Actions'da build logs'u gör
3. Backend server.js'i kontrol et
4. CORS ayarlarını kontrol et

---

**Başarı dilerim! 🚀**

Version: 1.0.0
Date: November 10, 2025

