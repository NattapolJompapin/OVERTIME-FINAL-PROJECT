# cd UPDensity_ProgramPackage\central
# python generate_DensityCount_dummy.py

import mysql.connector
from datetime import datetime, timedelta
import random

# -------------------------
# CONFIG
# -------------------------
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "Chizo1412Za@",
    "database": "BusStop"
}

CAMERAS = ["CAM01", "CAM02", "CAM03", "CAM04"]

START_TIME = datetime(2026, 2, 27, 7, 0, 0)
END_TIME   = datetime(2026, 3, 8, 22, 0, 0)
INTERVAL   = timedelta(seconds=60)  # 5 นาท4

# -------------------------
# ช่วงเวลาหนาแน่นของแต่ละกล้อง
# -------------------------
CAM_PEAK_TIMES = {
    "CAM01": ["07:30", "10:00", "13:00", "15:30"],
    "CAM02": ["07:00", "10:00", "13:30", "15:30", "16:30"],
    "CAM03": ["08:00", "10:00", "13:00", "15:00", "17:00"],
    "CAM04": ["11:00", "13:30", "15:30", "17:30", "18:30"]
}

PEAK_WINDOW_MIN = 15  # นาทีรอบช่วงพีค

# -------------------------
# ฟังก์ชันเช็คว่าช่วงนี้พีคไหม
# -------------------------
def is_peak_time(camera_id, current_time):
    for t in CAM_PEAK_TIMES[camera_id]:
        peak_time = datetime.strptime(t, "%H:%M").time()
        peak_dt = current_time.replace(hour=peak_time.hour, minute=peak_time.minute)

        if abs((current_time - peak_dt).total_seconds()) <= PEAK_WINDOW_MIN * 60:
            return True
    return False

# -------------------------
# สุ่มจำนวนคนตามกล้อง + เวลา
# -------------------------
def generate_passenger_count(camera_id, current_time):
    hour = current_time.hour

    # 😴 คนน้อยมาก (เช้า / ดึก)
    if hour < 8 or hour >= 21:
        return random.randint(0, 5)

    # 🔥 ช่วงหนาแน่นของกล้องนั้น
    if is_peak_time(camera_id, current_time):
        return random.randint(25, 62)

    # 🙂 ช่วงปกติ
    return random.randint(2, 19)

# -------------------------
# MAIN
# -------------------------
def main():
    print("🚀 Start generating dummy data...")

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("✅ Connected to DB")

    # ล้างข้อมูลเก่า
    cursor.execute("TRUNCATE TABLE DensityCount;")
    conn.commit()
    print("🧹 Old data cleared")

    rows = []
    current_time = START_TIME
    dc_num = 1

    while current_time <= END_TIME:
        for cam in CAMERAS:
            rows.append((
                f"DC{dc_num:06d}",
                cam,
                generate_passenger_count(cam, current_time),
                current_time
            ))
            dc_num += 1
        current_time += INTERVAL

    print(f"📦 Prepared {len(rows)} rows, inserting...")

    cursor.executemany("""
        INSERT INTO DensityCount
            (DensityCount_ID, Camera_ID, PassengerCount, Timestamp)
        VALUES (%s, %s, %s, %s)
    """, rows)

    conn.commit()
    cursor.close()
    conn.close()
    print("🎉 Done! Dummy data generated successfully")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("❌ Error:", e)
