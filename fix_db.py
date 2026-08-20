import json
import os

print("Modifying JSON payload...")
with open("tournament_payload.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Replace MOR with UOM in the loaded JSON
for team in data.get("teams", []):
    if team.get("team_id") == "MOR":
        team["team_id"] = "UOM"
        
for match in data.get("matches", []):
    for inning in match.get("innings", []):
        if inning.get("team") == "MOR":
            inning["team"] = "UOM"
            
with open("tournament_payload.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("JSON updated. Deleting unicric.db...")
if os.path.exists("unicric.db"):
    os.remove("unicric.db")

print("Re-ingesting payload...")
os.system("python scripts/ingest_payload.py")
print("Done!")
