import os
import json
import datetime

class MorpheusIngester:
    """
    The Morpheus Engine (Behavioral Ingester).
    Captures user intents and interaction patterns to evolve the system's personality.
    """
    def __init__(self):
        self.home = os.path.expanduser("~")
        self.cortex_path = os.path.join(self.home, "apex/mastermind/.shadow/cortex/")
        self.personalization_file = os.path.join(self.cortex_path, "personalization.json")
        os.makedirs(self.cortex_path, exist_ok=True)

    def ingest_intent(self, intent):
        """Saves intent pattern for system metamorphosis."""
        print(f"🧬 [MORPHEUS] Ingesting behavioral signal: '{intent[:50]}...'")
        
        data = self._load_data()
        
        # Append new signal
        entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "intent_signature": intent
        }
        data["signals"].append(entry)
        
        # Keep only the last 100 signals for memory efficiency
        data["signals"] = data["signals"][-100:]
        
        # Self-Evolve: If specific keywords appear, update system profile
        if "international" in intent.lower():
            data["profile"]["jurisdiction"] = "INTERNATIONAL"
        if "stealth" in intent.lower():
            data["profile"]["operating_mode"] = "LOW_VISIBILITY"

        self._save_data(data)
        print("   ✅ [MORPHEUS] System profile metamorphosed.")

    def _load_data(self):
        if os.path.exists(self.personalization_file):
            with open(self.personalization_file, "r") as f:
                return json.load(f)
        return {"profile": {"status": "INITIALIZING"}, "signals": []}

    def _save_data(self, data):
        with open(self.personalization_file, "w") as f:
            json.dump(data, f, indent=4)

if __name__ == "__main__":
    ingester = MorpheusIngester()
    ingester.ingest_intent("Example intent to test metamorphosis.")
