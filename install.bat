@echo off
echo ========================================
echo IronPort Learning Platform - Installer
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Ask user what to install
echo What would you like to install?
echo.
echo 1. Backend Server (recommended for teams)
echo 2. Mobile App (Android/iOS development)
echo 3. Both
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto install_backend
if "%choice%"=="2" goto install_mobile
if "%choice%"=="3" goto install_both
if "%choice%"=="4" goto end

echo Invalid choice!
pause
exit /b 1

:install_backend
echo.
echo ========================================
echo Installing Backend Server...
echo ========================================
echo.

if not exist "backend" (
    echo [ERROR] Backend directory not found!
    echo Please make sure you have the complete package.
    pause
    exit /b 1
)

cd backend
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Backend installed successfully!
echo.
echo To start the server, run:
echo   cd backend
echo   npm start
echo.
echo The server will run on http://localhost:3000
echo.

if "%choice%"=="1" goto post_install
goto install_mobile_now

:install_mobile
echo.
echo ========================================
echo Installing Mobile App...
echo ========================================
echo.

:install_mobile_now
if not exist "mobile" (
    echo [ERROR] Mobile directory not found!
    echo Please make sure you have the complete package.
    pause
    exit /b 1
)

cd mobile
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)

echo.
echo Creating www directory...
if not exist "www" mkdir www

echo Copying app files...
call npm run copy

echo.
echo [SUCCESS] Mobile app installed successfully!
echo.
echo Next steps:
echo 1. Install Android Studio (for Android) or Xcode (for iOS)
echo 2. Add platforms:
echo      npm run add:android
echo      npm run add:ios
echo 3. Open in IDE:
echo      npm run android
echo      npm run ios
echo.

goto post_install

:install_both
call :install_backend
cd ..
call :install_mobile_now
cd ..
goto post_install

:post_install
echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Quick Start Guide:
echo.
echo 1. STANDALONE MODE (No setup needed):
echo    - Just open: ironport-app-enhanced.html
echo.

if exist "backend\node_modules" (
    echo 2. WITH BACKEND (Multi-user):
    echo    - cd backend
    echo    - npm start
    echo    - Open ironport-app-enhanced.html
    echo.
)

if exist "mobile\node_modules" (
    echo 3. MOBILE APP:
    echo    - cd mobile
    echo    - npm run add:android ^(or add:ios^)
    echo    - npm run android ^(or ios^)
    echo.
)

echo For detailed instructions, see:
echo - SETUP-GUIDE.md (Quick start)
echo - DEPLOYMENT.md (Full documentation)
echo - WHATS-NEW.md (New features)
echo.

:end
echo Thank you for using IronPort Learning Platform!
echo.
pause
