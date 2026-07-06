@echo off
echo ========================================
echo Push to GitHub - IronPort Learning
echo ========================================
echo.

cd "%~dp0"

echo Git repository is ready!
echo Commit: 2b53cd0
echo Files: 27 files, 13033 lines of code
echo.

echo ========================================
echo STEP 1: Create GitHub Repository
echo ========================================
echo.
echo 1. Go to: https://github.com/new
echo 2. Repository name: ironport-learning
echo 3. Description: IronPort Email Security Training Platform
echo 4. Make it: Private (or Public)
echo 5. DON'T initialize with README
echo 6. Click "Create repository"
echo.
pause
echo.

echo ========================================
echo STEP 2: What's your GitHub repository URL?
echo ========================================
echo.
echo Example: https://github.com/YOUR_USERNAME/ironport-learning.git
echo.
set /p REPO_URL="Enter your repository URL: "
echo.

if "%REPO_URL%"=="" (
    echo Error: No URL provided!
    pause
    exit /b 1
)

echo ========================================
echo STEP 3: Pushing to GitHub...
echo ========================================
echo.

echo Adding remote...
git remote add origin %REPO_URL%

echo Renaming branch to main...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo Authentication Required
    echo ========================================
    echo.
    echo If you see an error, you may need to:
    echo 1. Install GitHub CLI: https://cli.github.com/
    echo 2. Or use GitHub Desktop: https://desktop.github.com/
    echo 3. Or set up SSH keys: https://docs.github.com/en/authentication
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Code is on GitHub!
echo ========================================
echo.
echo Your repository: %REPO_URL%
echo.

echo ========================================
echo STEP 4: Deploy to Vercel
echo ========================================
echo.
echo Now let's connect to Vercel...
echo.
echo 1. Go to: https://vercel.com/new
echo 2. Click "Import Git Repository"
echo 3. Select: ironport-learning
echo 4. Click "Import"
echo 5. Click "Deploy"
echo.
echo OR run: DEPLOY-NOW.bat
echo.

pause

echo.
echo Would you like to deploy to Vercel now? (Y/N)
set /p DEPLOY="Deploy now? "

if /i "%DEPLOY%"=="Y" (
    echo.
    echo Deploying to Vercel...
    vercel --prod
    echo.
    echo ========================================
    echo DEPLOYMENT COMPLETE!
    echo ========================================
    echo.
    echo Share the URL above with your team!
    echo.
)

pause
