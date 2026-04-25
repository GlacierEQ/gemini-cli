import os
import json
import datetime
from dotenv import load_dotenv
from powerhouse.pillars.gemini_pillar import GeminiPillar
from powerhouse.logic.power_teams import DevGeniusTeam, ArchivalTeam, NarrativeTeam

class RelevanceRouter:
    """
    The Relevance Router splits a global intent into specific sub-intents
    and routes them to the relevant 'PowerTeam' structures.
    It manages the M2A lifecycle and compiles responses back for the Piston.
    """
    def __init__(self):
        load_dotenv()
        self.gemini = GeminiPillar(os.getenv("GEMINI_API_KEY"))
        self.teams = {
            "dev_genius": DevGeniusTeam(),
            "archival": ArchivalTeam(),
            "narrative": NarrativeTeam()
        }

    def process_intent(self, global_intent):
        print(f"\n========================================================")
        print(f"🧭 [ROUTER] Incoming Global Intent: '{global_intent}'")
        print(f"========================================================\n")
        
        # 1. Analyze Relevance
        print("   [Router] Consulting Intelligence Pillar (Gemini) for relevance mapping...")
        prompt = f"Analyze this global intent and determine which teams need to be involved: 'dev_genius' (code/git), 'archival' (data logs), and/or 'narrative' (documentation). Respond with a JSON array of team keys ONLY. Intent: {global_intent}"
        
        # Fallback routing logic if Gemini API is failing
        try:
            team_keys_raw = self.gemini.read(prompt)
            # Naive parsing for simulation purposes
            active_keys = []
            for key in self.teams.keys():
                if key in team_keys_raw.lower() or "simulated" in team_keys_raw.lower():
                    active_keys.append(key)
        except Exception:
            print("   [Router] Intelligence mapping degraded. Routing to ALL teams.")
            active_keys = list(self.teams.keys())
            
        if not active_keys:
            active_keys = list(self.teams.keys()) # Default broadcast

        print(f"   [Router] Relevance mapping complete. Active Teams: {active_keys}\n")
        
        # 2. Dispatch to PowerTeams
        master_response = {
            "timestamp": datetime.datetime.now().isoformat(),
            "global_intent": global_intent,
            "team_responses": {}
        }
        
        for key in active_keys:
            team = self.teams[key]
            print(f"🚀 Dispatching to {team.name}...")
            response = team.process_and_respond(global_intent, self.gemini)
            master_response["team_responses"][key] = response
            print(f"   [Router] Received response from {team.name}.\n")

        # 3. Final Compilation
        print(f"🎯 [ROUTER] Intent processing complete. Compiled Master Response for Piston.")
        return master_response

if __name__ == "__main__":
    router = RelevanceRouter()
    
    sample_intent = "CRITICAL: Upgrade the quantum encryption hashing algorithm in core_engine.py and log this major security milestone in the registry."
    
    final_output = router.process_intent(sample_intent)
    
    print("\n--- MASTER COMPILED RESPONSE ---")
    print(json.dumps(final_output, indent=2))
