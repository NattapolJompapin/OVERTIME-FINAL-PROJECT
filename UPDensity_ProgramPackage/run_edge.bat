@echo off
echo.
echo ==============================
echo      START EDGE SYSTEM
echo ==============================
echo.

REM ไปที่โฟลเดอร์โปรเจค (ตำแหน่งไฟล์ .bat)
cd /d %~dp0

REM เข้า virtual environment activate venv
call venv\Scripts\activate

REM เข้าโฟลเดอร์ edge
cd edge

echo [INFO] Running edge system...
echo [INFO] Press CTRL+C to stop
echo.

REM รันระบบกล้อง
python edge_multi.py

pause