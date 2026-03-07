THRESHOLD = 20

def check_alert(camera_id, count):
    if count > THRESHOLD:
        print(f"🚨 ALERT {camera_id}: {count}")
        # ส่ง LINE Notify / Email ได้ตรงนี้
        