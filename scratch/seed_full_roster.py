import json
import os
import re

json_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "sl_universities_2026.json")
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

scorecards = data.get("completedMatchScorecards", {})
teams = data.get("tournament", {}).get("teams", [])

# Mapping team codes and names
team_code_map = {
    "UOM": "University of Moratuwa",
    "UOP": "University of Peradeniya",
    "VAV": "Vavuniya University",
    "UOJ": "Jaffna University",
    "UOC": "Colombo University",
    "UOK": "Kelaniya University",
    "USJP": "Sri Jayawardenapura University",
    "RUH": "Ruhunu University",
    "SAB": "Sabaragamuwa University",
    "WAY": "Wayamba University",
    "RAJ": "Rajarata University",
    "GWU": "Gampaha Wickramarachchi Uni",
    "UVPA": "Visual & Performing Arts Uni",
    "SEUSL": "South Eastern University",
    "EUSL": "Eastern University",
    "UVW": "Uva Wellassa University"
}

# Collect all extracted player data by team
players_by_team = {code: [] for code in team_code_map.keys()}

def clean_name(name):
    clean = re.sub(r"\s*\((?:c|C|wk|WK|LHB|RHB|sub|\†).*?\)", "", name).strip()
    clean = re.sub(r"^\†\s*", "", clean).strip()
    return clean

def detect_role(is_wk, runs, overs, wickets):
    if is_wk:
        return "Wicketkeeper Batter"
    elif overs > 0 and runs > 15:
        return "All-Rounder"
    elif overs > 0:
        return "Bowler"
    else:
        return "Batter"

def detect_icon(role):
    if "Wicketkeeper" in role:
        return "🧤"
    elif "All-Rounder" in role:
        return "⚡"
    elif "Bowler" in role:
        return "🎯"
    else:
        return "🏏"

# 1. Process scorecards
for match_key, sc in scorecards.items():
    in1 = sc.get("innings1", {})
    in2 = sc.get("innings2", {})
    
    for inn in [in1, in2]:
        team_str = inn.get("team", "")
        # Find team code
        team_code = None
        for code, tname in team_code_map.items():
            if code in team_str or tname in team_str:
                team_code = code
                break
        if not team_code:
            continue
            
        batting = inn.get("batting", [])
        bowling = inn.get("bowling", [])
        
        # Batters
        for b in batting:
            p_raw = b.get("player") or b.get("player_name") or ""
            if not p_raw: continue
            name = clean_name(p_raw)
            is_wk = "(wk)" in p_raw.lower() or "(wk)" in b.get("dismissal", "").lower() or "†" in p_raw or "†" in b.get("dismissal", "")
            is_c = "(c)" in p_raw.lower()
            runs = int(b.get("runs", 0))
            balls = int(b.get("balls", 0))
            fours = int(b.get("fours", 0))
            sixes = int(b.get("sixes", 0))
            sr = float(b.get("sr", b.get("strike_rate", 0)))
            
            # Check if already added
            existing = next((p for p in players_by_team[team_code] if p["name"] == name), None)
            if existing:
                existing["runs"] = max(existing["runs"], runs)
                existing["hs"] = str(runs)
                existing["sr"] = max(existing["sr"], sr)
                if is_wk: existing["role"] = "Wicketkeeper Batter"
            else:
                role = detect_role(is_wk, runs, 0, 0)
                players_by_team[team_code].append({
                    "name": name + (" (C)" if is_c else ""),
                    "team": team_code,
                    "role": role,
                    "matches": 1,
                    "runs": runs,
                    "avg": float(runs),
                    "sr": sr if sr > 0 else (round((runs/balls)*100, 2) if balls > 0 else 0.0),
                    "hs": str(runs),
                    "wickets": 0,
                    "econ": 0.0,
                    "bb": "-",
                    "boundaryPct": round(((fours*4 + sixes*6)/runs)*100, 1) if runs > 0 else 0.0,
                    "dotPct": round((1 - (fours+sixes)/balls)*100, 1) if balls > 0 else 40.0,
                    "icon": detect_icon(role)
                })

        # Bowlers
        for bw in bowling:
            p_raw = bw.get("bowler") or bw.get("player_name") or ""
            if not p_raw: continue
            name = clean_name(p_raw)
            is_c = "(c)" in p_raw.lower()
            overs = float(bw.get("overs", 0))
            wickets = int(bw.get("wickets", 0))
            runs_conceded = int(bw.get("runs", bw.get("runs_conceded", 0)))
            econ = float(bw.get("econ", bw.get("economy", 0)))
            
            existing = next((p for p in players_by_team[team_code] if p["name"].replace(" (C)", "") == name), None)
            if existing:
                existing["wickets"] = wickets
                existing["econ"] = econ
                existing["bb"] = f"{wickets}/{runs_conceded}"
                if existing["runs"] > 15 and wickets > 0:
                    existing["role"] = "All-Rounder"
                elif wickets > 0 and existing["runs"] <= 15:
                    existing["role"] = "Bowler"
                existing["icon"] = detect_icon(existing["role"])
            else:
                role = "Bowler"
                players_by_team[team_code].append({
                    "name": name + (" (C)" if is_c else ""),
                    "team": team_code,
                    "role": role,
                    "matches": 1,
                    "runs": 0,
                    "avg": 0.0,
                    "sr": 0.0,
                    "hs": "0*",
                    "wickets": wickets,
                    "econ": econ,
                    "bb": f"{wickets}/{runs_conceded}",
                    "boundaryPct": 0.0,
                    "dotPct": 75.0,
                    "icon": detect_icon(role)
                })

print("Extracted players from scorecards by team:")
for code, plist in players_by_team.items():
    print(f"  {code}: {len(plist)} players")
