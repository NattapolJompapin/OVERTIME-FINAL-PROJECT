import tkinter as tk
from tkinter import ttk
import subprocess
import threading
import os
import signal

# -------------------------
# CONFIG PATH (แก้ให้ตรงเครื่องคุณ)
# BASE = r"D:\UP3_2-68\PROJECT4-68\GitHub"

COMMANDS = {
    "Express Server": [
        # f"cd /d {BASE}\\JSServer",
        f"cd /d JSServer",
        "node server.js"
    ],
    "React Dashboard": [
        # f"cd /d \"{BASE}\\Dashboard React\"",
        f"cd /d \"Dashboard React\"",
        "npm start"
    ],
    "Central API": [
        # f"cd /d {BASE}\\UPDensity_ProgramPackage",
        f"cd /d UPDensity_ProgramPackage",
        "venv\\Scripts\\activate",
        "cd central",
        "python -m uvicorn main:app --host 0.0.0.0 --port 3001"
    ],
    "Edge Camera": [
        # f"cd /d {BASE}\\UPDensity_ProgramPackage",
        f"cd /d UPDensity_ProgramPackage",
        "venv\\Scripts\\activate",
        "cd edge",
        "python edge_multi.py"
    ]
}

processes = {}

# -------------------------
def run_process(name, text_widget):
    """รัน process และ stream log เข้า UI"""
    cmd = " && ".join(COMMANDS[name])

    process = subprocess.Popen(
        cmd,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    processes[name] = process

    for line in process.stdout:
        text_widget.insert(tk.END, f"[{name}] {line}")
        text_widget.see(tk.END)

# -------------------------
def start_all():
    for name in COMMANDS:
        threading.Thread(
            target=run_process,
            args=(name, log_box),
            daemon=True
        ).start()

# -------------------------
def stop_all():
    for name, p in processes.items():
        try:
            p.terminate()
        except:
            pass
    log_box.insert(tk.END, "\n[SYSTEM] All processes stopped\n")

# -------------------------
# UI
root = tk.Tk()
root.title("UPDensity System Launcher")
root.geometry("900x600")

frame = ttk.Frame(root, padding=10)
frame.pack(fill="both", expand=True)

btn_frame = ttk.Frame(frame)
btn_frame.pack(fill="x")

start_btn = ttk.Button(btn_frame, text="▶ START SYSTEM", command=start_all)
start_btn.pack(side="left", padx=5)

stop_btn = ttk.Button(btn_frame, text="⏹ STOP SYSTEM", command=stop_all)
stop_btn.pack(side="left", padx=5)

log_box = tk.Text(frame, height=30, bg="black", fg="lime")
log_box.pack(fill="both", expand=True)

log_box.insert(tk.END, "=== UPDensity Launcher Ready ===\n")

root.mainloop()
