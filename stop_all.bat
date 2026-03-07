@echo off
echo ===============================
echo  STOP UPDENSITY SYSTEM
echo ===============================

echo Stopping Node.js servers...
taskkill /F /IM node.exe >nul 2>&1

echo Stopping Python services...
taskkill /F /IM python.exe >nul 2>&1

echo Stopping CMD windows...
taskkill /F /IM cmd.exe >nul 2>&1

echo.
echo === ALL SERVICES STOPPED ===
pause
