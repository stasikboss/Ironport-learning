@echo off
echo ========================================
echo IronPort Learning - Vercel Deployment
echo ========================================
echo.

cd "%~dp0"

echo Step 1: Checking Vercel CLI...
vercel --version
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)
echo.

echo Step 2: Login to Vercel
echo This will open your browser...
echo.
vercel login
if %errorlevel% neq 0 (
    echo Login failed! Please try again.
    pause
    exit /b 1
)
echo.

echo Step 3: Deploying to Production...
echo.
echo Your app will be deployed to:
echo https://[your-project-name].vercel.app
echo.

vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your app is now live!
echo.
echo Next steps:
echo 1. Copy the deployment URL shown above
echo 2. Share it with your team
echo 3. Login with: admin@ironport.local / admin123
echo.
echo Full documentation: DEPLOY-TO-VERCEL.md
echo.

pause
