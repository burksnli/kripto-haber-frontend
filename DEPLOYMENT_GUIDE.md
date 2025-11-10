# 🚀 Deployment Guide - Kripto Haber Mobil

Complete guide to deploy Kripto Haber Mobil to production.

---

## 📋 Phase 1: Web Application (✅ DONE)

### Deployed on: **Netlify**
- **URL:** https://kriptoanlikhaber.netlify.app
- **Status:** ✅ Live & Production

### To redeploy:
```bash
cd kriptohaber
netlify deploy --prod
```

---

## 🔧 Phase 2: Backend Server (In Progress)

### Current Setup:
- **Local:** http://localhost:3001
- **Ngrok Tunnel:** https://f9685de9efc0.ngrok-free.app (Temporary)
- **Database:** SQLite (news.db)

### To Deploy on Render.com (Recommended):

#### Step 1: Push to GitHub
```bash
cd C:\Users\bora\kriptohabermobil
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/kriptohaber.git
git push -u origin main
```

#### Step 2: Connect to Render
1. Go to **render.com**
2. Sign up with GitHub
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Select **kriptohaber** repo

#### Step 3: Configure Service
- **Name:** kriptohaber-backend
- **Runtime:** Node
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`
- **Plan:** Free

#### Step 4: Set Environment Variables
In Render Dashboard → Environment:
```
PORT=3001
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8332306740:AAEgCNn6OavmfgbeRvybmntV0tW1bdnknBY
```

#### Step 5: Update Telegram Webhook
Once deployed, get your Render URL (e.g., `https://kriptohaber-backend.onrender.com`)

Then run:
```bash
curl -X POST "https://api.telegram.org/bot8332306740:AAEgCNn6OavmfgbeRvybmntV0tW1bdnknBY/setWebhook" \
  -d "url=https://kriptohaber-backend.onrender.com/api/telegram-webhook"
```

#### Step 6: Update Web App
Edit `app/(tabs)/news.tsx` line 74:
```typescript
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://kriptohaber-backend.onrender.com';
```

Then redeploy web:
```bash
cd kriptohaber
netlify deploy --prod
```

---

## 📱 Phase 3: Android App (Optional)

### Prerequisites:
- Expo account
- Google Play Developer account ($25 one-time)

### Build:
```bash
cd kriptohaber
eas build --platform android
eas submit --platform android
```

---

## 🍎 Phase 4: iOS App (Optional)

### Prerequisites:
- Apple Developer account ($99/year)
- Mac or VM

### Build:
```bash
cd kriptohaber
eas build --platform ios
eas submit --platform ios
```

---

## ✅ Deployment Checklist

### Web App (Netlify)
- [x] Domain: kriptoanlikhaber.netlify.app
- [x] HTTPS enabled
- [x] Auto-deploys on git push
- [x] Environment production

### Backend (Render - TODO)
- [ ] GitHub repository created
- [ ] Render.com connected
- [ ] Environment variables set
- [ ] Telegram webhook registered
- [ ] Database persistent
- [ ] Health check: `/health` endpoint

### Telegram Bot
- [x] Bot Token: 8332306740:AAEgCNn6OavmfgbeRvybmntV0tW1bdnknBY
- [x] Webhook registered
- [ ] Production URL configured
- [ ] Error logging enabled

### Security
- [ ] Environment variables not in git
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented

---

## 🔗 Production URLs

### Web Application
```
https://kriptoanlikhaber.netlify.app
```

### Backend API (After Render deployment)
```
https://kriptohaber-backend.onrender.com
```

### Telegram Bot
```
@Kripto_Haber_Mobil_Bot
```

---

## 📊 Monitoring

### Netlify
- Deployment logs: https://app.netlify.com/projects/kriptoanlikhaber
- Analytics: Built-in

### Render
- Service logs: Dashboard → Logs tab
- Resource usage: Dashboard → Resources tab

### Telegram
- Bot stats: Talk to @BotFather
- Webhook status: Test via /health endpoint

---

## 🚨 Troubleshooting

### Backend returns 404
**Solution:** Update backend URL in `app/(tabs)/news.tsx`

### Webhook not receiving messages
**Solution:** Check webhook URL with:
```bash
curl "https://api.telegram.org/botTOKEN/getWebhookInfo"
```

### Database errors
**Solution:** Delete `news.db` and restart (recreates automatically)

### CORS errors in browser
**Solution:** Backend has CORS enabled, ensure `ngrok-skip-browser-warning` header is set

---

## 🔄 Continuous Deployment

### GitHub Actions (Recommended)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        run: |
          npm install -g netlify-cli
          netlify deploy --prod --auth ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## 📞 Support

For deployment issues:
1. Check Render logs: `render.com` → Dashboard → Logs
2. Check Netlify logs: `netlify.com` → Deploys
3. Test API health: `curl https://backend-url/health`
4. Check Telegram webhook: `curl https://api.telegram.org/botTOKEN/getWebhookInfo`

---

**Last Updated:** November 10, 2025
**Status:** Ready for Production Deployment

