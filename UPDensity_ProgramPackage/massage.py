import cv2
import time
import threading
from ultralytics import YOLO
from linebot import LineBotApi
from linebot.models import TextSendMessage

LINE_ACCESS_TOKEN = 'ใส่_ACCESS_TOKEN_ของคุณ'
USER_ID = 'ใส่_USER_ID_ของคุณ'
line_bot_api = LineBotApi(LINE_ACCESS_TOKEN)

STATIONS = {
    "ตึก PKY": "http://192.168.1.101/stream",
    "ตึกศิลปศาสตร์": "http://192.168.1.102/stream",
    "ตึกวิทยาศาสตร์": "http://192.168.1.103/stream",
    "ตึกวิศวะ": "http://192.168.1.104/stream"
}

LIMIT_PEOPLE = 20      # จำนวนคนตั้งแต่ 20 คนขึ้นไป
WAIT_TIME = 300        # รอเช็คซ้ำภายใน 5 นาที (300 วินาที)
COOLDOWN_TIME = 300    # คูลดาวน์หลังส่งแจ้งเตือนสำเร็จ 5 นาที

# เก็บสถานะของแต่ละป้าย
# โครงสร้าง: { "ชื่อป้าย": {"first_detect_time": เวลาที่เจอครั้งแรก, "last_alert_time": เวลาที่แจ้งเตือนล่าสุด} }
status = {name: {"first_detect_time": None, "last_alert_time": 0} for name in STATIONS}

model = YOLO('ชื่อโมเดลเรา')

def send_line_alert(station_name, count):
    """ส่งข้อความแจ้งเตือนเข้า LINE"""
    msg = f"⚠️ แจ้งเตือนความหนาแน่น!\n📍 สถานี: {station_name}\n👥 จำนวนคนปัจจุบัน: {count} คน\n📌 สถานะ: เกินกำหนดต่อเนื่อง 5 นาที"
    try:
        line_bot_api.push_message(USER_ID, TextSendMessage(text=msg))
        print(f"แจ้งเตือนสำเร็จ: {station_name}")
    except Exception as e:
        print(f"Error: {e}")

def process_camera(station_name, url):
    """ฟังก์ชันประมวลผลกล้องแต่ละตัว (จะรันแยก Thread กัน)"""
    global status
    cap = cv2.VideoCapture(url)
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            time.sleep(5) # ถ้ากล้องหลุดให้รอ 5 วิแล้วลองใหม่
            cap = cv2.VideoCapture(url)
            continue

        # ตรวจจับคน (Class 0)
        results = model(frame, classes=[0], conf=0.5, verbose=False, device='0')
        person_count = len(results[0].boxes)
        current_time = time.time()

        # --- Logic การตรวจสอบเงื่อนไข ---
        if person_count >= LIMIT_PEOPLE:
            # ถ้าเพิ่งตรวจเจอครั้งแรก ให้เริ่มจับเวลา
            if status[station_name]["first_detect_time"] is None:
                status[station_name]["first_detect_time"] = current_time
                print(f"[{station_name}] ตรวจพบคนเกินครั้งแรก เริ่มจับเวลา 5 นาที...")
            
            # ถ้าเวลาผ่านไปเกิน 5 นาที และพ้นช่วงคูลดาวน์แล้ว
            elapsed_wait = current_time - status[station_name]["first_detect_time"]
            time_since_last_alert = current_time - status[station_name]["last_alert_time"]

            if elapsed_wait >= WAIT_TIME and time_since_last_alert >= COOLDOWN_TIME:
                send_line_alert(station_name, person_count)
                status[station_name]["last_alert_time"] = current_time
                status[station_name]["first_detect_time"] = None # รีเซ็ตการจับเวลาหลังแจ้งเตือน
        else:
            # ถ้าจำนวนคนลดลงต่ำกว่าเกณฑ์ ให้รีเซ็ตตัวจับเวลา 5 นาที
            if status[station_name]["first_detect_time"] is not None:
                print(f"[{station_name}] จำนวนคนลดลงแล้ว รีเซ็ตตัวจับเวลา")
                status[station_name]["first_detect_time"] = None

        # (Optional) แสดงผลภาพ - ระวังถ้าเปิด 4 จอพร้อมกันอาจจะหนักเครื่อง
        # cv2.imshow(station_name, results[0].plot())
        if cv2.waitKey(1) & 0xFF == ord('q'): break

    cap.release()

# --- เริ่มทำงานแบบ Multi-threading ---
threads = []
for name, url in STATIONS.items():
    t = threading.Thread(target=process_camera, args=(name, url))
    t.daemon = True # ให้ Thread ปิดตัวลงเมื่อโปรแกรมหลักปิด
    threads.append(t)
    t.start()

print("ระบบเริ่มทำงานตรวจจับทั้ง 4 ป้ายรถเมล์...")
try:
    while True: # รักษาให้โปรแกรมหลักทำงานอยู่
        time.sleep(1)
except KeyboardInterrupt:
    print("ปิดระบบ")