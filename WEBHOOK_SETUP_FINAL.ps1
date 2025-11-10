# 🚀 WEBHOOK SETUP - FINAL STEP
# Deploy tamamlandıktan sonra bu scripti çalıştır!

# Telegram Bot Token
$token = "8332306740:AAEgCNn6OavmfgbeRvybmntV0tW1bdnknBY"

# Production Backend URL (Render'dan alacaksın)
# RENDER URL'sini değiştir: https://kriptohaber-backend.onrender.com
$url = "https://kriptohaber-backend.onrender.com/api/telegram-webhook"

Write-Host "🚀 Telegram Webhook Güncellemesi Başlıyor..." -ForegroundColor Green
Write-Host "Token: $token" -ForegroundColor Cyan
Write-Host "Webhook URL: $url" -ForegroundColor Cyan
Write-Host ""

# Webhook'u set et
$body = @{
    url = $url
} | ConvertTo-Json

Write-Host "📝 Webhook URL'sini Telegram'a gönderiliyor..." -ForegroundColor Yellow

$response = Invoke-WebRequest -Uri "https://api.telegram.org/bot$token/setWebhook" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

Write-Host "✅ Response:" -ForegroundColor Green
Write-Host $response.Content -ForegroundColor Cyan
Write-Host ""

# Webhook Info'yu kontrol et
Write-Host "🔍 Webhook Bilgisi Kontrol Ediliyor..." -ForegroundColor Yellow
Write-Host ""

$info = Invoke-WebRequest -Uri "https://api.telegram.org/bot$token/getWebhookInfo" `
  -Method POST

Write-Host "✅ Webhook Info:" -ForegroundColor Green
Write-Host $info.Content -ForegroundColor Cyan

Write-Host ""
Write-Host "🎉 Webhook Kurulumu Tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "Kontrol Etmeniz Gerekenler:" -ForegroundColor Yellow
Write-Host "1. Telegram Bot'a mesaj gönder" -ForegroundColor White
Write-Host "2. Render'da logs'ta mesajı görüp görmediğini kontrol et" -ForegroundColor White
Write-Host "3. Web app'de (https://kriptoanlikhaber.netlify.app) haberler sekmesini kontrol et" -ForegroundColor White
Write-Host ""
Write-Host "Hepsi görünüyor mu? Tamamdır! 🎊" -ForegroundColor Green

