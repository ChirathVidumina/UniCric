import os
import glob
import json

root_dir = os.path.join(os.path.dirname(__file__), "..")

# 1. Remove all SQLite .db and .sqlite files
db_files = glob.glob(os.path.join(root_dir, "**", "*.db"), recursive=True) + glob.glob(os.path.join(root_dir, "**", "*.sqlite"), recursive=True)

deleted_count = 0
for dbf in db_files:
    try:
        os.remove(dbf)
        print(f"Deleted database file: {dbf}")
        deleted_count += 1
    except Exception as e:
        print(f"Error removing {dbf}: {e}")

# 2. Reset sl_universities_2026.json
json_path = os.path.join(root_dir, "src", "data", "sl_universities_2026.json")
if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    data["players"] = []
    data["completedMatchScorecards"] = {}
    if "tournament" in data:
        data["tournament"]["completedMatches"] = 0

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Reset JSON database: {json_path}")

print(f"ALL DATABASE FILES REMOVED SUCCESSFULLY! (Total {deleted_count} DB files deleted). System is a 100% BLANK SLATE.")
