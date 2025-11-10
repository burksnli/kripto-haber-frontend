# 🚀 Kripto Haber Mobil - Cryptocurrency News App

A modern React Native + Expo web application for cryptocurrency news, price tracking, and portfolio management. Built with Telegram bot integration for real-time news updates.

## 🌟 Features

### 📱 Web Application
- **News Feed** - Real-time cryptocurrency news from Telegram bot
- **Price Tracking** - Live crypto prices via CoinGecko API
- **Portfolio** - Track your cryptocurrency investments
- **Price Alerts** - Set custom price notifications
- **Crypto Converter** - Quick currency conversion
- **Market Analysis** - Market insights and trends
- **Settings** - Customizable app preferences

### 🤖 Telegram Bot Integration
- **@Kripto_Haber_Mobil_Bot** - Automated bot for news distribution
- Webhook-based message receiving
- Real-time synchronization with web app
- SQLite database persistence

### 🔧 Backend Services
- Node.js + Express server
- RESTful API endpoints
- Telegram webhook handling
- SQLite database for news storage
- CORS enabled for web integration

---

## 📋 Requirements

- Node.js >= 14.0.0
- npm >= 6.0.0
- Expo CLI (for web builds)
- Telegram Bot Token (from @BotFather)

---

## 🚀 Quick Start

### 1. Web Application

```bash
cd kriptohaber
npm install
netlify deploy --prod
```

**Live URL:** https://kriptoanlikhaber.netlify.app

### 2. Backend Server

```bash
cd kriptohaber/backend
npm install
npm start
```

**Default Port:** 3001

Environment Variables:
```
PORT=3001
TELEGRAM_BOT_TOKEN=your_bot_token_here
NODE_ENV=development
```

### 3. Telegram Webhook

```bash
curl -X POST "https://api.telegram.org/bot{TOKEN}/setWebhook" \
  -d "url=https://your-backend-url/api/telegram-webhook"
```

---

## 📁 Project Structure

```
kriptohaber/
├── app/                      # React Native + Expo app
│   ├── (tabs)/              # Tab-based navigation
│   │   ├── home.tsx         # Home screen
│   │   ├── news.tsx         # News feed
│   │   ├── prices.tsx       # Price tracking
│   │   ├── portfolio.tsx     # Portfolio management
│   │   ├── alerts.tsx       # Price alerts
│   │   ├── converter.tsx     # Crypto converter
│   │   └── settings.tsx      # App settings
│   └── ...
├── backend/                  # Node.js backend
│   ├── server.js            # Express server
│   ├── routes/
│   │   └── telegram.js      # Telegram webhook routes
│   ├── news.db              # SQLite database
│   └── package.json
├── context/                  # React context APIs
│   └── PortfolioContext.tsx # Portfolio state management
├── public/
│   └── _redirects           # Netlify routing config
├── netlify.toml             # Netlify deployment config
└── package.json
```

---

## 🔌 API Endpoints

### News API
```
GET /api/news
```
Returns all stored news from database

**Response:**
```json
{
  "ok": true,
  "count": 5,
  "news": [
    {
      "id": "telegram_123_timestamp",
      "title": "Bitcoin Yükselişe Geçti",
      "body": "Bitcoin fiyatı 100.000 doları aştı...",
      "timestamp": "2025-11-10T08:59:09.000Z",
      "source": "Telegram Bot",
      "emoji": "📱"
    }
  ]
}
```

### Telegram Webhook
```
POST /api/telegram-webhook
```
Receives messages from Telegram bot

### Health Check
```
GET /health
```
Server status verification

---

## 🗄️ Database Schema

**SQLite Table: news**
```sql
CREATE TABLE news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT,
  emoji TEXT,
  raw_message TEXT
)
```

---

## 🚀 Deployment

### Web (Netlify)
```bash
cd kriptohaber
netlify deploy --prod
```

### Backend (Render, Railway, or Heroku)

**Using Render.com:**
1. Push code to GitHub
2. Connect repository to Render
3. Deploy as Node service
4. Set environment variables
5. Update webhook URL in Telegram

---

## 📱 Mobile Builds

### Android APK
```bash
cd kriptohaber
eas build --platform android --local
```

### iOS App
```bash
cd kriptohaber
eas build --platform ios --local
```

---

## 🔑 Environment Variables

Create `.env` file in backend directory:
```
PORT=3001
TELEGRAM_BOT_TOKEN=8332306740:AAEgCNn6OavmfgbeRvybmntV0tW1bdnknBY
NODE_ENV=development
```

---

## 🛠️ Tech Stack

- **Frontend:** React Native + Expo
- **Backend:** Node.js + Express
- **Database:** SQLite
- **API:** REST
- **Deployment:** Netlify (Web), Ngrok/Railway (Backend)
- **Bot:** Telegram Bot API
- **Data Source:** CoinGecko API

---

## 📊 Current Status

✅ **Completed:**
- Web application live on Netlify
- Backend with SQLite persistence
- Telegram bot integration
- Real-time news synchronization
- Portfolio tracking
- Price alerts system
- Crypto converter

⏳ **In Progress:**
- Production backend deployment
- Push notifications
- User authentication
- Advanced analytics

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues or questions, please create an issue in the repository.

**Bot:** @Kripto_Haber_Mobil_Bot
**Web:** https://kriptoanlikhaber.netlify.app
**API:** https://f9685de9efc0.ngrok-free.app (test)

---

**Made with ❤️ by Burak**
