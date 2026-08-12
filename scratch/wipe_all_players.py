import json
import os

json_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "sl_universities_2026.json")
if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    data["players"] = []
    data["completedMatchScorecards"] = {}
    
    if "tournament" in data:
        data["tournament"]["completedMatches"] = 0
        data["tournament"]["totalMatches"] = len(data["tournament"].get("schedule", []))
        data["tournament"]["totalTeams"] = 16

        # Reset all groups team standings to 0 / empty
        for group in data["tournament"].get("groups", []):
            for team in group.get("teams", []):
                team["played"] = 0
                team["won"] = 0
                team["lost"] = 0
                team["draw"] = 0
                team["tie"] = 0
                team["nr"] = 0
                team["nrr"] = "0.000"
                team["for"] = "-"
                team["against"] = "-"
                team["points"] = 0
                team["last5"] = []

        # Reset tournament teams list if present
        for team in data["tournament"].get("teams", []):
            team["played"] = 0
            team["won"] = 0
            team["lost"] = 0
            team["nrr"] = "0.000"
            team["for"] = "-"
            team["against"] = "-"
            team["points"] = 0
            if "group" in team:
                team["ranking"] = team["group"]

        # Clear schedule items completely
        data["tournament"]["schedule"] = []

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print("ALL DATA (PLAYERS, MATCHES, SCORECARDS, STANDINGS, SCHEDULE TIMELINE) WIPED SUCCESSFULLY! Dataset is now a 100% BLANK slate.")

