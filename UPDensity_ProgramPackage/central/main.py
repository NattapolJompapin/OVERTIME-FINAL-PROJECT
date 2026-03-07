import mysql.connector
from datetime import datetime
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# -------------------------
# CONFIG DATABASE
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "Chizo1412Za@",
    "database": "BusStop"
}

app = FastAPI()

# เก็บเวลาส่งล่าสุดของแต่ละกล้อง (กัน spam)
last_insert_time = {}

# -------------------------
# Serve static website (dashboard)
app.mount(
    "/website",
    StaticFiles(directory="website", html=True),
    name="website"
)

# -------------------------
# DATABASE UTILITIES
def get_db_connection():
    """เชื่อมต่อฐานข้อมูล"""
    return mysql.connector.connect(**DB_CONFIG)

def generate_densitycount_id(cursor):
    """สร้าง DensityCount_ID รูปแบบ DC000001"""
    cursor.execute("""
        SELECT DensityCount_ID
        FROM DensityCount
        ORDER BY DensityCount_ID DESC
        LIMIT 1
    """)
    row = cursor.fetchone()
    if row is None:
        return "DC000001"
    num = int(row[0][2:])
    return f"DC{num+1:06d}"

def generate_detection_id(cursor):
    """สร้าง Detection_ID เช่น DET001"""
    cursor.execute("""
        SELECT Detection_ID
        FROM DensityDetection
        ORDER BY Detection_ID DESC
        LIMIT 1
    """)
    row = cursor.fetchone()
    if row is None:
        return "DET001"
    num = int(row[0][3:])
    return f"DET{num+1:03d}"

# -------------------------
# API: RECEIVE DATA FROM EDGE
@app.post("/api/edge/report")
def receive_report(data: dict):
    camera_id = data["Camera_ID"]
    passenger_count = int(data["PassengerCount"])
    timestamp = datetime.now()

    # -------------------------
    # CHECK 5 SECONDS RULE
    if camera_id in last_insert_time:
        diff = (timestamp - last_insert_time[camera_id]).total_seconds()
        if diff < 5:
            return {
                "status": "skip",
                "reason": "waiting 5 seconds"
            }

    conn = get_db_connection()
    cursor = conn.cursor()

    # -------------------------
    # (1) INSERT HISTORY DATA → DensityCount
    density_id = generate_densitycount_id(cursor)

    cursor.execute("""
        INSERT INTO DensityCount
            (DensityCount_ID, Camera_ID, PassengerCount, Timestamp)
        VALUES (%s, %s, %s, %s)
    """, (
        density_id,
        camera_id,
        passenger_count,
        timestamp
    ))

    conn.commit()
    cursor.close()
    conn.close()

    # อัปเดตเวลาส่งล่าสุด
    last_insert_time[camera_id] = timestamp

    return {
        "status": "ok",
        "DensityCount_ID": density_id,
        "Camera_ID": camera_id,
        "PassengerCount": passenger_count,
        "Timestamp": timestamp
    }

@app.get("/")
def root():
    return {"message": "Central API running"}

@app.get("/api/dashboard-stats")
def dashboard():
    return {"status": "ok"}