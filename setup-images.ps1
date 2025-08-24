# Setup script for Dynamic Image Management System
Write-Host "Setting up Dynamic Image Management System..." -ForegroundColor Green

# Create images directory structure
$imagesDir = "backend\images"
$demoDir = "$imagesDir\demo"

Write-Host "Creating directory structure..." -ForegroundColor Yellow
if (!(Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force
    Write-Host "Created: $imagesDir" -ForegroundColor Green
}

if (!(Test-Path $demoDir)) {
    New-Item -ItemType Directory -Path $demoDir -Force
    Write-Host "Created: $demoDir" -ForegroundColor Green
}

Write-Host "`nDirectory structure created successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Add your images to: $demoDir" -ForegroundColor White
Write-Host "2. Install backend dependencies: cd backend && npm install" -ForegroundColor White
Write-Host "3. Start the backend: npm run dev" -ForegroundColor White
Write-Host "4. Start the frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "5. Access admin panel: http://localhost:5173/admin?c=demo" -ForegroundColor White
Write-Host "6. Test the system: http://localhost:5173/?c=demo" -ForegroundColor White

Write-Host "`nSupported image formats: JPG, PNG, GIF, WebP" -ForegroundColor Yellow
Write-Host "File size limit: 10MB per image" -ForegroundColor Yellow
Write-Host "First image uploaded becomes the default selected image" -ForegroundColor Yellow
