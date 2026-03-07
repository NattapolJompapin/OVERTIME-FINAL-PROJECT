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

# ⭐ ปรับช่วงวันตรงนี้ [วันเริ่ม : วันสิ้นสุด]
DATE_RANGE = ("2026-01-16", "2026-02-26")

DAY_START_HOUR = 7
DAY_END_HOUR = 22
INTERVAL = timedelta(minutes=5)

# -------------------------
# ช่วงเวลาหนาแน่นของแต่ละกล้อง
# -------------------------
CAM_PEAK_TIMES = {
    "CAM01": ["07:30", "10:00", "13:00", "15:30"],
    "CAM02": ["07:00", "10:00", "13:30", "15:30", "16:30"],
    "CAM03": ["08:00", "10:00", "13:00", "15:00", "17:00"],
    "CAM04": ["11:00", "13:30", "15:30", "17:30", "18:30"]
}

PEAK_WINDOW_MIN = 15

# -------------------------
# helper: loop วัน
# -------------------------
def daterange(start_date, end_date):
    for n in range((end_date - start_date).days + 1):
        yield start_date + timedelta(n)

# -------------------------
# เช็คช่วงพีค
# -------------------------
def is_peak_time(camera_id, current_time):
    for t in CAM_PEAK_TIMES[camera_id]:
        peak = datetime.strptime(t, "%H:%M").time()
        peak_dt = current_time.replace(hour=peak.hour, minute=peak.minute)

        if abs((current_time - peak_dt).total_seconds()) <= PEAK_WINDOW_MIN * 60:
            return True

    return False

# -------------------------
# สุ่มจำนวนคน
# -------------------------
def generate_passenger_count(camera_id, current_time):
    hour = current_time.hour

    if hour < 8 or hour >= 21:
        return random.randint(0, 5)

    if is_peak_time(camera_id, current_time):
        return random.randint(25, 40)

    return random.randint(5, 15)

# -------------------------
# MAIN
# -------------------------
def main():
    print("🚀 Start generating dummy data...")

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    print("✅ Connected to DB")

    cursor.execute("TRUNCATE TABLE DensityCount;")
    conn.commit()

    print("🧹 Old data cleared")

    start_date = datetime.strptime(DATE_RANGE[0], "%Y-%m-%d").date()
    end_date = datetime.strptime(DATE_RANGE[1], "%Y-%m-%d").date()

    rows = []
    dc_num = 1

    for day in daterange(start_date, end_date):
        print(f"📅 Generating {day}")

        current_time = datetime.combine(
            day,
            datetime.min.time()
        ).replace(hour=DAY_START_HOUR, minute=0)

        end_time = current_time.replace(hour=DAY_END_HOUR, minute=0)

        while current_time <= end_time:
            for cam in CAMERAS:
                rows.append((
                    f"DC{dc_num:06d}",
                    cam,
                    generate_passenger_count(cam, current_time),
                    current_time
                ))
                dc_num += 1

            current_time += INTERVAL

    print(f"📦 Inserting {len(rows)} rows...")

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