@echo off
setlocal enabledelayedexpansion

echo ========================================
echo IronPort Learning - Complete Deployment
echo ========================================
echo.
echo This will:
echo 1. Authenticate with GitHub
echo 2. Create repository
echo 3. Push code
echo 4. Deploy to Vercel
echo 5. Give you the live URL
echo.
pause

cd "%~dp0"

REM ========================================
REM STEP 1: GitHub Authentication
REM ========================================
echo.
echo ========================================
echo STEP 1: GitHub Authentication
echo ========================================
echo.

echo Checking GitHub authentication...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo Not authenticated. Opening browser for login...
    echo.
    gh auth login
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: GitHub authentication failed!
        echo Please try again.
        pause
        exit /b 1
    )
) else (
    echo ✓ Already authenticated with GitHub
)

echo.
gh auth status
echo.

REM ========================================
REM STEP 2: Create GitHub Repository
REM ========================================
echo.
echo ========================================
echo STEP 2: Creating GitHub Repository
echo ========================================
echo.

set REPO_NAME=ironport-learning
set REPO_DESC=IronPort Email Security Training Platform - 50+ Quizzes, Multi-user, Mobile Ready

echo Creating repository: %REPO_NAME%
echo Description: %REPO_DESC%
echo.

gh repo create %REPO_NAME% --private --description "%REPO_DESC%" --source=. --remote=origin --push
if %errorlevel% neq 0 (
    echo.
    echo Repository might already exist. Trying to push...
    echo.

    REM Get GitHub username
    for /f "delims=" %%i in ('gh api user -q .login') do set GH_USER=%%i

    echo Adding remote...
    git remote remove origin 2>nul
    git remote add origin https://github.com/!GH_USER!/%REPO_NAME%.git

    echo Pushing to GitHub...
    git push -u origin main --force

    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to push to GitHub!
        echo.
        echo Please check:
        echo 1. Repository name is available
        echo 2. You have push permissions
        echo 3. Try manually: gh repo create %REPO_NAME%
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ✓ Code pushed to GitHub successfully!
echo.

REM Get the repository URL
for /f "delims=" %%i in ('gh repo view --json url -q .url') do set REPO_URL=%%i
echo Repository URL: !REPO_URL!
echo.

REM ========================================
REM STEP 3: Vercel Deployment
REM ========================================
echo.
echo ========================================
echo STEP 3: Deploying to Vercel
echo ========================================
echo.

echo Checking Vercel authentication...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Not authenticated. Opening browser for login...
    echo.
    vercel login
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Vercel authentication failed!
        pause
        exit /b 1
    )
) else (
    echo ✓ Already authenticated with Vercel
)

echo.
echo Deploying to production...
echo This may take 2-3 minutes...
echo.

vercel --prod --yes

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Vercel deployment failed!
    echo.
    echo Please check:
    echo 1. Vercel account has available projects
    echo 2. No syntax errors in code
    echo 3. Try manually: vercel --prod
    echo.
    pause
    exit /b 1
)

REM ========================================
REM SUCCESS!
REM ========================================
echo.
echo ========================================
echo 🎉 DEPLOYMENT SUCCESSFUL! 🎉
echo ========================================
echo.

REM Get deployment URL
for /f "delims=" %%i in ('vercel ls --prod 2^>nul ^| findstr "ironport" ^| head -1') do set DEPLOY_URL=%%i

echo Your app is now LIVE at:
echo.
vercel ls --prod | findstr /C:"https://"
echo.

echo ========================================
echo WHAT'S DEPLOYED
echo ========================================
echo.
echo ✓ Frontend: Interactive learning platform
echo ✓ Backend: Multi-user API with authentication
echo ✓ Features: 50+ quizzes, progress tracking, leaderboard
echo ✓ Security: HTTPS enabled, JWT authentication
echo ✓ Performance: Global CDN, instant loading
echo.

echo ========================================
echo SHARE WITH YOUR TEAM
echo ========================================
echo.
echo Copy the URL above and share:
echo.
echo "🎓 IronPort Training Platform - Now Live!"
echo "📚 Access: [YOUR_URL]"
echo "✅ 50+ interactive quizzes"
echo "✅ Track your progress"
echo "✅ Compete on leaderboard"
echo.
echo "Login: admin@ironport.local"
echo "Password: admin123"
echo "(Change this after first login!)"
echo.

echo ========================================
echo NEXT STEPS
echo ========================================
echo.
echo 1. Visit your deployment URL
echo 2. Create your admin account
echo 3. Share URL with team
echo 4. Start training!
echo.
echo GitHub: !REPO_URL!
echo Vercel: https://vercel.com/dashboard
echo.

echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.

pause
