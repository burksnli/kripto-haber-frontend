# 🎯 Kripto Haber Mobil - Başlarken

Hoşgeldiniz! Bu rehber projeyi başlatmak için tüm gerekli adımları içerir.

## 📖 Dökümantasyon Haritası

### 🚀 Hızlı Başlangıç
**Dosya**: `QUICKSTART.md`
- Uygulama nasıl çalıştırılır
- npm komutları
- Expo Go ile test etme

### 📚 Detaylı Rehber
**Dosya**: `README.md`
- Özellikler hakkında detaylı bilgi
- Kurulum talimatları
- Proje yapısı
- API bilgileri
- Özelleştirme kılavuzu

### 📱 Telegram Bot Kurulu
**Dosya**: `TELEGRAM_SETUP.md`
- Telegram bot oluşturma
- Webhook kurulumu
- Backend entegrasyonu
- Firebase Cloud Messaging
- Test etme yöntemleri
- Sorun giderme

### 📋 Proje Özeti
**Dosya**: `PROJECT_SUMMARY.md`
- Tamamlanan özelliklerin tam listesi
- Dosya yapısı ve açıklamaları
- Teknoloji yığını
- API entegrasyonları

## 🎯 5 Dakikada Başlayın

### 1. Terminal'i açın
```powershell
cd C:\Users\bora\kriptohabermobil\kriptohaber
```

### 2. Sunucuyu başlatın
```bash
npm run start
```

### 3. QR kodu taratın
- Expo Go uygulamasını telefonunuza indirin
- Terminalden QR kodunu taratın

### 4. Uyarıyı okuyun
- İlk açılışta disclaimer uyarısını göreceksiniz
- "Anladım" butonuna tıklayın

### 5. Keşfetmeye başlayın
- 4 sekmede gezinin
- Fiyatları göz atın
- Ayarları inceleyin

## 🗂️ Proje Yapısı (Basit Anlatım)

```
📁 kriptohaber
├── 📁 app              (Uygulamanın ana sayfaları)
│  ├── _layout.tsx      (Uyarı ve bildirimler)
│  └── (tabs)/
│     ├── index.tsx     (Fiyatlar - CoinGecko API)
│     ├── news.tsx      (Haberler - Telegram)
│     ├── info.tsx      (Kripto para bilgisi)
│     └── settings.tsx  (Ayarlar - tema ve bildirimler)
│
├── 📁 services         (Uygulamayı güçlendiren işlemler)
│  └── notificationService.ts  (Bildirimler ve Telegram)
│
├── 📁 components       (Yeniden kullanılabilir parçalar)
│  ├── Themed.tsx       (Tema renkleri)
│  └── useColorScheme.ts (Gece/gündüz modu)
│
└── 📄 Döküman dosyaları
   ├── README.md              (Detaylı rehber)
   ├── QUICKSTART.md          (Hızlı başlangıç)
   ├── TELEGRAM_SETUP.md      (Telegram konfigürasyonu)
   └── PROJECT_SUMMARY.md     (Teknik özet)
```

## ✨ Sekmeler ve Özellikleri

### 💰 Fiyatlar Sekmesi
- Top 20 kripto paraların fiyatlarını göster
- CoinGecko'dan gerçek zamanlı veri
- Aşağıya çekip yenileme
- ⚠️ Disclaimer uyarısı

### 📰 Haberler Sekmesi
- Telegram botundan haberler al
- Cihazda haberleri sakla (50 adede kadar)
- Bildirim al
- ⚠️ Disclaimer uyarısı

### 📚 Bilgi Sekmesi
- Kripto para eğitimi
- Blockchain bilgisi
- Güvenlik ipuçları
- Risk uyarıları
- ⚠️ Disclaimer uyarısı

### ⚙️ Ayarlar Sekmesi
- Bildirimleri aç/kapat
- Gece modunu göz atın
- Uygulama bilgileri
- Yasal uyarılar
- ⚠️ Disclaimer uyarısı

## 🔔 Disclaimer & Uyarılar

**Önemli**: Uygulama açılırken otomatik disclaimer uyarısı gösterilir.

Her sayfanın üstünde **sarı uyarı bandı** olur:
```
⚠️ Bu bilgiler yatırım tavsiyesi değildir.
```

## 🌙 Gece Modu

Telefonunuzun sistem ayarını değiştirdiğinizde:
- ☀️ Gündüz modu = Açık tema
- 🌙 Gece modu = Koyu tema

Otomatik olarak değişir, ayar yoktur!

## 📱 Telegram Haberlerini Etkinleştirme

Tamamen opsiyonel ama harika bir özellik!

1. `TELEGRAM_SETUP.md` dosyasını açın
2. Bot oluşturun (@BotFather)
3. Backend webhook ayarlayın
4. Bildirimleri aç (Ayarlar sekmesi)
5. Haberler otomatik olarak gelir

## 🔧 Geliştirici İçin Faydalı Bilgiler

### Dosyaları Düzenleme
- **Ana sayfalar**: `app/(tabs)/` klasöründe
- **Ayarlar**: `app/(tabs)/settings.tsx`
- **Bildirimler**: `services/notificationService.ts`
- **Renkler**: `constants/Colors.ts`

### Kodu Çalıştırırken Hata Alırsam
1. `npm install` çalıştırın
2. Expo Go'yu güncelle
3. Terminal'i kapatıp yeniden aç
4. `npm run start` komutunu yeniden çalıştırın

### Stil Değiştirmek
Her ekrandaki `StyleSheet.create()` bölümünü düzenleyin.

## 📊 Teknoloji

- **React Native**: Mobil uygulama framework
- **Expo**: Hızlı geliştirme ortamı
- **TypeScript**: Daha güvenli kod
- **AsyncStorage**: Cihazda veri saklama

## ❓ Sık Sorulan Sorular

### Q: Hangi platformlarda çalışır?
**A**: iOS, Android, Web (Expo sayesinde)

### Q: İnternet bağlantısı gerekli mi?
**A**: Fiyatlar için evet, haberler için opsiyonel (cihazda saklanır)

### Q: Şifreli mi?
**A**: Bildirim ve ayarlar cihazda saklanır, ağda gönderilmez

### Q: Nasıl özelleştirebilirim?
**A**: README.md dosyasında özelleştirme kısmını okuyun

### Q: Ücretsiz mi?
**A**: Evet, CoinGecko API ve Expo ücretsizdir

## 📞 Destek ve Sorular

Her sorular için:
1. README.md'yi kontrol edin
2. TELEGRAM_SETUP.md'yi kontrol edin
3. Yorumlarda açıklamalar var

## 🎉 Hazır Mısınız?

1. Terminal'i açın
2. `npm run start` yazın
3. QR kodunu taratın
4. Keşfetmeye başlayın!

---

**Sürüm**: 1.0.0
**Durum**: ✅ Hazır Kullanım İçin
**Dil**: 🇹🇷 Türkçe
