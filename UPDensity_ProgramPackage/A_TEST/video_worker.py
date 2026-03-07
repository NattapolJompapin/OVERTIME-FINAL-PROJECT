import cv2
import time
from ultralytics import YOLO
import os

def run_video(video_path, output_dir):
    video_name = os.path.splitext(os.path.basename(video_path))[0]
    output_file = os.path.join(output_dir, f"{video_name}.txt")

    model = YOLO("best.pt")
    cap = cv2.VideoCapture(video_path)

    last_detect_time = 0
    interval = 5  # ตรวจจับทุก 5 วินาที

    with open(output_file, "w", encoding="utf-8") as f:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            current_time = time.time()

            # ตรวจจับเฉพาะทุก ๆ 5 วินาที
            if current_time - last_detect_time >= interval:
                last_detect_time = current_time

                results = model(frame, conf=0.4, verbose=False)

                people_count = 0
                for r in results:
                    if r.boxes is not None:
                        for cls in r.boxes.cls:
                            if int(cls) == 0:
                                people_count += 1

                timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                f.write(f"{timestamp} | People: {people_count}\n")
                print(f"[{video_name}] {timestamp} → {people_count}")

    cap.release()
    print(f"[DONE] {video_name}")
