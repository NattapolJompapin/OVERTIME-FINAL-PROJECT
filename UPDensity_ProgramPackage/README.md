## 🚍 Passenger Density Detection System on Bus Stop Station

**ระบบตรวจจับความหนาแน่นผู้โดยสารบนป้ายรถประจำทางด้วย Computer Vision**  
โครงงานปริญญาตรี สาขาวิทยาการคอมพิวเตอร์  
University of Phayao

---

## 📌 Abstract
โครงงานนี้มีวัตถุประสงค์เพื่อพัฒนาระบบตรวจจับและประเมินความหนาแน่นของผู้โดยสารบริเวณป้ายรถประจำทาง โดยใช้เทคนิค Computer Vision และ Deep Learning ผ่านโมเดล YOLO (You Only Look Once) ระบบสามารถนับจำนวนผู้โดยสารจากภาพกล้อง CCTV แบบเรียลไทม์ และส่งการแจ้งเตือนไปยังผู้ดูแลผ่าน LINE Notify เมื่อความหนาแน่นเกินค่าที่กำหนด เพื่อสนับสนุนการตัดสินใจในการบริหารจัดการระบบขนส่งสาธารณะและลดความแออัด

---

## 🎯 Objectives
- ตรวจจับและนับจำนวนผู้โดยสารจากกล้อง CCTV  
- ประเมินระดับความหนาแน่นของผู้โดยสาร  
- แจ้งเตือนอัตโนมัติเมื่อความหนาแน่นเกินเกณฑ์  
- ประยุกต์ใช้ Deep Learning กับระบบขนส่งสาธารณะ  

---

## 🔍 Scope of the Project
- ใช้กล้อง CCTV แบบ IP Camera เป็นแหล่งข้อมูลภาพ  
- ตรวจจับเฉพาะวัตถุประเภท **Person**  
- ใช้โมเดล YOLO ที่ผ่านการ Fine-tuning  
- ระบบทำงานในสภาพแวดล้อมแบบ Local Server  
- แจ้งเตือนผ่าน LINE Notify  

---

## 🛠 Technologies Used
- **Programming Language**: Python  
- **Deep Learning Model**: YOLO (Ultralytics)  
- **Computer Vision**: OpenCV  
- **Backend Framework**: FastAPI  
- **Database**: MySQL  
- **Notification Service**: LINE Notify  
- **Version Control**: Git & GitHub  

---

## 📁 Project Structure

```
project-root/
├── src/ # Source code หลัก
│ ├── main.py # FastAPI entry point
│ ├── database.py # Database management
│ ├── camera_worker.py # CCTV / Video processing
│ ├── detection.py # YOLO detection logic
│ └── notification.py # LINE Notify
│
├── models/ # Model structure (no .pt files)
│ └── README.md
│
├── website/ # Dashboard / Frontend
├── docs/ # Project documents
├── tests/ # Test files
│
├── .gitignore
├── README.md
└── requirements.txt
```
---
Old
```
project-root/
│
├── src/                    # Source code หลักของระบบ
│   ├── main.py             # Entry point ของระบบ (FastAPI)
│   ├── database.py         # จัดการฐานข้อมูล
│   ├── camera_worker.py    # ดึงภาพจากกล้อง CCTV
│   ├── detection.py        # ประมวลผลการตรวจจับผู้โดยสาร
│   └── notification.py     # ส่งแจ้งเตือน LINE
│
├── models/                 # โครงสร้างโมเดล (ไม่เก็บไฟล์ .pt)
│   └── README.md
│
├── website/                # Frontend / Dashboard
│   ├── index.html
│   ├── css/
│   └── js/
│
├── docs/                   # เอกสารประกอบโครงงาน
│   ├── proposal.pdf
│   ├── final_report.pdf
│   └── system_diagram.png
│
├── tests/                  # ไฟล์ทดสอบระบบ
│   └── test_detection.py
│
├── .gitignore              # กำหนดไฟล์ที่ไม่ต้องการอัปโหลดขึ้น Git
├── README.md               # เอกสารแนะนำโครงงาน
└── requirements.txt        # รายการ library ที่ใช้
```

---

## ▶️ Installation & Usage

1. Clone repository
```bash
git clone https://github.com/username/project-name.git
cd project-name
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Run the system

```bash
python src/main.py
```

---

## ✅ Expected Results
- ระบบสามารถนับจำนวนผู้โดยสารได้อย่างถูกต้อง
- แจ้งเตือนความหนาแน่นของผู้โดยสารแบบอัตโนมัติ
- เป็นต้นแบบการประยุกต์ใช้ AI กับระบบขนส่งสาธารณะ

---

## 👨‍🎓 Authors
* นายณัฐพล จอมภาปิน
* นายอานุภาพ ศรีสุขเจริญชัย
* นายวรยศ ลุนอุดม
* Computer Science Project – University of Phayao

---

## 👩‍🏫 Advisor
* อาจารย์ปวีณา อุ่นลี

---

⚠️ Note
ไฟล์โมเดล, ชุดข้อมูล และวิดีโอจากกล้อง CCTV ไม่ได้ถูกเผยแพร่ใน Repository นี้
