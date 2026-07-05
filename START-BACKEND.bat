@echo off
echo ========================================
echo Starting IronPort Learning Backend
echo ========================================
echo.

cd "%~dp0backend"

echo Starting server on http://localhost:3000
echo.
echo Admin login:
echo   Email: admin@ironport.local
echo   Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

pause
