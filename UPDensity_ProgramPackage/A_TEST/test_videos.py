import os
import cv2
from ultralytics import YOLO

VIDEO_DIR = "videos"
GT_DIR = "ground_truth"
OUTPUT_DIR = "outputs"

os.makedirs(OUTPUT_DIR, exist_ok=True)

model = YOLO("best.pt")

def load_ground_truth(gt_path):
    gt = []
    with open(gt_path, "r") as f:
        next(f)  # skip header
        for line in f:
            _, count = line.strip().split(",")
            gt.append(int(count))
    return gt

def calculate_metrics(gt_counts, pred_counts):
    TP = FP = FN = 0

    for gt, pred in zip(gt_counts, pred_counts):
        if pred >= gt:
            TP += gt
            FP += pred - gt
        else:
            TP += pred
            FN += gt - pred

    precision = TP / (TP + FP) if (TP + FP) else 0
    recall = TP / (TP + FN) if (TP + FN) else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0

    return precision, recall, f1

def test_video(video_path):
    name = os.path.splitext(os.path.basename(video_path))[0]
    gt_path = os.path.join(GT_DIR, f"{name}.txt")

    gt_counts = load_ground_truth(gt_path)
    pred_counts = []

    cap = cv2.VideoCapture(video_path)
    frame_id = 0

    while True:
        ret, frame = cap.read()
        if not ret or frame_id >= len(gt_counts):
            break

        results = model(frame, conf=0.5)
        people = sum(1 for b in results[0].boxes if int(b.cls) == 0)
        pred_counts.append(people)

        frame_id += 1

    cap.release()

    precision, recall, f1 = calculate_metrics(gt_counts, pred_counts)

    with open(f"{OUTPUT_DIR}/{name}_metrics.txt", "w") as f:
        f.write(f"Precision: {precision:.3f}\n")
        f.write(f"Recall: {recall:.3f}\n")
        f.write(f"F1-score: {f1:.3f}\n")

    print(f"[{name}] Precision={precision:.3f} Recall={recall:.3f} F1={f1:.3f}")

if __name__ == "__main__":
    for file in os.listdir(VIDEO_DIR):
        if file.endswith((".mp4", ".avi", ".mov")):
            test_video(os.path.join(VIDEO_DIR, file))
