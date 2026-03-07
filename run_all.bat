@echo off
echo ===============================
echo  START UPDENSITY SYSTEM
echo ===============================

REM ---------- 1. Express Server ----------
start "Express Server" cmd /k ^
cd /d "JSServer" ^&^& ^
node server.js

REM ---------- 2. React Dashboard ----------
start "React Dashboard" cmd /k ^
cd /d "Dashboard React" ^&^& ^
npm start

REM ---------- 3. Central API (FastAPI) ----------
start "Central API" cmd /k ^
cd /d "UPDensity_ProgramPackage" ^&^& ^
call venv\Scripts\activate ^&^& ^
cd central ^&^& ^
python -m uvicorn main:app --host 0.0.0.0 --port 3001

REM ---------- 4. Edge Camera ----------
start "Edge Camera" cmd /k ^
cd /d "UPDensity_ProgramPackage" ^&^& ^
call venv\Scripts\activate ^&^& ^
cd edge ^&^& ^
python edge_multi.py

echo.
echo === SYSTEM STARTED ===
echo Double-click STOP.bat to shutdown
pause