# QR Social Share - Quick Deploy Script
# Run this script to deploy your app to Vercel

Write-Host "🚀 QR Social Share - Quick Deploy" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>$null
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if logged in
try {
    $vercelWhoami = vercel whoami 2>$null
    Write-Host "✅ Logged in as: $vercelWhoami" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Vercel first:" -ForegroundColor Yellow
    Write-Host "   vercel login" -ForegroundColor Cyan
    Write-Host "   Then run this script again." -ForegroundColor Cyan
    Read-Host "Press Enter to continue..."
    exit
}

# Build frontend first
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "   Project will be: qr-social-share" -ForegroundColor Cyan
Write-Host "   Follow the prompts below:" -ForegroundColor Cyan
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Setup Supabase database (see DEPLOYMENT.md)" -ForegroundColor Cyan
Write-Host "2. Add environment variables in Vercel dashboard" -ForegroundColor Cyan
Write-Host "3. Test your live app!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app will be live at: https://qr-social-share.vercel.app" -ForegroundColor Green
