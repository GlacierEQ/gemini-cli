import time
import subprocess
from pathlib import Path

def run_maximization():
    print("🚀 [MAXIMIZER] Perpetual System Optimization Active...")
    while True:
        # Check for environment drift and sync keys
        subprocess.run(["python3", "~/gemini_config/gemini_maximizer.py"], capture_output=True)
        # Verify Gauntlet health
        subprocess.run(["python3", "~/gemini_config/gauntlet.py"], capture_output=True)
        # Sleep for 1 hour before next sweep
        time.sleep(3600)

if __name__ == "__main__":
    run_maximization()
