@echo off
echo.
echo ==============================
echo     START CENTRAL SERVER
echo ==============================
echo.

REM ไปที่โฟลเดอร์โปรเจค (ตำแหน่งไฟล์ .bat)
cd /d "%~dp0UPDensity_ProgramPackage"

REM เข้า virtual environment activate venv
call venv\Scripts\activate

REM เข้าโฟลเดอร์ central
cd central

echo [INFO] Running central server...
echo [INFO] Press CTRL+C to stop
echo.

REM รัน FastAPI ด้วย uvicorn
python -m uvicorn main:app --host 0.0.0.0 --port 8000

pause
