# cd UPDensity_ProgramPackage\central
# python generate_DensityDetection_dummy.py

import mysql.connector
from datetime import datetime, timedelta
import random

# -------------------------
# CONFIG
# -------------------------
DB_CONFIG = {
    "host": "26.21.101.45",
    "port": 3306,
    "user": "root",
    "password": "Chizo1412Za@",
    "database": "BusStop"
}

CAMERAS = ["CAM01", "CAM02", "CAM03", "CAM04"]

START_TIME = datetime(2026, 1, 31, 7, 0, 0)
END_TIME   = datetime(2026, 1, 31, 22, 0, 0)


# -------------------------
# MAIN
# -------------------------
def main():
    print("🎲 Generate dummy data (same timestamp)")

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)

    # 🔥 สุ่มเวลาแค่ครั้งเดียว
    delta = END_TIME - START_TIME
    random_seconds = random.randint(0, int(delta.total_seconds()))
    same_timestamp = START_TIME + timedelta(seconds=random_seconds)

    print(f"🕒 Timestamp used for all cameras: {same_timestamp}")

    for i, cam in enumerate(CAMERAS, start=1):

        passenger_count = random.randint(0, 40)

        cursor.execute("""
            SELECT Detection_ID
            FROM DensityDetection
            WHERE Camera_ID = %s
        """, (cam,))
        result = cursor.fetchone()

        if result is None:
            # INSERT
            detection_id = f"DD{i:04d}"
            cursor.execute("""
                INSERT INTO DensityDetection
                    (Detection_ID, Camera_ID, PassengerCount, Timestamp)
                VALUES (%s, %s, %s, %s)
            """, (
                detection_id,
                cam,
                passenger_count,
                same_timestamp
            ))
            print(f"➕ INSERT {cam}")

        else:
            # UPDATE
            cursor.execute("""
                UPDATE DensityDetection
                SET PassengerCount = %s,
                    Timestamp = %s
                WHERE Camera_ID = %s
            """, (
                passenger_count,
                same_timestamp,
                cam
            ))
            print(f"♻️ UPDATE {cam}")

    conn.commit()
    cursor.close()
    conn.close()

    print("✅ Dummy data generated (one-time, same timestamp)")

if __name__ == "__main__":
    main()
