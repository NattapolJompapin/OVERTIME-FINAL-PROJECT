# UPDensity Program Package

เอกสารนี้เป็น **คู่มือการติดตั้งและรันระบบเบื้องต้น** สำหรับโครงงาน
**ระบบตรวจจับความหนาแน่นผู้โดยสาร (Edge–Central Architecture)**

---

## 1) ตรวจสอบเวอร์ชัน Python

```bash
python --version
```

> แนะนำ Python 3.10 – 3.12

---

## 2) สร้าง Virtual Environment (ครั้งแรกเท่านั้น)

```bash
cd UPDensity_ProgramPackage
python -m venv venv
```

เปิดใช้งาน Virtual Environment

```bash
venv\Scripts\activate
```

---

## 3) ติดตั้ง Dependencies

```bash
pip install numpy==1.26.4 ultralytics opencv-python requests fastapi uvicorn mysql-connector-python
```

---

## 4) ติดตั้งและรัน Central Server

### 4.1 ติดตั้ง FastAPI / Uvicorn (ถ้ายังไม่ได้ติดตั้ง)

```bash
cd UPDensity_ProgramPackage/central
python -m pip install fastapi uvicorn
python -m pip show uvicorn
```

### 4.2 รัน Central Server

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

หรือ (โหมดพัฒนา – auto reload)

```bash
python -m uvicorn main:app --reload
```

> ระบบจะสร้างฐานข้อมูล `passenger.db` (ถ้ามีการใช้งาน SQLite)

---

## 5) เปิด Central Server จาก Root Project

```bash
cd UPDensity_ProgramPackage
python -m uvicorn central.main:app
```

---

## 6) ทดสอบ Central Server

เปิด Virtual Environment

```bash
venv\Scripts\activate
cd central
```

รันเซิร์ฟเวอร์

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

หรือ

```bash
python -m uvicorn main:app --reload
```

### URLs สำหรับทดสอบ

- Swagger API Docs  
  http://127.0.0.1:8000/docs

- กล้องล่าสุด  
  http://127.0.0.1:8000/api/camera/cam01/latest

- Dashboard  
  http://127.0.0.1:8000/dashboard

- Website  
  http://127.0.0.1:8000/website

---

## 7) รันทดสอบ Edge System

```bash
venv\Scripts\activate
cd /d D:\passenger-system
cd edge
python edge_multi.py
```

> Edge จะทำการ:
> - เปิดกล้องหลายตัว (Multi-process)
> - ตรวจจับคนด้วย YOLO
> - ส่งข้อมูลไป Central Server ทุกช่วงเวลา
> - แจ้งเตือนผ่าน LINE (ถ้าเปิดใช้งาน)

---

## หมายเหตุ

- ต้องเปิด **Central Server ก่อน** เสมอ แล้วค่อยเปิด Edge
- หากใช้ MySQL ให้ตรวจสอบค่า `DB_CONFIG` ให้ถูกต้อง
- แนะนำให้รันผ่านไฟล์ `.bat` สำหรับการใช้งานจริง

---

📌 เอกสารนี้ใช้สำหรับอ่านทำความเข้าใจขั้นตอนการติดตั้งและเริ่มต้นระบบ

