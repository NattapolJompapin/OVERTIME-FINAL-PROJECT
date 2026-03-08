from multiprocessing import Process, freeze_support
from camera_worker import run_camera

# -------------------------
# CAMERA CONFIGURATION

# key   = Camera_ID (ใช้ตรงกับ DB)
# value = stream source (URL หรือ device index)
CAMERAS = {
    "CAM01": "http://100.66.186.93:8080/video",  # IP Camera
    "CAM02": 0,                                   # Webcam / USB Camera
    "CAM03": "rtsp://admin:L2120C9E@192.168.50.96:554/cam/realmonitor?channel=1&subtype=0",
    "CAM04": "rtsp://admin:L2120C9E@192.168.50.96:554/cam/realmonitor?channel=1&subtype=1"
}


def start_camera_process(camera_id, stream_url):
    """สร้าง Process แยกสำหรับกล้องแต่ละตัว  1 camera = 1 process"""
    process = Process(
        target=run_camera,
        args=(camera_id, stream_url),
        daemon=True
    )
    process.start()
    return process

# -------------------------
# MAIN
if __name__ == "__main__":
    print("[@] Starting multi-camera detection system")

    processes = []

    for cam_id, url in CAMERAS.items():
        print(f"[+] Launching {cam_id} ...")
        p = start_camera_process(cam_id, url)
        processes.append(p)

    try:
        # ทำให้ main process ยังทำงานอยู่
        # และรอ child processes ทั้งหมด
        for p in processes:
            p.join()

    except KeyboardInterrupt:
        # กรณีกด Ctrl + C
        print("\n[!] Stopping all camera processes...")

        for p in processes:
            p.terminate()   # สั่งหยุด process
            p.join()

        print("[✓] All processes stopped safely")