# Quick Start Guide - Authentication Fix

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Sportics Authentication Testing Guide" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Start Backend Server" -ForegroundColor Yellow
Write-Host "--------------------------------------"
Write-Host "1. Open a NEW terminal"
Write-Host "2. Run the following commands:"
Write-Host ""
Write-Host "   cd sportics_backend" -ForegroundColor Green
Write-Host "   ..\env\Scripts\Activate.ps1" -ForegroundColor Green
Write-Host "   python manage.py runserver" -ForegroundColor Green
Write-Host ""
Write-Host "   Wait until you see: 'Starting development server at http://127.0.0.1:8000/'"
Write-Host ""

Write-Host "Step 2: Start Frontend Server" -ForegroundColor Yellow
Write-Host "--------------------------------------"
Write-Host "1. Open ANOTHER NEW terminal"
Write-Host "2. Run the following commands:"
Write-Host ""
Write-Host "   cd sportics_backend\frontend" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "   Wait until you see: 'Ready on http://localhost:3000'"
Write-Host ""

Write-Host "Step 3: Test Authentication" -ForegroundColor Yellow
Write-Host "--------------------------------------"
Write-Host "1. Open browser to: http://localhost:3000/register"
Write-Host "2. Create a new account"
Write-Host "3. You should be redirected to dashboard"
Write-Host "4. Try logout and login at: http://localhost:3000/login"
Write-Host ""

Write-Host "Step 4: (Optional) Test Backend API" -ForegroundColor Yellow
Write-Host "--------------------------------------"
Write-Host "Run in a terminal with activated virtual environment:"
Write-Host "   python test_backend.py" -ForegroundColor Green
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Common Issues" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Issue: Port already in use" -ForegroundColor Red
Write-Host "Solution: Kill the process using the port or use a different port"
Write-Host ""
Write-Host "Issue: Module not found" -ForegroundColor Red
Write-Host "Solution: Make sure virtual environment is activated and run 'pip install -r requirements.txt'"
Write-Host ""
Write-Host "Issue: npm command not found" -ForegroundColor Red
Write-Host "Solution: Install Node.js from https://nodejs.org/"
Write-Host ""

Write-Host "For detailed troubleshooting, see: AUTHENTICATION_FIX.md" -ForegroundColor Cyan
Write-Host ""
