import os
import datetime
import json
from powerhouse.pillars.airtable_pillar import AirtablePillar
from powerhouse.pillars.notion_pillar import NotionPillar
from powerhouse.pillars.github_pillar import GitHubPillar
from powerhouse.pillars.gemini_pillar import GeminiPillar

class PowerTeam:
    """
    Base class for a specific response unit.
    Each PowerTeam interprets an intent natively and generates a response
    that can be fed back to the Piston or other Teams.
    """
    def __init__(self, name):
        self.name = name
        self.timestamp = datetime.datetime.now().isoformat()

    def process_and_respond(self, intent, gemini_pillar):
        raise NotImplementedError("Must be implemented by specific PowerTeam.")

class DevGeniusTeam(PowerTeam):
    """Handles GitHub execution, code generation, and technical reasoning."""
    def __init__(self):
        super().__init__("DevGenius (GitHub/Code)")
        self.github = GitHubPillar(os.getenv("GITHUB_TOKEN"))

    def process_and_respond(self, intent, gemini_pillar):
        print(f"   [{self.name}] Analyzing intent for technical implications...")
        prompt = f"Analyze this intent and output a JSON response specifying the required 'code_changes', 'architecture_impact', and 'github_issue_title'. Intent: {intent}"
        analysis = gemini_pillar.read(prompt)
        
        response = {
            "team": self.name,
            "status": "Awaiting Execution",
            "technical_analysis": analysis,
            "timestamp": self.timestamp
        }
        print(f"   ✅ [{self.name}] Generated Technical Response.")
        return response

class ArchivalTeam(PowerTeam):
    """Handles Airtable structured logs, historical data, and metrics."""
    def __init__(self):
        super().__init__("Archival (Airtable/Data)")
        self.airtable = AirtablePillar(os.getenv("AIRTABLE_TOKEN"))

    def process_and_respond(self, intent, gemini_pillar):
        print(f"   [{self.name}] Extracting structured metrics from intent...")
        prompt = f"Analyze this intent and output a JSON response with a 3-word 'status_tag' and a 'data_category' for archival. Intent: {intent}"
        analysis = gemini_pillar.read(prompt)
        
        response = {
            "team": self.name,
            "status": "Logged",
            "archival_analysis": analysis,
            "timestamp": self.timestamp
        }
        print(f"   ✅ [{self.name}] Generated Archival Response.")
        return response

class NarrativeTeam(PowerTeam):
    """Handles Notion documentation, project management, and human-readable context."""
    def __init__(self):
        super().__init__("Narrative (Notion/Docs)")
        self.notion = NotionPillar(os.getenv("NOTION_TOKEN"))

    def process_and_respond(self, intent, gemini_pillar):
        print(f"   [{self.name}] Weaving intent into human narrative...")
        prompt = f"Convert this intent into a professional summary suitable for a project management dashboard. Intent: {intent}"
        analysis = gemini_pillar.read(prompt)
        
        response = {
            "team": self.name,
            "status": "Drafted",
            "narrative_content": analysis,
            "timestamp": self.timestamp
        }
        print(f"   ✅ [{self.name}] Generated Narrative Response.")
        return response
