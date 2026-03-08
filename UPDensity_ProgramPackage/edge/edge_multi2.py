from multiprocessing import Process, freeze_support
import cv2
from camera_worker import run_camera


# -------------------------
# CAMERA CONFIGURATION
CAMERAS = {
    "CAM01": "http://100.66.186.93:8080/video",
    "CAM02": 0,
    "CAM03": "rtsp://admin:L2120C9E@192.168.50.96:554/cam/realmonitor?channel=1&subtype=0",
    "CAM04": "rtsp://admin:L2120C9E@192.168.50.96:554/cam/realmonitor?channel=1&subtype=1"
}


# -------------------------
# camera detection process
def start_camera_process(camera_id, stream_url):

    process = Process(
        target=run_camera,
        args=(camera_id, stream_url),
        daemon=True
    )

    process.start()
    return process


# -------------------------
# viewer process (แสดงภาพ)
def view_camera(camera_id, stream_url):

    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():
        print(f"[!] Cannot open {camera_id}")
        return

    while True:

        ret, frame = cap.read()
        if not ret:
            continue

        cv2.imshow(camera_id, frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyWindow(camera_id)


# -------------------------
# MAIN
if __name__ == "__main__":

    freeze_support()

    print("[@] Starting multi-camera detection system")

    processes = []

    # 1️⃣ รัน detection ของกล้องก่อน
    for cam_id, url in CAMERAS.items():

        print(f"[+] Launching detection {cam_id}")
        p = start_camera_process(cam_id, url)
        processes.append(p)

    # 2️⃣ รัน viewer ของกล้อง
    for cam_id, url in CAMERAS.items():

        print(f"[+] Launching viewer {cam_id}")
        p = Process(
            target=view_camera,
            args=(cam_id, url),
            daemon=True
        )

        p.start()
        processes.append(p)

    try:

        for p in processes:
            p.join()

    except KeyboardInterrupt:

        print("\n[!] Stopping all camera processes...")

        for p in processes:
            p.terminate()
            p.join()

        print("[✓] All processes stopped safely")