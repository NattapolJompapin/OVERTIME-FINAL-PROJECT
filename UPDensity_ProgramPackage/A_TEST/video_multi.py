from multiprocessing import Process
import os
from video_worker import run_video

VIDEO_DIR = "videos"
OUTPUT_DIR = "outputs"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def main():
    processes = []

    for file in os.listdir(VIDEO_DIR):
        if file.endswith((".mp4", ".avi", ".mov")):
            video_path = os.path.join(VIDEO_DIR, file)
            p = Process(
                target=run_video,
                args=(video_path, OUTPUT_DIR)
            )
            p.start()
            processes.append(p)

    for p in processes:
        p.join()

    print("All videos processed.")

if __name__ == "__main__":
    main()
