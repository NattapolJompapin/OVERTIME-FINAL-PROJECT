import cv2
import time
import requests
from polars import count
from ultralytics import YOLO
from datetime import datetime
from datetime import datetime, time as dtime
from linebot import LineBotApi
from linebot.models import TextSendMessage
from db import update_camera_status


# -------------------------
# CONFIG
MODEL_PATH = "best.pt"
CONF_THRES = 0.4

SEND_INTERVAL = 3     # ส่งข้อมูลทุก 3 วินาที
FRAME_DELAY = 0.5     # หน่วงเวลาอ่าน frame
THRESHOLD_PEOPLE = 1    # จำนวนคน 20
NOTIFY_DURATION = 5    # 5 นาที (300 วินาที)
NOTIFY_COOLDOWN = 600    # 10 นาที (600 วินาที)


CENTRAL_API = "http://127.0.0.1:3001/api/edge/report"

BUSSTOP_STATION = {
    "CAM01": "วิศวะ",
    "CAM02": "วิทยาศาสตร์",
    "CAM03": "ศิลปศาสตร์",
    "CAM04": "PKY"
}




# -------------------------
# LINE CONFIG
LINE_ACCESS_TOKEN = '0iiRb0axQnJMbY6b/jDMzfojYs7w0ptSbACYdibZNv9IpoKvicVfhyz4RYZYEbYkXNA/GcBjnCcpx6qM7M4yZgmXf0f9ijwYuhptcnCDbxkXoo0UuirWL5hj4uumImPzwtwHR6JKRWQ5c91POqD4PQdB04t89/1O/w1cDnyilFU='
USER_ID = 'U1b9c7df6010f35ba385d56552332d286'
line_bot_api = LineBotApi(LINE_ACCESS_TOKEN)



# -------------------------
# LOAD YOLO MODEL
model = YOLO(MODEL_PATH)

def is_operating_time():
    """กล้องทำงานเฉพาะ 07:00 - 22:00"""
    now = datetime.now().time()
    return dtime(3, 0) <= now < dtime(22, 00)

# -------------------------
# SEND DATA TO CENTRAL
def send_to_central(camera_id, people_count):
    """ส่งข้อมูลไป Central Server"""
    payload = {
        "Camera_ID": camera_id,
        "PassengerCount": int(people_count)
    }
    try:
        requests.post(CENTRAL_API, json=payload, timeout=3)
        print(
            f"    {camera_id} | {int(people_count)} คน | "
            f"{datetime.now().strftime('%H:%M:%S')}"
        )
    except Exception as e:
        print(f"[DB ERROR] {camera_id} : {e}")

# -------------------------
# SEND LINE notify
def send_line_notify(camera_id, people_count):
    bus_stop_name = BUSSTOP_STATION.get(camera_id, camera_id)
    message = (
        f"🚨 แจ้งเตือนความหนาแน่นผู้โดยสาร\n"
        f"📍 ป้าย: {bus_stop_name}\n"
        f"👥 จำนวนคน: {int(people_count)} คน"
    )
    try:
        line_bot_api.push_message(
            USER_ID,
            TextSendMessage(text=message)
        )
        print(f"[LINE] แจ้งเตือนสำเร็จ : {camera_id}")
    except Exception as e:
        print(f"[LINE ERROR] {e}")


# -------------------------
# notify LOGIC
def check_and_send_notify(camera_id, people_count, state):
    """แจ้งเตือนเมื่อจำนวนคนเกิน threshold ต่อเนื่อง"""
    now = time.time()

    # -------------------------
    # เกิน threshold
    # -------------------------
    if people_count >= THRESHOLD_PEOPLE:

        # เริ่มจับเวลา
        if state["start_time"] is None:
            state["start_time"] = now
            return

        # เกิน 5 นาที
        if now - state["start_time"] >= NOTIFY_DURATION:

            # เช็ค cooldown 10 นาที
            if (
                state["last_notify_time"] is None or
                now - state["last_notify_time"] >= NOTIFY_COOLDOWN
            ):
                send_line_notify(camera_id, people_count)
                state["last_notify_time"] = now

            # รีเซ็ตตัวจับเวลา (รอรอบใหม่)
            state["start_time"] = None

    # -------------------------
    # ต่ำกว่า threshold → reset

    else:
        state["start_time"] = None

# -------------------------
# RECONNECT CAMERA
def reconnect_camera(camera_id, url):
    print(f"[!] {camera_id} : reconnecting camera...")
    time.sleep(0.5)
    return cv2.VideoCapture(url)

# -------------------------
# MAIN CAMERA LOOP
def run_camera(camera_id, url):
    print(f"[{camera_id}] Starting camera:", url)
    # เปิดกล้อง / detect / ส่ง DB

    cap = cv2.VideoCapture(url)
    if cap.isOpened():
        time.sleep(3) # ถ้ากล้องหลุดให้รอ 5 วิแล้วลองใหม่
        print(f"[✓] {camera_id} started")
        update_camera_status(camera_id, "Active")
    else:
        print(f"[✗] {camera_id} failed to start")
        update_camera_status(camera_id, "Unactive")
        return

    last_send_time = time.time()
    person_counts = []

    notify_state = {
        "start_time": None,        # เวลาเริ่มเกิน threshold
        "last_notify_time": None    # เวลาแจ้งเตือนล่าสุด (cooldown)
    }

    try:
        while True:
            ret, frame = cap.read()
            # ==========================
            # ⏰ CHECK OPERATING TIME
            # ตรวจสอบว่ากล้องยังส่งภาพอยู่หรือไม่
            if not is_operating_time():
                if cap.isOpened():
                    print(f"[{camera_id}] ⏸ Stop camera (22:00)")
                    cap.release()
                    update_camera_status(camera_id, "Inactive")

                time.sleep(60)   # เช็คเวลาใหม่ทุก 1 นาที
                continue

            # ==========================
            # ▶ OPEN CAMERA (07:00)
            if not cap.isOpened():
                print(f"[{camera_id}] ▶ Resume camera (07:00)")
                cap = cv2.VideoCapture(url)
                time.sleep(2)

                if cap.isOpened():
                    update_camera_status(camera_id, "Active")
                else:
                    time.sleep(5)
                    continue

            ret, frame = cap.read()
            if not ret:
                print(f"[!] {camera_id} disconnected")
                cap.release()
                time.sleep(2)
                continue

            # ==========================
            # YOLO DETECTION
            results = model(frame, conf=CONF_THRES, verbose=False)
            current_count = len(results[0].boxes)
            person_counts.append(current_count)

            # ==========================
            # SEND DATA
            if time.time() - last_send_time >= SEND_INTERVAL:
                avg_people = sum(person_counts) / len(person_counts)
                send_to_central(camera_id, avg_people)
                check_and_send_notify(camera_id, avg_people, notify_state)

                person_counts.clear()
                last_send_time = time.time()

            time.sleep(FRAME_DELAY)

    except KeyboardInterrupt:
        print(f"[!] {camera_id} stopping")

    finally:
        cap.release()
        update_camera_status(camera_id, "Inactive")
        print(f"[✓] {camera_id} stopped")
