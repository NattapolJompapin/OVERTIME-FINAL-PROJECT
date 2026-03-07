from ultralytics import YOLO

def test_model():
    model = YOLO("model/passenger_model.pt")

    metrics = model.val(
        data="dataset/data.yaml",
        imgsz=640,
        conf=0.3,
        iou=0.5,
        device="cpu"
    )

    print("\n====== TEST RESULT ======")
    print(f"Mean Precision (mP) : {metrics.box.mp:.4f}")
    print(f"Mean Recall    (mR) : {metrics.box.mr:.4f}")
    print(f"mAP@0.5             : {metrics.box.map50:.4f}")
    print(f"mAP@0.5:0.95        : {metrics.box.map:.4f}")

    # F1 เป็น list ต่อ class
    if metrics.box.f1 is not None:
        f1_mean = sum(metrics.box.f1) / len(metrics.box.f1)
        print(f"Mean F1-score       : {f1_mean:.4f}")

if __name__ == "__main__":
    test_model()
