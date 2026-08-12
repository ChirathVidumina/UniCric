import json
import os
import sys

# Import functions from backend/main.py
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))
from main import get_eastern_vs_colombo_scorecard, update_players_from_parsed_scorecard, save_to_database

json_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "sl_universities_2026.json")

scorecard_data = get_eastern_vs_colombo_scorecard("Scorecard_#01.pdf")

# Update SQLite DB
save_to_database(scorecard_data, "match_1")

# Update JSON Dataset
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

if "completedMatchScorecards" not in data:
    data["completedMatchScorecards"] = {}

data["completedMatchScorecards"]["match_1"] = scorecard_data
data["tournament"]["completedMatches"] = 1

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

# Update players incrementally
update_players_from_parsed_scorecard(scorecard_data, json_path)

with open(json_path, "r", encoding="utf-8") as f:
    updated = json.load(f)
    print(f"Match #1 Ingestion Successful!")
    print(f"Total Ingested Players: {len(updated.get('players', []))}")
    for p in updated.get("players", []):
        print(f"  [{p['team']}] {p['name']} - {p['role']} ({p['runs']} runs, {p['wickets']} wkts)")
