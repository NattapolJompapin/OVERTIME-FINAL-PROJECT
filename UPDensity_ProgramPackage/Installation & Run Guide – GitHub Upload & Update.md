# คู่มือการเชื่อม GitHub และการส่ง/อัปเดตไฟล์

เอกสารนี้อธิบายขั้นตอน **ตั้งแต่เริ่มต้นจนถึงการอัปเดตโค้ดขึ้น GitHub** เหมาะสำหรับใช้งานจริงและส่งประกอบโครงงาน

---

## 1) ตรวจสอบว่ามี Git ติดตั้งหรือไม่

เปิด Command Prompt หรือ PowerShell แล้วพิมพ์

```bash
git --version
```

หากขึ้นเวอร์ชัน แสดงว่าพร้อมใช้งานแล้ว

---

## 2) สร้าง Repository บน GitHub

1. เข้า https://github.com
2. กด **New repository**
3. ตั้งชื่อ Repository (เช่น `UPDensity_ProgramPackage`)
4. เลือก **Public** หรือ **Private**
5. ❌ ไม่ต้องติ๊ก Initialize with README (ถ้ามีโค้ดอยู่แล้ว)
6. กด **Create repository**

---

## 3) เชื่อมโปรเจกต์ในเครื่องกับ GitHub (ครั้งแรก)

ไปที่โฟลเดอร์โปรเจกต์

```bash
cd UPDensity_ProgramPackage
```

### 3.1 เริ่มต้น Git

```bash
git init
```

### 3.2 เพิ่มไฟล์ทั้งหมดเข้า Git

```bash
git add .
```

### 3.3 Commit ครั้งแรก

```bash
git commit -m "Initial project setup"
```

### 3.4 เชื่อมกับ GitHub Repository

```bash
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
```

> เปลี่ยน `USERNAME` และ `REPO_NAME` ให้ตรงกับของคุณ

### 3.5 ส่งโค้ดขึ้น GitHub

```bash
git push -u origin main
```

---

## 4) อัปเดตไฟล์ขึ้น GitHub (ใช้งานประจำ)

ทุกครั้งที่มีการแก้ไขโค้ด ให้ทำตามลำดับนี้

### 4.1 ตรวจสอบไฟล์ที่เปลี่ยน

```bash
git status
```

### 4.2 เพิ่มไฟล์ที่แก้ไข

```bash
git add .
```

หรือเพิ่มเฉพาะไฟล์

```bash
git add central/main.py
```

### 4.3 Commit การเปลี่ยนแปลง

```bash
git commit -m "Update edge-to-central data flow"
```

### 4.4 Push ขึ้น GitHub

```bash
git push
```

---

## 5) กรณี Push ไม่ผ่าน (Remote มีไฟล์อยู่ก่อน)

หากขึ้นข้อความลักษณะนี้:

```text
Updates were rejected because the remote contains work that you do not have locally
```

ให้ดึงโค้ดจาก GitHub มาก่อน

```bash
git pull origin main --allow-unrelated-histories
```

จากนั้นค่อย push ใหม่

```bash
git push
```

---

## 6) ไฟล์ที่ไม่ควรส่งขึ้น GitHub (.gitignore)

สร้างไฟล์ชื่อ `.gitignore` แล้วใส่:

```text
venv/
__pycache__/
*.pyc
.env
*.db
```

จากนั้น commit

```bash
git add .gitignore
git commit -m "Add gitignore"
git push
```

---

## 7) ตรวจสอบผลลัพธ์

- เปิด GitHub Repository
- ตรวจสอบว่าไฟล์อัปเดตตรงกับในเครื่อง
- ใช้หน้า **Commits** ดูประวัติการแก้ไข

---

## หมายเหตุสำหรับงานโครงงาน

- ควร commit บ่อย ๆ และตั้งข้อความ commit ให้สื่อความหมาย
- ใช้ GitHub เป็นหลักฐานการพัฒนาโครงงาน
- README.md ควรอธิบายระบบโดยสรุป

---

📌 คู่มือนี้เหมาะสำหรับ:
- นักศึกษาที่เริ่มใช้ GitHub
- ใช้ส่งโครงงาน
- ใช้งานร่วมกับทีม

